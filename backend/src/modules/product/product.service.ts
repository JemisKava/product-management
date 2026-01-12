import { TRPCError } from '@trpc/server';
import { ProductRepo } from './product.repo.ts';
import type { ProductFilter, PaginationParams } from './product.types.ts';
import { generateProductId } from '../../lib/productId.ts';

export class ProductService {
  private repo: ProductRepo;

  constructor() {
    this.repo = new ProductRepo();
  }

  async listProducts(filter: ProductFilter, pagination: PaginationParams) {
    return this.repo.findMany(filter, pagination);
  }

  async getFilterOptions(filter: Partial<ProductFilter>) {
    return this.repo.getFilterOptions(filter);
  }

  async getProductById(id: number) {
    const product = await this.repo.findById(id);
    if (!product) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Product not found',
      });
    }
    return product;
  }

  async createProduct(data: any) {
    const productId = await generateProductId();
    return this.repo.create({
      ...data,
      productId,
    });
  }

  async updateProduct(id: number, data: any) {
    await this.getProductById(id);
    return this.repo.update(id, data);
  }

  async deleteProduct(id: number) {
    await this.getProductById(id);
    await this.repo.delete(id);
  }

  async bulkDelete(ids: number[]) {
    if (ids.length === 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No products selected',
      });
    }
    const deletedCount = await this.repo.bulkDelete(ids);
    return { deletedCount };
  }

  async bulkUpdateStatus(ids: number[], status: 'STOCK_IN' | 'STOCK_OUT') {
    if (ids.length === 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No products selected',
      });
    }
    const updatedCount = await this.repo.bulkUpdateStatus(ids, status);
    return { updatedCount };
  }
}
