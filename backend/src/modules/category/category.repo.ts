import { prisma } from '../../config/database.ts';

export class CategoryRepo {
  async findAll() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number) {
    return prisma.category.findUnique({
      where: { id },
    });
  }
}
