import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { AuthService } from '@/modules/auth/auth.service.ts';
import { AuthRepo } from '@/modules/auth/auth.repo.ts';
import { setupTestDatabase, teardownTestDatabase, createTestAdmin, createTestEmployee, createTestRefreshToken, getAuthToken, TEST_USER } from '../../helpers.ts';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/config/database.ts';

describe('AuthService', () => {
  let authService: AuthService;
  let adminUser: any;
  let employeeUser: any;

  beforeAll(async () => {
    await setupTestDatabase();
    authService = new AuthService();
    adminUser = await createTestAdmin();
    employeeUser = await createTestEmployee(['PRODUCT_VIEW']);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('login', () => {
    test('should login successfully with valid credentials', async () => {
      const result = await authService.login(TEST_USER.admin.email, TEST_USER.admin.password);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(TEST_USER.admin.email);
      expect(result.user.role).toBe('ADMIN');
      expect(result.accessToken).toBeDefined();
      expect(result.permissions).toBeArray();
      expect(result.permissions.length).toBeGreaterThan(0);
    });

    test('should throw UNAUTHORIZED for invalid email', async () => {
      await expect(
        authService.login('nonexistent@test.com', 'SomePassword123')
      ).rejects.toThrow(TRPCError);
    });

    test('should throw UNAUTHORIZED for invalid password', async () => {
      await expect(
        authService.login(TEST_USER.admin.email, 'WrongPassword123')
      ).rejects.toThrow(TRPCError);
    });

    test('should throw UNAUTHORIZED for inactive user', async () => {
      const repo = new AuthRepo();
      await repo.updateUserStatus(adminUser.id, false);

      await expect(
        authService.login(TEST_USER.admin.email, TEST_USER.admin.password)
      ).rejects.toThrow(TRPCError);

      await repo.updateUserStatus(adminUser.id, true);
    });

    test('should return all permissions for admin user', async () => {
      const result = await authService.login(TEST_USER.admin.email, TEST_USER.admin.password);

      expect(result.permissions).toEqual([
        'PRODUCT_VIEW',
        'PRODUCT_CREATE',
        'PRODUCT_EDIT',
        'PRODUCT_DELETE',
        'PRODUCT_BULK',
      ]);
    });

    test('should return assigned permissions for employee user', async () => {
      const result = await authService.login(TEST_USER.employee.email, TEST_USER.employee.password);

      expect(result.permissions).toEqual(['PRODUCT_VIEW']);
    });

    test('should create refresh token in database', async () => {
      const result = await authService.login(TEST_USER.admin.email, TEST_USER.admin.password);

      const repo = new AuthRepo();
      const tokens = await repo.findValidRefreshTokens(adminUser.id);

      expect(tokens.length).toBeGreaterThan(0);
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('logout', () => {
    test('should logout successfully with valid refresh token', async () => {
      const { token: refreshToken, dbToken } = await createTestRefreshToken(
        adminUser.id.toString(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );

      const result = await authService.logout(refreshToken);

      expect(result.success).toBe(true);
    });

    test('should logout successfully with undefined refresh token', async () => {
      const result = await authService.logout(undefined);

      expect(result.success).toBe(true);
    });

    test('should logout successfully with invalid refresh token', async () => {
      const result = await authService.logout('invalid-refresh-token');

      expect(result.success).toBe(true);
    });

    test('should revoke refresh token in database', async () => {
      const { token: refreshToken } = await createTestRefreshToken(
        adminUser.id.toString(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );

      await authService.logout(refreshToken);

      const repo = new AuthRepo();
      const tokens = await repo.findValidRefreshTokens(adminUser.id);

      expect(tokens.length).toBe(0);
    });
  });

  describe('refresh', () => {
    beforeEach(async () => {
      // Clear all refresh tokens before each refresh test
      await prisma.refreshToken.deleteMany();
    });

    test('should refresh access token successfully with valid refresh token', async () => {
      const { token: refreshToken } = await createTestRefreshToken(
        adminUser.id.toString(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );

      const result = await authService.refresh(refreshToken);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe(adminUser.id);
      expect(result.accessToken).toBeDefined();
      expect(result.permissions).toBeArray();
    });

    test('should throw UNAUTHORIZED when refresh token is missing', async () => {
      await expect(
        authService.refresh('')
      ).rejects.toThrow(TRPCError);

      await expect(
        authService.refresh(undefined as any)
      ).rejects.toThrow(TRPCError);
    });

    test('should throw UNAUTHORIZED with invalid refresh token format', async () => {
      await expect(
        authService.refresh('invalid-token-format')
      ).rejects.toThrow(TRPCError);
    });

    test('should throw UNAUTHORIZED when refresh token is not in database', async () => {
      const validTokenFormat = getAuthToken(adminUser, ['PRODUCT_VIEW', 'PRODUCT_CREATE']);
      await expect(
        authService.refresh(validTokenFormat)
      ).rejects.toThrow(TRPCError);
    });

    test('should throw UNAUTHORIZED when refresh token is expired', async () => {
      const { token: refreshToken } = await createTestRefreshToken(
        adminUser.id.toString(),
        new Date(Date.now() - 1000)
      );

      await expect(
        authService.refresh(refreshToken)
      ).rejects.toThrow(TRPCError);
    });

    test('should throw UNAUTHORIZED when user is inactive', async () => {
      const repo = new AuthRepo();
      await repo.updateUserStatus(adminUser.id, false);

      const { token: refreshToken } = await createTestRefreshToken(
        adminUser.id.toString(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );

      await expect(
        authService.refresh(refreshToken)
      ).rejects.toThrow(TRPCError);

      await repo.updateUserStatus(adminUser.id, true);
    });

    test('should return correct permissions for admin on refresh', async () => {
      const { token: refreshToken } = await createTestRefreshToken(
        adminUser.id.toString(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );

      const result = await authService.refresh(refreshToken);

      expect(result.permissions).toEqual([
        'PRODUCT_VIEW',
        'PRODUCT_CREATE',
        'PRODUCT_EDIT',
        'PRODUCT_DELETE',
        'PRODUCT_BULK',
      ]);
    });

    test('should return correct permissions for employee on refresh', async () => {
      const { token: refreshToken } = await createTestRefreshToken(
        employeeUser.id.toString(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );

      const result = await authService.refresh(refreshToken);

      expect(result.permissions).toEqual(['PRODUCT_VIEW']);
    });
  });

  describe('me', () => {
    test('should return user info with new access token', async () => {
      const result = await authService.me(
        adminUser.id,
        adminUser.email,
        adminUser.name,
        adminUser.role,
        ['PRODUCT_VIEW', 'PRODUCT_CREATE']
      );

      expect(result.user).toBeDefined();
      expect(result.user.id).toBe(adminUser.id);
      expect(result.user.email).toBe(adminUser.email);
      expect(result.user.name).toBe(adminUser.name);
      expect(result.user.role).toBe('ADMIN');
      expect(result.permissions).toEqual(['PRODUCT_VIEW', 'PRODUCT_CREATE']);
      expect(result.accessToken).toBeDefined();
    });

    test('should return employee permissions correctly', async () => {
      const result = await authService.me(
        employeeUser.id,
        employeeUser.email,
        employeeUser.name,
        employeeUser.role,
        ['PRODUCT_VIEW']
      );

      expect(result.user.role).toBe('EMPLOYEE');
      expect(result.permissions).toEqual(['PRODUCT_VIEW']);
    });

    test('should generate valid access token', async () => {
      const result = await authService.me(
        adminUser.id,
        adminUser.email,
        adminUser.name,
        adminUser.role,
        ['PRODUCT_VIEW']
      );

      expect(result.accessToken).toBeString();
      expect(result.accessToken.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    beforeEach(async () => {
      // Clear all refresh tokens before each edge case test
      await prisma.refreshToken.deleteMany();
    });

    test('should handle multiple refresh tokens for same user', async () => {
      await createTestRefreshToken(
        adminUser.id.toString(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
      await createTestRefreshToken(
        adminUser.id.toString(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
      await createTestRefreshToken(
        adminUser.id.toString(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );

      const repo = new AuthRepo();
      const tokens = await repo.findValidRefreshTokens(adminUser.id);

      expect(tokens.length).toBe(3);
    });

    test('should only revoke tokens for specific user on logout', async () => {
      await createTestRefreshToken(
        adminUser.id.toString(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
      const { token: employeeToken } = await createTestRefreshToken(
        employeeUser.id.toString(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );

      const repo = new AuthRepo();
      await repo.revokeRefreshTokens(adminUser.id);

      const adminTokens = await repo.findValidRefreshTokens(adminUser.id);
      const employeeTokens = await repo.findValidRefreshTokens(employeeUser.id);

      expect(adminTokens.length).toBe(0);
      expect(employeeTokens.length).toBe(1);
    });
  });
});
