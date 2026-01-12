import { TRPCError } from '@trpc/server';
import { router, adminProcedure } from '../../routers/trpc.ts';
import { UserService } from './user.service.ts';
import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  listUsersSchema,
  assignPermissionsSchema,
  bulkAssignPermissionsSchema,
} from './user.schema.ts';

const userService = new UserService();

export const userRouter = router({
  list: adminProcedure.input(listUsersSchema).query(async ({ input }) => {
    return userService.listUsers(
      {
        search: input.search,
        name: input.name,
        email: input.email,
        isActive: input.isActive,
        roles: input.roles,
        permissionCodes: input.permissionCodes,
      },
      input.page,
      input.limit
    );
  }),

  getById: adminProcedure.input(userIdSchema).query(async ({ input }) => {
    return userService.getUserById(input.id);
  }),

  create: adminProcedure.input(createUserSchema).mutation(async ({ input, ctx }) => {
    // Convert permission codes to IDs if provided
    let permissionIds: number[] | undefined;
    if (input.permissionCodes && input.permissionCodes.length > 0) {
      const uniqueCodes = Array.from(new Set(input.permissionCodes));
      const permissions = await ctx.prisma.permission.findMany({
        where: { code: { in: uniqueCodes } },
      });

      // Validate all permission codes exist
      if (permissions.length !== uniqueCodes.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid permission codes',
        });
      }

      permissionIds = permissions.map(p => p.id);
    }

    return userService.createUser({
      ...input,
      permissionIds,
    });
  }),

  update: adminProcedure.input(updateUserSchema).mutation(async ({ input, ctx }) => {
    const { id, permissionCodes, ...data } = input;

    // Convert permission codes to IDs if provided
    let permissionIds: number[] | undefined;
    if (permissionCodes !== undefined) {
      if (permissionCodes.length > 0) {
        const uniqueCodes = Array.from(new Set(permissionCodes));
        const permissions = await ctx.prisma.permission.findMany({
          where: { code: { in: uniqueCodes } },
        });

        // Validate all permission codes exist
        if (permissions.length !== uniqueCodes.length) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid permission codes',
          });
        }

        permissionIds = permissions.map(p => p.id);
      } else {
        // Empty array means clear all permissions
        permissionIds = [];
      }
    }

    return userService.updateUser(id, {
      ...data,
      permissionIds,
    });
  }),

  delete: adminProcedure.input(userIdSchema).mutation(async ({ input }) => {
    await userService.deleteUser(input.id);
    return { success: true };
  }),

  assignPermissions: adminProcedure.input(assignPermissionsSchema).mutation(async ({ input, ctx }) => {
    // Convert permission codes to IDs
    const permissions = await ctx.prisma.permission.findMany({
      where: { code: { in: input.permissionCodes } },
    });
    const permissionIds = permissions.map(p => p.id);

    return userService.assignPermissions(input.userId, permissionIds);
  }),

  bulkAssignPermissions: adminProcedure.input(bulkAssignPermissionsSchema).mutation(async ({ input, ctx }) => {
    // Convert permission codes to IDs
    const permissions = await ctx.prisma.permission.findMany({
      where: { code: { in: input.permissionCodes } },
    });
    const permissionIds = permissions.map(p => p.id);

    return userService.bulkAssignPermissions(
      input.userIds,
      permissionIds,
      input.replaceExisting ?? false
    );
  }),

  getAllPermissions: adminProcedure.query(async () => {
    return userService.getAllPermissions();
  }),
});
