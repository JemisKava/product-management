import { TRPCError } from '@trpc/server';
import { UserRepo } from './user.repo.ts';
import { hashPassword } from '../../lib/password.ts';
import type { UserFilter } from './user.types.ts';
import { ALL_PERMISSIONS } from '../../routers/context.ts';

export class UserService {
  private repo: UserRepo;

  constructor() {
    this.repo = new UserRepo();
  }

  async listUsers(filter: UserFilter, page: number, limit: number) {
    const result = await this.repo.findMany(filter, page, limit);

    return {
      users: result.users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        // Match original backend: return permission codes only
        permissions: u.role === 'ADMIN'
          ? [...ALL_PERMISSIONS]
          : u.permissions.map(p => p.permission.code),
      })),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getUserById(id: number) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      permissions: user.role === 'ADMIN'
        ? [...ALL_PERMISSIONS]
        : user.permissions.map(p => p.permission.code),
    };
  }

  async createUser(data: any) {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      throw new TRPCError({ code: 'CONFLICT', message: 'Email already exists' });
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await this.repo.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role || 'EMPLOYEE',
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    if (data.permissionIds && data.permissionIds.length > 0) {
      await this.repo.assignPermissions(user.id, data.permissionIds);
    }

    return this.getUserById(user.id);
  }

  async updateUser(id: number, data: any) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    // Prevent updating admin users
    if (user.role === 'ADMIN') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot modify admin users',
      });
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.repo.findByEmail(data.email);
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Email already exists' });
      }
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.password) updateData.password = await hashPassword(data.password);
    if (data.role) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await this.repo.update(id, updateData);

    if (data.permissionIds !== undefined) {
      await this.repo.assignPermissions(id, data.permissionIds);
    }

    return this.getUserById(id);
  }

  async deleteUser(id: number) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    await this.repo.delete(id);
  }

  async assignPermissions(userId: number, permissionIds: number[]) {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Cannot modify admin permissions',
      });
    }

    await this.repo.assignPermissions(userId, permissionIds);
    return this.getUserById(userId);
  }

  async bulkAssignPermissions(userIds: number[], permissionIds: number[], replaceExisting: boolean) {
    await this.repo.bulkAssignPermissions(userIds, permissionIds, replaceExisting);
    return { success: true, affectedUsers: userIds.length };
  }

  async getAllPermissions() {
    return this.repo.getAllPermissions();
  }
}
