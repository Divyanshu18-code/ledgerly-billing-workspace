import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authRepository } from './repositories/auth.repository';
import { ApiError } from '~/utils/errors';
import { prisma } from '~/config/db';
import { logMail } from '~/utils/mail';
import { generatePasswordResetHtml, generateVerificationEmailHtml, generate2FAOtpHtml } from '~/utils/mailTemplates';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export class AuthService {
  generateTokens(userId: string, email: string) {
    const accessToken = jwt.sign({ id: userId, email }, JWT_ACCESS_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    const refreshToken = jwt.sign({ id: userId, email }, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });
    return { accessToken, refreshToken };
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    workspaceName?: string;
  }) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const existingUser = await authRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw ApiError.badRequest('Email is already registered. Please sign in instead.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const workspaceName = (data.workspaceName && data.workspaceName.trim()) || `${data.firstName}'s Workspace`;
    
    const isProduction = process.env.NODE_ENV === 'production';
    const isVerified = !isProduction;
    const verificationToken = isProduction ? crypto.randomBytes(32).toString('hex') : null;
    const hashedVerificationToken = verificationToken
      ? crypto.createHash('sha256').update(verificationToken).digest('hex')
      : null;
    const verificationTokenExp = isProduction
      ? new Date(Date.now() + 24 * 60 * 60 * 1000)
      : null;

    const { user, workspace } = await authRepository.createUserWithWorkspace(
      {
        email: normalizedEmail,
        passwordHash,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        isVerified,
        verificationToken: hashedVerificationToken,
        verificationTokenExp,
      },
      workspaceName
    );

    if (!isVerified && verificationToken) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;
      logMail(
        user.email,
        'Verify your email address',
        `Welcome to Ledgerly! Please verify your email by clicking the following link:\n${verificationLink}`
      );
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
      },
    };
  }

  async login(data: { email: string; password: string }) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await authRepository.findByEmail(normalizedEmail);
console.log('AuthService.login - retrieved user:', { id: user?.id, email: user?.email, isVerified: user?.isVerified, loginAttempts: user?.loginAttempts, lockUntil: user?.lockUntil });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw ApiError.forbidden(`Account is temporarily locked. Please try again in ${minutesLeft} minutes.`);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      const loginAttempts = user.loginAttempts + 1;
      const lockUntil = loginAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      await authRepository.updateUser(user.id, { loginAttempts, lockUntil });
      
      if (lockUntil) {
        throw ApiError.forbidden('Account is temporarily locked due to too many failed attempts. Please try again in 15 minutes.');
      }
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isVerified) {
  console.log('AuthService.login - user not verified:', { id: user.id, email: user.email, isVerified: user.isVerified });
      throw ApiError.forbidden('Please verify your email address before logging in');
    }

    // Reset lockout counters on successful login
    await authRepository.updateUser(user.id, { loginAttempts: 0, lockUntil: null });

    // Fetch user's first workspace membership with settings
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: user.id },
      select: {
        workspace: {
          select: {
            id: true,
            name: true,
            settings: {
              select: {
                twoFactorEnabled: true,
              },
            },
          },
        },
      },
    });

    const is2FAEnabled = membership?.workspace?.settings?.twoFactorEnabled ?? false;

    if (is2FAEnabled) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const twoFactorOtpExp = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await authRepository.updateUser(user.id, {
        twoFactorOtp: otpCode,
        twoFactorOtpExp,
      });

      const html = generate2FAOtpHtml(otpCode, user.firstName || 'Valued User');
      logMail(
        user.email,
        `Your 2-Step Verification Code: ${otpCode} - Ledgerly`,
        `Your 2-Step Verification Code is: ${otpCode}. It will expire in 10 minutes.`,
        html
      );

      return {
        requires2FA: true,
        userId: user.id,
        email: user.email,
        message: '2-Step Verification code sent to your email',
      };
    }

    const { accessToken, refreshToken } = this.generateTokens(user.id, user.email);

    return {
      requires2FA: false,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
      },
      workspace: membership ? membership.workspace : null,
      accessToken,
      refreshToken,
    };
  }

  async verify2FA(userId: string, otpCode: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (!user.twoFactorOtp || user.twoFactorOtp !== otpCode.trim()) {
      throw ApiError.badRequest('Invalid 2-Step Verification OTP code');
    }

    if (!user.twoFactorOtpExp || user.twoFactorOtpExp < new Date()) {
      throw ApiError.badRequest('Verification code has expired. Please request a new code.');
    }

    // Clear OTP fields
    await authRepository.updateUser(user.id, {
      twoFactorOtp: null,
      twoFactorOtpExp: null,
    });

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: user.id },
      select: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const { accessToken, refreshToken } = this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
      },
      workspace: membership ? membership.workspace : null,
      accessToken,
      refreshToken,
    };
  }

  async verifyEmail(token: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await authRepository.findByVerificationToken(hashedToken);
    if (!user) {
      throw ApiError.badRequest('Invalid or expired verification token');
    }

    if (user.verificationTokenExp && user.verificationTokenExp < new Date()) {
      throw ApiError.badRequest('Verification link has expired. Please request a new one.');
    }

    await authRepository.updateUser(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExp: null,
    });
  }

  async resendVerification(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await authRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw ApiError.notFound('User with this email does not exist');
    }

    if (user.isVerified) {
      throw ApiError.badRequest('Email is already verified. Please sign in.');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const verificationTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await authRepository.updateUser(user.id, {
      verificationToken: hashedVerificationToken,
      verificationTokenExp,
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;
    const html = generateVerificationEmailHtml(verificationLink, user.firstName || 'Valued User');
    logMail(
      user.email,
      'Verify your email address - Ledgerly Billing',
      `Please verify your email by clicking the following link:\n${verificationLink}`,
      html
    );
  }

  async refresh(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string; email: string };
      const user = await authRepository.findById(decoded.id);
      if (!user) {
        throw ApiError.unauthorized('User session not found');
      }

      if (!user.isVerified) {
        throw ApiError.forbidden('Please verify your email address first');
      }

      const tokens = this.generateTokens(user.id, user.email);
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
        },
        ...tokens,
      };
    } catch (error) {
      throw ApiError.unauthorized('Session expired or invalid token');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await authRepository.findByEmail(email.trim().toLowerCase());
    if (!user) {
      throw ApiError.notFound('User with this email does not exist');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExp = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await authRepository.updateUser(user.id, {
      resetToken: hashedResetToken,
      resetTokenExp,
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;
    const html = generatePasswordResetHtml(resetLink, user.firstName || 'Valued User');
    logMail(
      user.email,
      'Reset your password - Ledgerly Billing',
      `You requested a password reset. Please click the following link to reset your password:\n${resetLink}`,
      html
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await authRepository.findByResetToken(hashedToken);
    if (!user || !user.resetTokenExp || user.resetTokenExp < new Date()) {
      throw ApiError.badRequest('Password reset token is invalid or has expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await authRepository.updateUser(user.id, {
      passwordHash,
      resetToken: null,
      resetTokenExp: null,
    });
  }
}

export const authService = new AuthService();
