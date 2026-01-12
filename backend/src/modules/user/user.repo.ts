import { prisma } from '../../config/database.ts';
import { Prisma, Role } from '../../../generated/prisma/client.js';
import type { UserFilter } from './user.types.ts';

export class UserRepo {
  
  async findMany(filter: UserFilter, page: number, limit: number) {
    const where = this.buildWhere(filter);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          permissions: { include: { permission: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
      },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      include: {
        permissions: { include: { permission: true } },
      },
    });
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        permissions: { include: { permission: true } },
      },
    });
  }

  async delete(id: number) {
    await prisma.user.delete({ where: { id } });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async assignPermissions(userId: number, permissionIds: number[]) {
    await prisma.userPermission.deleteMany({ where: { userId } });
    
    if (permissionIds.length > 0) {
      await prisma.userPermission.createMany({
        data: permissionIds.map(permissionId => ({ userId, permissionId })),
      });
    }
  }

  async bulkAssignPermissions(userIds: number[], permissionIds: number[], replaceExisting: boolean) {
    if (replaceExisting) {
      await prisma.userPermission.deleteMany({
        where: { userId: { in: userIds } },
      });
    }

    const data = userIds.flatMap(userId =>
      permissionIds.map(permissionId => ({ userId, permissionId }))
    );

    await prisma.userPermission.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async getAllPermissions() {
    return prisma.permission.findMany({
      orderBy: { code: 'asc' },
    });
  }

  private buildWhere(filter: UserFilter): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search } },
        { email: { contains: filter.search } },
      ];
    }

    if (filter.name) {
      where.name = { contains: filter.name };
    }

    if (filter.email) {
      where.email = { contains: filter.email };
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    // Always exclude admin users from the list
    if (filter.roles && filter.roles.length > 0) {
      // Filter out ADMIN from roles filter and only allow EMPLOYEE
      const employeeRoles = filter.roles.filter(role => role !== Role.ADMIN);
      if (employeeRoles.length > 0) {
        where.role = { in: employeeRoles };
      } else {
        // If only ADMIN was selected, return no results (since we exclude ADMIN)
        where.role = { in: [] };
      }
    } else {
      // If no role filter, exclude ADMIN by default
      where.role = { not: Role.ADMIN };
    }

    const hasPermissionFilter =
      filter.permissionCodes !== undefined && filter.permissionCodes.length > 0;
    if (hasPermissionFilter) {
      // Only filter by permissions for employees (admin users are excluded)
      where.permissions = {
        some: { permission: { code: { in: filter.permissionCodes } } },
      };
    }

    return where;
  }
}
