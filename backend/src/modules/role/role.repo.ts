import { prisma } from '../../config/database.ts';

export class RoleRepo {
  async findAll() {
    return prisma.permission.findMany({
      orderBy: { code: 'asc' },
    });
  }
}
