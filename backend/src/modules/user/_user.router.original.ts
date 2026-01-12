/**
 * User Router
 *
 * Handles user management (admin only)
 */

import { TRPCError } from "@trpc/server";
import { router, adminProcedure } from "../trpc.ts";
import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  listUsersSchema,
  assignPermissionsSchema,
  bulkAssignPermissionsSchema,
} from "../../schemas/user.schema.ts";
import { hashPassword } from "../../lib/password.ts";
import { Role } from "../../../generated/prisma/client.js";

export const userRouter = router({
  // ============================================
  // LIST USERS (all users - admin dashboard)
  // ============================================
  list: adminProcedure
    .input(listUsersSchema)
    .query(async ({ input, ctx }) => {
      const { page, limit, search, name, email, isActive, roles, permissionCodes } = input;
      const skip = (page - 1) * limit;

      const roleFilter = roles && roles.length > 0 ? { role: { in: roles } } : {};
      const hasPermissionFilter =
        permissionCodes !== undefined && permissionCodes.length > 0;
      const includesAdmin = !roles || roles.length === 0 || roles.includes(Role.ADMIN);
      const includesEmployee =
        !roles || roles.length === 0 || roles.includes(Role.EMPLOYEE);

      const permissionFilter = hasPermissionFilter
        ? includesAdmin && includesEmployee
          ? {
              OR: [
                { role: Role.ADMIN },
                {
                  permissions: {
                    some: { permission: { code: { in: permissionCodes } } },
                  },
                },
              ],
            }
          : includesAdmin
            ? { role: Role.ADMIN }
            : {
                permissions: {
                  some: { permission: { code: { in: permissionCodes } } },
                },
              }
        : {};

      // Build where clause - list all users (both admins and employees)
      const where = {
        ...(search && {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        }),
        ...(name && { name: { contains: name } }),
        ...(email && { email: { contains: email } }),
        ...(isActive !== undefined && { isActive }),
        ...roleFilter,
        ...permissionFilter,
      };

      // Get users and count
      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        }),
        ctx.prisma.user.count({ where }),
      ]);

      return {
        users: users.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          // Admin users have all permissions, employees have assigned ones
          permissions:
            user.role === Role.ADMIN
              ? ["PRODUCT_VIEW", "PRODUCT_CREATE", "PRODUCT_EDIT", "PRODUCT_DELETE", "PRODUCT_BULK"]
              : user.permissions.map((p) => p.permission.code),
        })),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // ============================================
  // GET USER BY ID
  // ============================================
  getById: adminProcedure
    .input(userIdSchema)
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        permissions: user.permissions.map((p) => p.permission.code),
      };
    }),

  // ============================================
  // CREATE USER (employee)
  // ============================================
  create: adminProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      const { email, password, name, isActive, permissionCodes } = input;
      const normalizedPermissionCodes = permissionCodes
        ? Array.from(new Set(permissionCodes))
        : [];

      // Check if email already exists
      const existing = await ctx.prisma.user.findUnique({
        where: { email },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already in use",
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      const permissions = normalizedPermissionCodes.length
        ? await ctx.prisma.permission.findMany({
            where: { code: { in: normalizedPermissionCodes } },
          })
        : [];

      if (
        normalizedPermissionCodes.length > 0 &&
        permissions.length !== normalizedPermissionCodes.length
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid permission codes",
        });
      }

      // Create user and assign permissions
      const user = await ctx.prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            role: Role.EMPLOYEE,
            isActive: isActive ?? true,
          },
        });

        if (permissions.length > 0) {
          await tx.userPermission.createMany({
            data: permissions.map((permission) => ({
              userId: createdUser.id,
              permissionId: permission.id,
            })),
          });
        }

        return createdUser;
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        permissions: permissions.map((permission) => permission.code),
      };
    }),

  // ============================================
  // UPDATE USER
  // ============================================
  update: adminProcedure
    .input(updateUserSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, email, name, password, isActive, permissionCodes } = input;

      // Check if user exists
      const existing = await ctx.prisma.user.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Prevent updating admin users
      if (existing.role === Role.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot modify admin users",
        });
      }

      // Check email uniqueness if changing
      if (email && email !== existing.email) {
        const emailExists = await ctx.prisma.user.findUnique({
          where: { email },
        });
        if (emailExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use",
          });
        }
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {};
      if (email) updateData.email = email;
      if (name) updateData.name = name;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (password) updateData.password = await hashPassword(password);

      // Handle permissions if provided
      let permissions: Array<{ id: number; code: string }> = [];
      if (permissionCodes !== undefined) {
        const normalizedPermissionCodes = Array.from(new Set(permissionCodes));

        if (normalizedPermissionCodes.length > 0) {
          permissions = await ctx.prisma.permission.findMany({
            where: { code: { in: normalizedPermissionCodes } },
          });

          if (permissions.length !== normalizedPermissionCodes.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid permission codes",
            });
          }
        }
      }

      // Update user and permissions in a transaction
      const user = await ctx.prisma.$transaction(async (tx) => {
        // Update user data
        const updatedUser = await tx.user.update({
          where: { id },
          data: updateData,
        });

        // Update permissions if provided
        if (permissionCodes !== undefined) {
          // Delete existing permissions
          await tx.userPermission.deleteMany({
            where: { userId: id },
          });

          // Create new permissions
          if (permissions.length > 0) {
            await tx.userPermission.createMany({
              data: permissions.map((permission) => ({
                userId: id,
                permissionId: permission.id,
              })),
            });
          }
        }

        // Fetch user with updated permissions
        const userWithPermissions = await tx.user.findUnique({
          where: { id },
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        });

        return userWithPermissions!;
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        permissions: user.permissions.map((p) => p.permission.code),
      };
    }),

  // ============================================
  // DELETE USER
  // ============================================
  delete: adminProcedure
    .input(userIdSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Prevent deleting admin users
      if (user.role === Role.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete admin users",
        });
      }

      await ctx.prisma.user.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // ============================================
  // ASSIGN PERMISSIONS TO USER
  // ============================================
  assignPermissions: adminProcedure
    .input(assignPermissionsSchema)
    .mutation(async ({ input, ctx }) => {
      const { userId, permissionCodes } = input;

      // Check if user exists
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Prevent modifying admin permissions
      if (user.role === Role.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot modify admin permissions",
        });
      }

      // Get permission IDs
      const permissions = await ctx.prisma.permission.findMany({
        where: { code: { in: permissionCodes } },
      });

      // Delete existing permissions
      await ctx.prisma.userPermission.deleteMany({
        where: { userId },
      });

      // Create new permissions
      if (permissions.length > 0) {
        await ctx.prisma.userPermission.createMany({
          data: permissions.map((p) => ({
            userId,
            permissionId: p.id,
          })),
        });
      }

      // Return updated user
      const updatedUser = await ctx.prisma.user.findUnique({
        where: { id: userId },
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      });

      return {
        id: updatedUser!.id,
        email: updatedUser!.email,
        name: updatedUser!.name,
        role: updatedUser!.role,
        isActive: updatedUser!.isActive,
        createdAt: updatedUser!.createdAt,
        updatedAt: updatedUser!.updatedAt,
        permissions: updatedUser!.permissions.map((p) => p.permission.code),
      };
    }),

  // ============================================
  // BULK ASSIGN PERMISSIONS
  // ============================================
  bulkAssignPermissions: adminProcedure
    .input(bulkAssignPermissionsSchema)
    .mutation(async ({ input, ctx }) => {
      const { userIds, permissionCodes, replaceExisting } = input;
      const uniqueUserIds = Array.from(new Set(userIds));

      // Verify all users exist and are employees
      const users = await ctx.prisma.user.findMany({
        where: { id: { in: uniqueUserIds } },
      });

      if (users.length !== uniqueUserIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "One or more users not found",
        });
      }

      const adminUsers = users.filter((u) => u.role === Role.ADMIN);
      if (adminUsers.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot modify admin permissions",
        });
      }

      // Get permission IDs
      const permissions = await ctx.prisma.permission.findMany({
        where: { code: { in: permissionCodes } },
      });

      if (permissions.length === 0) {
        return { success: true, updatedCount: 0 };
      }

      if (replaceExisting) {
        // Replace existing permissions for each user
        for (const userId of uniqueUserIds) {
          await ctx.prisma.userPermission.deleteMany({
            where: { userId },
          });

          await ctx.prisma.userPermission.createMany({
            data: permissions.map((p) => ({
              userId,
              permissionId: p.id,
            })),
          });
        }

        return { success: true, updatedCount: uniqueUserIds.length };
      }

      // Merge: add selected permissions without removing existing ones
      const permissionIds = permissions.map((p) => p.id);
      const existingPermissions = await ctx.prisma.userPermission.findMany({
        where: {
          userId: { in: uniqueUserIds },
          permissionId: { in: permissionIds },
        },
        select: { userId: true, permissionId: true },
      });

      const existingMap = new Map<number, Set<number>>();
      for (const entry of existingPermissions) {
        const set = existingMap.get(entry.userId) ?? new Set<number>();
        set.add(entry.permissionId);
        existingMap.set(entry.userId, set);
      }

      const assignments = uniqueUserIds.flatMap((userId) => {
        const existingSet = existingMap.get(userId) ?? new Set<number>();
        return permissionIds
          .filter((permissionId) => !existingSet.has(permissionId))
          .map((permissionId) => ({
            userId,
            permissionId,
          }));
      });

      if (assignments.length > 0) {
        await ctx.prisma.userPermission.createMany({
          data: assignments,
          skipDuplicates: true,
        });
      }

      return { success: true, updatedCount: uniqueUserIds.length };
    }),

  // ============================================
  // GET ALL PERMISSIONS
  // ============================================
  getAllPermissions: adminProcedure.query(async ({ ctx }) => {
    const permissions = await ctx.prisma.permission.findMany({
      orderBy: { id: "asc" },
    });

    return permissions;
  }),
});
