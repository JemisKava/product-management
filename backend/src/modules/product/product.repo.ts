import { prisma } from '../../config/database.ts';
import { Prisma } from '../../../generated/prisma/client.js';
import type { ProductFilter, PaginationParams } from './product.types.ts';

export class ProductRepo {
  async findMany(filter: ProductFilter, pagination: PaginationParams) {
    const where = this.buildWhere(filter);
    const skip = (pagination.page - 1) * pagination.limit;
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [filter.sortBy || 'createdAt']: filter.sortOrder || 'desc',
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy,
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map(p => ({
        id: p.id,
        productId: p.productId,
        name: p.name,
        categoryId: p.categoryId,
        category: {
          id: p.category.id,
          name: p.category.name,
          slug: p.category.slug,
        },
        price: Number(p.price),
        quantity: p.quantity,
        stockDetails: p.stockDetails,
        status: p.status,
        imageUrl: p.imageUrl,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getFilterOptions(filter: Partial<ProductFilter>) {
    const where = this.buildWhere(filter);

    const [products, categories, statuses] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          price: true,
          stockDetails: true,
        },
      }),
      prisma.category.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
      prisma.product.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    const prices = products.map(p => Number(p.price));
    const stocks = products.map(p => p.stockDetails);

    return {
      categories,
      statuses: statuses.map(s => s.status),
      priceRange: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0,
      },
      stockRange: {
        min: stocks.length > 0 ? Math.min(...stocks) : 0,
        max: stocks.length > 0 ? Math.max(...stocks) : 0,
      },
    };
  }

  async findById(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) return null;

    return {
      id: product.id,
      productId: product.productId,
      name: product.name,
      categoryId: product.categoryId,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
      price: Number(product.price),
      quantity: product.quantity,
      stockDetails: product.stockDetails,
      status: product.status,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async create(data: any) {
    const product = await prisma.product.create({
      data,
      include: { category: true },
    });

    return {
      id: product.id,
      productId: product.productId,
      name: product.name,
      categoryId: product.categoryId,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
      price: Number(product.price),
      quantity: product.quantity,
      stockDetails: product.stockDetails,
      status: product.status,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async update(id: number, data: any) {
    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    return {
      id: product.id,
      productId: product.productId,
      name: product.name,
      categoryId: product.categoryId,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
      price: Number(product.price),
      quantity: product.quantity,
      stockDetails: product.stockDetails,
      status: product.status,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async delete(id: number) {
    await prisma.product.delete({ where: { id } });
  }

  async bulkDelete(ids: number[]) {
    const result = await prisma.product.deleteMany({
      where: { id: { in: ids } },
    });
    return result.count;
  }

  async bulkUpdateStatus(ids: number[], status: 'STOCK_IN' | 'STOCK_OUT') {
    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
    return result.count;
  }

  private buildWhere(filter: Partial<ProductFilter>): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};

    if (filter.name) {
      where.name = { contains: filter.name };
    }

    if (filter.categoryIds && filter.categoryIds.length > 0) {
      where.categoryId = { in: filter.categoryIds };
    }

    if (filter.statuses && filter.statuses.length > 0) {
      where.status = { in: filter.statuses };
    }

    if (filter.priceMin !== undefined || filter.priceMax !== undefined) {
      where.price = {};
      if (filter.priceMin !== undefined) where.price.gte = filter.priceMin;
      if (filter.priceMax !== undefined) where.price.lte = filter.priceMax;
    }

    if (filter.stockMin !== undefined || filter.stockMax !== undefined) {
      where.stockDetails = {};
      if (filter.stockMin !== undefined) where.stockDetails.gte = filter.stockMin;
      if (filter.stockMax !== undefined) where.stockDetails.lte = filter.stockMax;
    }

    return where;
  }
}
