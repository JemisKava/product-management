/**
 * Role Tests
 *
 * Since we use simple ADMIN/EMPLOYEE roles (not CustomRole table),
 * we only test that the role router returns the correct static roles.
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { setupTestDatabase, teardownTestDatabase, createTestAdmin, createTestPermissions, createTestEmployee } from '../../helpers.ts';
import { prisma } from '@/config/database.ts';

describe('Role System', () => {
  beforeAll(async () => {
    await setupTestDatabase();
    await createTestPermissions();
    await createTestAdmin();
    await createTestEmployee(['PRODUCT_VIEW', 'PRODUCT_CREATE']);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('User Roles', () => {
    test('should have ADMIN users in database', async () => {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      expect(adminCount).toBeGreaterThan(0);
    });

    test('should have EMPLOYEE users in database', async () => {
      const employeeCount = await prisma.user.count({ where: { role: 'EMPLOYEE' } });
      expect(employeeCount).toBeGreaterThan(0);
    });

    test('should only have ADMIN or EMPLOYEE roles', async () => {
      const users = await prisma.user.findMany();
      const roles = users.map(u => u.role);

      roles.forEach(role => {
        expect(['ADMIN', 'EMPLOYEE']).toContain(role);
      });
    });

    test('admin user should have ADMIN role', async () => {
      const admin = await prisma.user.findFirst({
        where: { email: 'admin@test.com' }
      });

      expect(admin).toBeDefined();
      expect(admin!.role).toBe('ADMIN');
    });

    test('employee user should have EMPLOYEE role', async () => {
      const employee = await prisma.user.findFirst({
        where: { email: 'employee@test.com' }
      });

      expect(employee).toBeDefined();
      expect(employee!.role).toBe('EMPLOYEE');
    });
  });

  describe('Role Enum', () => {
    test('should accept ADMIN role', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'admin2@test.com',
          password: 'hashedpassword',
          name: 'Admin Two',
          role: 'ADMIN',
        },
      });

      expect(user.role).toBe('ADMIN');
    });

    test('should accept EMPLOYEE role', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'employee2@test.com',
          password: 'hashedpassword',
          name: 'Employee Two',
          role: 'EMPLOYEE',
        },
      });

      expect(user.role).toBe('EMPLOYEE');
    });

    test('should default to EMPLOYEE if not specified', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'default@test.com',
          password: 'hashedpassword',
          name: 'Default User',
          // role not specified - should default to EMPLOYEE
        },
      });

      expect(user.role).toBe('EMPLOYEE');
    });
  });
});
