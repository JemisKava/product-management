import { TRPCError } from '@trpc/server';
import { AuthRepo } from './auth.repo.ts';
import { comparePassword, hashPassword } from '../../lib/password.ts';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getExpiryDate,
} from '../../lib/jwt.ts';
import { env } from '../../config/env.ts';
import { ALL_PERMISSIONS } from '../../routers/context.ts';
import type { LoginResult, RefreshResult } from './auth.types.ts';

export class AuthService {
  private repo: AuthRepo;

  constructor() {
    this.repo = new AuthRepo();
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.repo.findUserByEmail(email);

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Your account has been suspended. Please contact an administrator.',
      });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    const permissions =
      user.role === 'ADMIN'
        ? [...ALL_PERMISSIONS]
        : user.permissions.map((p) => p.permission.code);

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
    });

    const hashedRefreshToken = await hashPassword(refreshToken);
    await this.repo.createRefreshToken(
      user.id,
      hashedRefreshToken,
      getExpiryDate(env.JWT_REFRESH_EXPIRES)
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      permissions,
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken: string | undefined): Promise<{ success: boolean }> {
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        await this.repo.revokeRefreshTokens(decoded.userId);
      } catch {
        // Token invalid, ignore
      }
    }
    return { success: true };
  }

  async refresh(refreshToken: string): Promise<RefreshResult> {
    // Verify JWT
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid refresh token',
      });
    }

    const storedTokens = await this.repo.findValidRefreshTokens(decoded.userId);

    let validToken = false;
    for (const stored of storedTokens) {
      if (await comparePassword(refreshToken, stored.token)) {
        validToken = true;
        break;
      }
    }

    if (!validToken) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid refresh token',
      });
    }

    const user = await this.repo.findUserById(decoded.userId);

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not found or inactive',
      });
    }

    if (!user.isActive) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Your account has been suspended. Please contact an administrator.',
      });
    }

    const permissions =
      user.role === 'ADMIN'
        ? [...ALL_PERMISSIONS]
        : user.permissions.map((p) => p.permission.code);

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      permissions,
      accessToken,
    };
  }

  async me(userId: number, email: string, name: string, role: 'ADMIN' | 'EMPLOYEE', permissions: string[]) {
    const accessToken = generateAccessToken({
      userId,
      email,
      name,
      role,
      permissions,
    });

    return {
      user: {
        id: userId,
        email,
        name,
        role,
      },
      permissions,
      accessToken,
    };
  }
}
