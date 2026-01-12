import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { UserService } from '@/modules/user/user.service.ts';
import { setupTestDatabase, teardownTestDatabase, createTestAdmin, createTestEmployee, createTestPermissions } from '../../helpers.ts';
import { TRPCError } from '@trpc/server';

describe('UserService', () => {
  let userService: UserService;
  let adminUser: any;
  let employeeUser: any;

  beforeAll(async () => {
    await setupTestDatabase();
    userService = new UserService();
    adminUser = await createTestAdmin();
    employeeUser = await createTestEmployee(['PRODUCT_VIEW', 'PRODUCT_EDIT']);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('listUsers', () => {
    test('should list users successfully', async () => {
      const result = await userService.listUsers({}, 1, 10);

      expect(result).toBeDefined();
      expect(result.users).toBeArray();
      expect(result.meta).toBeDefined();
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBeNumber();
      expect(result.meta.totalPages).toBeNumber();
    });

    test('should filter users by email', async () => {
      const result = await userService.listUsers({ email: adminUser.email }, 1, 10);

      expect(result.users.length).toBeGreaterThan(0);
      expect(result.users[0].email).toBe(adminUser.email);
    });

    test('should filter users by name', async () => {
      const result = await userService.listUsers({ name: 'Admin' }, 1, 10);

      expect(result.users.length).toBeGreaterThan(0);
    });

    test('should filter users by role', async () => {
      const result = await userService.listUsers({ roles: ['ADMIN'] }, 1, 10);

      expect(result.users.length).toBeGreaterThan(0);
      expect(result.users.every((u: any) => u.role === 'ADMIN')).toBe(true);
    });

    test('should filter users by isActive', async () => {
      const result = await userService.listUsers({ isActive: true }, 1, 10);

      expect(result.users.every((u: any) => u.isActive === true)).toBe(true);
    });

    test('should filter users by permission codes', async () => {
      const result = await userService.listUsers({ permissionCodes: ['PRODUCT_VIEW'] }, 1, 10);

      expect(result.users.length).toBeGreaterThan(0);
    });

    test('should search users by text', async () => {
      const result = await userService.listUsers({ search: 'admin' }, 1, 10);

      expect(result.users.length).toBeGreaterThan(0);
    });

    test('should paginate results correctly', async () => {
      const result1 = await userService.listUsers({}, 1, 1);
      const result2 = await userService.listUsers({}, 2, 1);

      expect(result1.users.length).toBe(1);
      expect(result1.meta.page).toBe(1);
      expect(result2.users.length).toBe(1);
      expect(result2.meta.page).toBe(2);
    });

    test('should handle empty filters', async () => {
      const result = await userService.listUsers({}, 1, 10);

      expect(result.users.length).toBeGreaterThan(0);
    });

    test('should calculate totalPages correctly', async () => {
      const result = await userService.listUsers({}, 1, 2);

      expect(result.meta.totalPages).toBe(Math.ceil(result.meta.total / 2));
    });
  });

  describe('getUserById', () => {
    test('should get user by id successfully', async () => {
      const user = await userService.getUserById(adminUser.id);

      expect(user).toBeDefined();
      expect(user.id).toBe(adminUser.id);
      expect(user.email).toBe(adminUser.email);
      expect(user.name).toBe(adminUser.name);
      expect(user.role).toBe('ADMIN');
      expect(user.permissions).toBeArray();
    });

    test('should throw NOT_FOUND for non-existent user id', async () => {
      await expect(
        userService.getUserById(99999)
      .rejects.toThrow(TRPCError);
    });

    test('should return permissions with user', async () => {
      const user = await userService.getUserById(employeeUser.id);

      expect(user.permissions).toBeArray();
      expect(user.permissions.length).toBeGreaterThan(0);
      expect(user.permissions[0]).toHaveProperty('id');
      expect(user.permissions[0]).toHaveProperty('code');
      expect(user.permissions[0]).toHaveProperty('name');
    });

    test('should include createdAt and updatedAt', async () => {
      const user = await userService.getUserById(adminUser.id);

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('createUser', () => {
    test('should create user successfully', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'NewUser@123',
        name: 'New User',
        role: 'EMPLOYEE',
        isActive: true,
      };

      const result = await userService.createUser(userData);

      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);
      expect(result.role).toBe('EMPLOYEE');
      expect(result.isActive).toBe(true);
    });

    test('should throw CONFLICT for existing email', async () => {
      const userData = {
        email: adminUser.email,
        password: 'SomePass@123',
        name: 'Duplicate User',
      };

      await expect(
        userService.createUser(userData)
      .rejects.toThrow(TRPCError);
    });

    test('should create user with default isActive true', async () => {
      const userData = {
        email: 'defaultactive@test.com',
        password: 'Default@123',
        name: 'Default Active User',
        role: 'EMPLOYEE' as const,
      };

      const result = await userService.createUser(userData);

      expect(result.isActive).toBe(true);
    });

    test('should create user with custom permissions', async () => {
      const permissions = await createTestPermissions();
      const userData = {
        email: 'permitteduser@test.com',
        password: 'Permitted@123',
        name: 'Permitted User',
        role: 'EMPLOYEE' as const,
        permissionIds: [permissions[0].id, permissions[1].id],
      };

      const result = await userService.createUser(userData);

      expect(result.permissions.length).toBeGreaterThan(0);
    });

    test('should throw error for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Invalid@123',
        name: 'Invalid User',
      };

      await expect(
        userService.createUser(userData)
      ).rejects.toThrow();
    });

    test('should throw error for weak password', async () => {
      const userData = {
        email: 'weakpass@test.com',
        password: 'weak',
        name: 'Weak Password User',
      };

      await expect(
        userService.createUser(userData)
      ).rejects.toThrow();
    });

    test('should throw error for invalid role', async () => {
      const userData = {
        email: 'invalidrole@test.com',
        password: 'InvalidRole@123',
        name: 'Invalid Role User',
        role: 'INVALID_ROLE',
      };

      await expect(
        userService.createUser(userData)
      ).rejects.toThrow();
    });
  });

  describe('updateUser', () => {
    let testUser: any;

    beforeAll(async () => {
      testUser = await userService.createUser({
        email: 'updateme@test.com',
        password: 'UpdateMe@123',
        name: 'Update Me',
        role: 'EMPLOYEE',
      });
    });

    test('should update user name successfully', async () => {
      const result = await userService.updateUser(testUser.id, { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
    });

    test('should update user email successfully', async () => {
      const result = await userService.updateUser(testUser.id, { email: 'updated@test.com' });

      expect(result.email).toBe('updated@test.com');
    });

    test('should update user password successfully', async () => {
      const result = await userService.updateUser(testUser.id, { password: 'NewPassword@123' });

      expect(result).toBeDefined();
    });

    test('should update user role successfully', async () => {
      const result = await userService.updateUser(testUser.id, { role: 'EMPLOYEE' });

      expect(result.role).toBe('EMPLOYEE');
    });

    test('should update user isActive status', async () => {
      const result = await userService.updateUser(testUser.id, { isActive: false });

      expect(result.isActive).toBe(false);
    });

    test('should update user permissions', async () => {
      const permissions = await createTestPermissions();
      const result = await userService.updateUser(testUser.id, { permissionIds: [permissions[0].id] });

      expect(result.permissions.length).toBeGreaterThan(0);
    });

    test('should throw NOT_FOUND for non-existent user', async () => {
      await expect(
        userService.updateUser(99999, { name: 'Non-existent' })
      .rejects.toThrow(TRPCError);
    });

    test('should throw CONFLICT when updating to existing email', async () => {
      await expect(
        userService.updateUser(testUser.id, { email: adminUser.email })
      .rejects.toThrow(TRPCError);
    });

    test('should allow updating to same email', async () => {
      const result = await userService.updateUser(testUser.id, { email: testUser.email });

      expect(result.email).toBe(testUser.email);
    });

    test('should handle partial updates', async () => {
      const beforeUpdate = await userService.getUserById(testUser.id);
      await userService.updateUser(testUser.id, { name: 'Partial Update' });
      const afterUpdate = await userService.getUserById(testUser.id);

      expect(afterUpdate.name).toBe('Partial Update');
      expect(afterUpdate.email).toBe(beforeUpdate.email);
    });
  });

  describe('deleteUser', () => {
    let testUser: any;

    beforeAll(async () => {
      testUser = await userService.createUser({
        email: 'deleteme@test.com',
        password: 'DeleteMe@123',
        name: 'Delete Me',
        role: 'EMPLOYEE',
      });
    });

    test('should delete user successfully', async () => {
      await userService.deleteUser(testUser.id);

      await expect(
        userService.getUserById(testUser.id)
      .rejects.toThrow(TRPCError);
    });

    test('should throw NOT_FOUND for non-existent user', async () => {
      await expect(
        userService.deleteUser(99999)
      .rejects.toThrow(TRPCError);
    });
  });

  describe('assignPermissions', () => {
    let testUser: any;
    let permissions: any[];

    beforeAll(async () => {
      testUser = await userService.createUser({
        email: 'permissions@test.com',
        password: 'Permissions@123',
        name: 'Permissions User',
        role: 'EMPLOYEE',
      });
      permissions = await createTestPermissions();
    });

    test('should assign permissions to user successfully', async () => {
      const result = await userService.assignPermissions(testUser.id, [permissions[0].id, permissions[1].id]);

      expect(result.permissions.length).toBe(2);
    });

    test('should replace existing permissions', async () => {
      await userService.assignPermissions(testUser.id, [permissions[0].id]);
      const result = await userService.assignPermissions(testUser.id, [permissions[2].id]);

      expect(result.permissions.length).toBe(1);
      expect(result.permissions[0].id).toBe(permissions[2].id);
    });

    test('should throw NOT_FOUND for non-existent user', async () => {
      await expect(
        userService.assignPermissions(99999, [permissions[0].id])
      .rejects.toThrow(TRPCError);
    });

    test('should throw BAD_REQUEST when assigning permissions to admin', async () => {
      await expect(
        userService.assignPermissions(adminUser.id, [permissions[0].id])
      .rejects.toThrow(TRPCError);
    });

    test('should handle empty permissions array', async () => {
      const result = await userService.assignPermissions(testUser.id, []);

      expect(result.permissions).toBeArray();
    });

    test('should clear all permissions when empty array provided', async () => {
      await userService.assignPermissions(testUser.id, [permissions[0].id, permissions[1].id]);
      const result = await userService.assignPermissions(testUser.id, []);

      expect(result.permissions.length).toBe(0);
    });
  });

  describe('bulkAssignPermissions', () => {
    let testUsers: any[];
    let permissions: any[];

    beforeAll(async () => {
      testUsers = [
        await userService.createUser({
          email: 'bulk1@test.com',
          password: 'Bulk1@123',
          name: 'Bulk User 1',
          role: 'EMPLOYEE',
        }),
        await userService.createUser({
          email: 'bulk2@test.com',
          password: 'Bulk2@123',
          name: 'Bulk User 2',
          role: 'EMPLOYEE',
        }),
      ];
      permissions = await createTestPermissions();
    });

    test('should assign permissions to multiple users', async () => {
      const result = await userService.bulkAssignPermissions(
        [testUsers[0].id, testUsers[1].id],
        [permissions[0].id],
        false
      );

      expect(result.success).toBe(true);
      expect(result.affectedUsers).toBe(2);
    });

    test('should replace existing permissions when flag is true', async () => {
      const result = await userService.bulkAssignPermissions(
        [testUsers[0].id, testUsers[1].id],
        [permissions[1].id],
        true
      );

      expect(result.success).toBe(true);
      expect(result.affectedUsers).toBe(2);
    });

    test('should append permissions when flag is false', async () => {
      await userService.bulkAssignPermissions([testUsers[0].id], [permissions[0].id], false);
      const result = await userService.bulkAssignPermissions([testUsers[0].id], [permissions[1].id], false);

      expect(result.success).toBe(true);
      expect(result.affectedUsers).toBe(1);
    });

    test('should handle single user in bulk', async () => {
      const result = await userService.bulkAssignPermissions(
        [testUsers[0].id],
        [permissions[2].id],
        false
      );

      expect(result.success).toBe(true);
      expect(result.affectedUsers).toBe(1);
    });

    test('should handle empty user ids array', async () => {
      const result = await userService.bulkAssignPermissions([], [permissions[0].id], false);

      expect(result.success).toBe(true);
      expect(result.affectedUsers).toBe(0);
    });
  });

  describe('getAllPermissions', () => {
    test('should return all permissions', async () => {
      const result = await userService.getAllPermissions();

      expect(result).toBeArray();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('code');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('description');
    });
  });

  describe('edge cases', () => {
    test('should handle limit > 100', async () => {
      const result = await userService.listUsers({}, 1, 200);

      expect(result.meta.limit).toBe(200);
    });

    test('should handle page = 0', async () => {
      const result = await userService.listUsers({}, 0, 10);

      expect(result.meta.page).toBe(0);
    });

    test('should handle negative page', async () => {
      const result = await userService.listUsers({}, -1, 10);

      expect(result.meta.page).toBe(-1);
    });
  });
});
