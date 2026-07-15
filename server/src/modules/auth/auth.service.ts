import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository } from './repositories/auth.repository';
import { ApiError } from '~/utils/errors';
import { prisma } from '~/config/db';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export class AuthService {
  private generateTokens(userId: string, email: string) {
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
    const existingUser = await authRepository.findByEmail(data.email);
    if (existingUser) {
      throw ApiError.badRequest('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const workspaceName = data.workspaceName || `${data.firstName}'s Workspace`;

    const { user, workspace } = await authRepository.createUserWithWorkspace(
      {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      workspaceName
    );

    const { accessToken, refreshToken } = this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await authRepository.findByEmail(data.email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Fetch user's first workspace membership
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
      },
      workspace: membership ? membership.workspace : null,
      accessToken,
      refreshToken,
    };
  }
}

export const authService = new AuthService();
