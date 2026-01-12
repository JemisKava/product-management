/**
 * Role Router
 *
 * Handles role management (admin only)
 * - CRUD operations for custom roles
 * - Role-permission assignment
 * - Role assignment to users
 */

import { TRPCError } from "@trpc/server";
import { router, adminProcedure } from "../trpc.ts";
import {
  createRoleSchema,
  updateRoleSchema,
  roleIdSchema,
  listRolesSchema,
  assignRoleToUsersSchema,
} from "../../schemas/role.schema.ts";

export const roleRouter = router({
  // ============================================
  // LIST ROLES
  // ============================================
  list: adminProcedure.input(listRolesSchema).query(async ({ input, ctx }) => {
    const { page, limit, search, includeSystem } = input;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (!includeSystem) {
      where.isSystem = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Get total count and roles with permissions
    const [total, roles] = await Promise.all([
      ctx.prisma.role.count({ where }),
      ctx.prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isSystem: "desc" }, { name: "asc" }],
        include: {
          permissions: {
            include: { permission: true },
          },
          _count: {
            select: { users: true },
          },
        },
      }),
    ]);

    return {
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        code: role.code,
        description: role.description,
        isSystem: role.isSystem,
        permissions: role.permissions.map((p) => p.permission.code),
        userCount: role._count.users,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }),

  // ============================================
  // GET ROLE BY ID
  // ============================================
  getById: adminProcedure.input(roleIdSchema).query(async ({ input, ctx }) => {
    const role = await ctx.prisma.role.findUnique({
      where: { id: input.id },
      include: {
        permissions: {
          include: { permission: true },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
          take: 10, // Limit to first 10 users for performance
        },
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Role not found",
      });
    }

    return {
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      isSystem: role.isSystem,
      permissions: role.permissions.map((p) => p.permission.code),
      users: role.users,
      userCount: role._count.users,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }),

  // ============================================
  // CREATE ROLE
  // ============================================
  create: adminProcedure.input(createRoleSchema).mutation(async ({ input, ctx }) => {
    const { name, code, description, permissionCodes } = input;

    // Check if role already exists
    const existing = await ctx.prisma.role.findFirst({
      where: {
        OR: [{ name }, { code }],
      },
    });

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: existing.name === name ? "Role name already exists" : "Role code already exists",
      });
    }

    // Get permission IDs from codes
    let permissionIds: number[] = [];
    if (permissionCodes.length > 0) {
      const permissions = await ctx.prisma.permission.findMany({
        where: { code: { in: permissionCodes } },
        select: { id: true },
      });
      permissionIds = permissions.map((p) => p.id);
    }

    // Create role with permissions
    const role = await ctx.prisma.role.create({
      data: {
        name,
        code,
        description,
        isSystem: false, // Custom roles are never system roles
        permissions: {
          create: permissionIds.map((permissionId) => ({
            permissionId,
          })),
        },
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    return {
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      isSystem: role.isSystem,
      permissions: role.permissions.map((p) => p.permission.code),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }),

  // ============================================
  // UPDATE ROLE
  // ============================================
  update: adminProcedure.input(updateRoleSchema).mutation(async ({ input, ctx }) => {
    const { id, name, description, permissionCodes } = input;

    // Check if role exists
    const existing = await ctx.prisma.role.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Role not found",
      });
    }

    // Prevent updating system roles
    if (existing.isSystem) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot modify system roles (ADMIN, EMPLOYEE)",
      });
    }

    // Check name uniqueness if changing
    if (name && name !== existing.name) {
      const nameExists = await ctx.prisma.role.findFirst({
        where: { name, id: { not: id } },
      });
      if (nameExists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Role name already exists",
        });
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    // Update role
    let role = await ctx.prisma.role.update({
      where: { id },
      data: updateData,
    });

    // Update permissions if provided
    if (permissionCodes !== undefined) {
      // Delete existing permissions
      await ctx.prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Add new permissions
      if (permissionCodes.length > 0) {
        const permissions = await ctx.prisma.permission.findMany({
          where: { code: { in: permissionCodes } },
        });

        await ctx.prisma.rolePermission.createMany({
          data: permissions.map((p) => ({
            roleId: id,
            permissionId: p.id,
          })),
        });
      }
    }

    // Fetch updated role with permissions
    const updatedRole = await ctx.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    return {
      id: updatedRole!.id,
      name: updatedRole!.name,
      code: updatedRole!.code,
      description: updatedRole!.description,
      isSystem: updatedRole!.isSystem,
      permissions: updatedRole!.permissions.map((p) => p.permission.code),
      createdAt: updatedRole!.createdAt,
      updatedAt: updatedRole!.updatedAt,
    };
  }),

  // ============================================
  // DELETE ROLE
  // ============================================
  delete: adminProcedure.input(roleIdSchema).mutation(async ({ input, ctx }) => {
    const role = await ctx.prisma.role.findUnique({
      where: { id: input.id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Role not found",
      });
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot delete system roles (ADMIN, EMPLOYEE)",
      });
    }

    // Prevent deleting roles that have users assigned
    if (role._count.users > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Cannot delete role with ${role._count.users} assigned users. Reassign users first.`,
      });
    }

    // Delete role (cascades to role_permissions)
    await ctx.prisma.role.delete({
      where: { id: input.id },
    });

    return { success: true };
  }),

  // ============================================
  // ASSIGN ROLE TO USERS
  // ============================================
  assignRoleToUsers: adminProcedure
    .input(assignRoleToUsersSchema)
    .mutation(async ({ input, ctx }) => {
      const { roleId, userIds } = input;

      // Verify role exists
      const role = await ctx.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Role not found",
        });
      }

      // Verify all users exist
      const users = await ctx.prisma.user.findMany({
        where: { id: { in: userIds } },
      });

      if (users.length !== userIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "One or more users not found",
        });
      }

      // Update all users to this role
      await ctx.prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { roleId },
      });

      return { success: true, updatedCount: userIds.length };
    }),
});
