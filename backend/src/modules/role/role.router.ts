/**
 * Role Router
 *
 * Returns static list of system roles (ADMIN, EMPLOYEE)
 * No CRUD operations - roles are hardcoded in the system
 */

import { router, adminProcedure } from '../../routers/trpc.ts';
import { listRolesSchema } from './role.schema.ts';
import { ALL_PERMISSIONS } from '../../routers/context.ts';

export const roleRouter = router({
  /**
   * List all system roles
   * Returns hardcoded ADMIN and EMPLOYEE roles
   */
  list: adminProcedure.input(listRolesSchema).query(async ({ ctx, input }) => {
    const { page = 1, limit = 100, includeSystem = true } = input;

    // Count users for each role
    const [adminCount, employeeCount] = await Promise.all([
      ctx.prisma.user.count({ where: { role: 'ADMIN' } }),
      ctx.prisma.user.count({ where: { role: 'EMPLOYEE' } }),
    ]);

    // Static system roles
    const roles = [
      {
        id: 1,
        name: 'Admin',
        code: 'ADMIN',
        description: 'Full system access with all permissions',
        isSystem: true,
        permissions: ALL_PERMISSIONS,
        userCount: adminCount,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 2,
        name: 'Employee',
        code: 'EMPLOYEE',
        description: 'Limited access with assigned permissions',
        isSystem: true,
        permissions: [] as string[], // Permissions assigned per-user
        userCount: employeeCount,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    // Filter if not including system roles (though all our roles are system roles)
    const filteredRoles = includeSystem ? roles : [];

    return {
      roles: filteredRoles,
      meta: {
        total: filteredRoles.length,
        page,
        limit,
        totalPages: 1,
      },
    };
  }),
});
