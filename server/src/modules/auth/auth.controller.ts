import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '~/config/db';
import { authService } from './auth.service';
import { authRepository } from './repositories/auth.repository';

const COOKIE_NAME = 'refreshToken';

const parseCookies = (cookieHeader: string | undefined): Record<string, string> => {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=').map((c) => c.trim());
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {} as Record<string, string>);
};

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName, workspaceName } = req.body;
      
      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
        workspaceName,
      });

      setRefreshTokenCookie(res, result.refreshToken);

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully. Please verify your email.',
        data: {
          user: result.user,
          workspace: result.workspace,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      
      const result = await authService.login({ email, password });

      setRefreshTokenCookie(res, result.refreshToken);

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: result.user,
          workspace: result.workspace,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        res.status(400).json({
          status: 'error',
          message: 'Verification token is required',
        });
        return;
      }

      await authService.verifyEmail(token);

      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully. You can now log in.',
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const refreshToken = cookies[COOKIE_NAME];

      if (!refreshToken) {
        res.status(401).json({
          status: 'error',
          message: 'Session expired or refresh token is missing',
        });
        return;
      }

      const result = await authService.refresh(refreshToken);

      setRefreshTokenCookie(res, result.refreshToken);

      res.status(200).json({
        status: 'success',
        message: 'Tokens refreshed successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.status(200).json({
        status: 'success',
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const resetToken = await authService.forgotPassword(email);

      res.status(200).json({
        status: 'success',
        message: 'Password reset link sent (simulated)',
        data: { resetToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);

      res.status(200).json({
        status: 'success',
        message: 'Password has been reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async googleSimulated(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = req.body.email || 'google.user@ledgerly.com';
      const firstName = req.body.firstName || 'Google';
      const lastName = req.body.lastName || 'User';
      const workspaceName = req.body.workspaceName || `${firstName}'s Workspace`;
      
      let user = await authRepository.findByEmail(email);
      let workspace;
      if (!user) {
        const result = await authRepository.createUserWithWorkspace({
          email,
          passwordHash: await bcrypt.hash('GooglePasswordMock123!', 10),
          firstName,
          lastName,
          isVerified: true,
        }, workspaceName);
        user = result.user;
        workspace = result.workspace;
      } else {
        const membership = await prisma.workspaceMember.findFirst({
          where: { userId: user.id },
          include: { workspace: true }
        });
        workspace = membership?.workspace;
      }

      const { accessToken, refreshToken } = authService.generateTokens(user.id, user.email);
      setRefreshTokenCookie(res, refreshToken);

      res.status(200).json({
        status: 'success',
        message: 'Google login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isVerified: user.isVerified,
          },
          workspace,
          accessToken,
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
