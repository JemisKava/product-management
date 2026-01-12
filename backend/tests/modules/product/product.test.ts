import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { ProductService } from '@/modules/product/product.service.ts';
import { setupTestDatabase, teardownTestDatabase, createTestAdmin, createTestCategory, createTestProduct, createTestPermissions, createTestEmployee } from '../../helpers.ts';
import { TRPCError } from '@trpc/server';

describe('ProductService', () => {
  let productService: ProductService;
  let adminUser: any;
  let employeeUser: any;
  let testCategory: any;

  beforeAll(async () => {
    await setupTestDatabase();
    productService = new ProductService();
    adminUser = await createTestAdmin();
    await createTestPermissions();
    employeeUser = await createTestEmployee(['PRODUCT_VIEW', 'PRODUCT_CREATE', 'PRODUCT_EDIT']);
    testCategory = await createTestCategory();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('listProducts', () => {
    let products: any[];

    beforeAll(async () => {
      products = await Promise.all([
        createTestProduct(testCategory.id, { name: 'Product A', price: 10, quantity: 5, status: 'STOCK_IN' }),
        createTestProduct(testCategory.id, { name: 'Product B', price: 20, quantity: 15, status: 'STOCK_IN' }),
        createTestProduct(testCategory.id, { name: 'Product C', price: 30, quantity: 0, status: 'STOCK_OUT' }),
      ]);
    });

    test('should list products successfully', async () => {
      const result = await productService.listProducts({}, { page: 1, limit: 10 });

      expect(result).toBeDefined();
      expect(result.products).toBeArray();
      expect(result.meta).toBeDefined();
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBeNumber();
      expect(result.meta.totalPages).toBeNumber();
    });

    test('should filter products by name', async () => {
      const result = await productService.listProducts({ name: 'Product A' }, { page: 1, limit: 10 });

      expect(result.products.length).toBeGreaterThan(0);
      expect(result.products.every((p: any) => p.name.includes('Product A'))).toBe(true);
    });

    test('should filter products by categoryIds', async () => {
      const result = await productService.listProducts({ categoryIds: [testCategory.id] }, { page: 1, limit: 10 });

      expect(result.products.length).toBeGreaterThan(0);
      expect(result.products.every((p: any) => p.categoryId === testCategory.id)).toBe(true);
    });

    test('should filter products by statuses', async () => {
      const result = await productService.listProducts({ statuses: ['STOCK_IN'] }, { page: 1, limit: 10 });

      expect(result.products.length).toBeGreaterThan(0);
      expect(result.products.every((p: any) => p.status === 'STOCK_IN')).toBe(true);
    });

    test('should filter products by price range', async () => {
      const result = await productService.listProducts({ priceMin: 15, priceMax: 25 }, { page: 1, limit: 10 });

      expect(result.products.length).toBeGreaterThan(0);
      expect(result.products.every((p: any) => p.price >= 15 && p.price <= 25)).toBe(true);
    });

    test('should filter products by stock range', async () => {
      const result = await productService.listProducts({ stockMin: 10, stockMax: 20 }, { page: 1, limit: 10 });

      expect(result.products.every((p: any) => p.quantity >= 10 && p.quantity <= 20)).toBe(true);
    });

    test('should sort products by name ascending', async () => {
      const result = await productService.listProducts({ sortBy: 'name', sortOrder: 'asc' }, { page: 1, limit: 10 });

      for (let i = 1; i < result.products.length; i++) {
        expect(result.products[i - 1].name <= result.products[i].name).toBe(true);
      }
    });

    test('should sort products by price descending', async () => {
      const result = await productService.listProducts({ sortBy: 'price', sortOrder: 'desc' }, { page: 1, limit: 10 });

      for (let i = 1; i < result.products.length; i++) {
        expect(result.products[i - 1].price >= result.products[i].price).toBe(true);
      }
    });

    test('should sort products by createdAt descending (default)', async () => {
      const result = await productService.listProducts({ sortBy: 'createdAt', sortOrder: 'desc' }, { page: 1, limit: 10 });

      for (let i = 1; i < result.products.length; i++) {
        expect(result.products[i - 1].createdAt >= result.products[i].createdAt).toBe(true);
      }
    });

    test('should paginate results correctly', async () => {
      const result1 = await productService.listProducts({}, { page: 1, limit: 1 });
      const result2 = await productService.listProducts({}, { page: 2, limit: 1 });

      expect(result1.products.length).toBe(1);
      expect(result1.meta.page).toBe(1);
      expect(result2.products.length).toBe(1);
      expect(result2.meta.page).toBe(2);
    });

    test('should calculate totalPages correctly', async () => {
      const result = await productService.listProducts({}, { page: 1, limit: 2 });

      expect(result.meta.totalPages).toBe(Math.ceil(result.meta.total / 2));
    });

    test('should handle multiple filters together', async () => {
      const result = await productService.listProducts(
        { categoryIds: [testCategory.id], statuses: ['STOCK_IN'], priceMin: 10 },
        { page: 1, limit: 10 }
      );

      expect(result.products.every((p: any) =>
        p.categoryId === testCategory.id &&
        p.status === 'STOCK_IN' &&
        p.price >= 10
      )).toBe(true);
    });

    test('should handle empty filters', async () => {
      const result = await productService.listProducts({}, { page: 1, limit: 10 });

      expect(result.products.length).toBeGreaterThan(0);
    });

    test('should return products with category', async () => {
      const result = await productService.listProducts({}, { page: 1, limit: 10 });

      expect(result.products[0]).toHaveProperty('category');
      expect(result.products[0].category).toHaveProperty('id');
      expect(result.products[0].category).toHaveProperty('name');
      expect(result.products[0].category).toHaveProperty('slug');
    });
  });

  describe('getFilterOptions', () => {
    test('should return filter options successfully', async () => {
      const result = await productService.getFilterOptions({});

      expect(result).toBeDefined();
      expect(result.categories).toBeArray();
      expect(result.statuses).toBeArray();
      expect(result.priceRange).toBeDefined();
      expect(result.stockRange).toBeDefined();
    });

    test('should return categories', async () => {
      const result = await productService.getFilterOptions({});

      expect(result.categories.length).toBeGreaterThan(0);
      expect(result.categories[0]).toHaveProperty('id');
      expect(result.categories[0]).toHaveProperty('name');
      expect(result.categories[0]).toHaveProperty('slug');
    });

    test('should return statuses', async () => {
      const result = await productService.getFilterOptions({});

      expect(result.statuses).toEqual(['STOCK_IN', 'STOCK_OUT']);
    });

    test('should return price range', async () => {
      const result = await productService.getFilterOptions({});

      expect(result.priceRange.min).toBeNumber();
      expect(result.priceRange.max).toBeNumber();
      expect(result.priceRange.min <= result.priceRange.max).toBe(true);
    });

    test('should return stock range', async () => {
      const result = await productService.getFilterOptions({});

      expect(result.stockRange.min).toBeNumber();
      expect(result.stockRange.max).toBeNumber();
      expect(result.stockRange.min <= result.stockRange.max).toBe(true);
    });

    test('should calculate ranges based on current filters', async () => {
      const result = await productService.getFilterOptions({ statuses: ['STOCK_IN'] });

      expect(result.priceRange).toBeDefined();
      expect(result.stockRange).toBeDefined();
    });

    test('should handle category filter in options calculation', async () => {
      const result = await productService.getFilterOptions({ categoryIds: [testCategory.id] });

      expect(result.categories.length).toBeGreaterThan(0);
    });

    test('should handle name filter in options calculation', async () => {
      const result = await productService.getFilterOptions({ name: 'Product' });

      expect(result).toBeDefined();
    });
  });

  describe('getProductById', () => {
    let testProduct: any;

    beforeAll(async () => {
      testProduct = await createTestProduct(testCategory.id, { name: 'Get By ID Product' });
    });

    test('should get product by id successfully', async () => {
      const result = await productService.getProductById(testProduct.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(testProduct.id);
      expect(result.name).toBe(testProduct.name);
      expect(result.productId).toBe(testProduct.productId);
    });

    test('should throw NOT_FOUND for non-existent product', async () => {
      await expect(
        productService.getProductById(99999)
      .rejects.toThrow(TRPCError);
    });

    test('should include category in result', async () => {
      const result = await productService.getProductById(testProduct.id);

      expect(result).toHaveProperty('category');
      expect(result.category).toHaveProperty('id');
      expect(result.category).toHaveProperty('name');
      expect(result.category).toHaveProperty('slug');
    });

    test('should include timestamps', async () => {
      const result = await productService.getProductById(testProduct.id);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('createProduct', () => {
    test('should create product successfully', async () => {
      const productData = {
        name: 'New Product',
        categoryId: testCategory.id,
        price: 99.99,
        quantity: 10,
        stockDetails: 15,
        status: 'STOCK_IN' as const,
      };

      const result = await productService.createProduct(productData);

      expect(result).toBeDefined();
      expect(result.name).toBe(productData.name);
      expect(result.categoryId).toBe(productData.categoryId);
      expect(result.price).toBe(productData.price);
      expect(result.productId).toMatch(/^PRD\d+$/);
    });

    test('should create product with default status', async () => {
      const productData = {
        name: 'Default Status Product',
        categoryId: testCategory.id,
        price: 50.00,
      };

      const result = await productService.createProduct(productData);

      expect(result.status).toBe('STOCK_IN');
    });

    test('should create product with imageUrl', async () => {
      const productData = {
        name: 'Image Product',
        categoryId: testCategory.id,
        price: 75.00,
        imageUrl: '/uploads/product.jpg',
      };

      const result = await productService.createProduct(productData);

      expect(result.imageUrl).toBe('/uploads/product.jpg');
    });

    test('should create product with full URL image', async () => {
      const productData = {
        name: 'Full URL Product',
        categoryId: testCategory.id,
        price: 85.00,
        imageUrl: 'https://example.com/product.jpg',
      };

      const result = await productService.createProduct(productData);

      expect(result.imageUrl).toBe('https://example.com/product.jpg');
    });

    test('should generate unique product ID', async () => {
      const product1 = await productService.createProduct({
        name: 'Unique 1',
        categoryId: testCategory.id,
        price: 10,
      });
      const product2 = await productService.createProduct({
        name: 'Unique 2',
        categoryId: testCategory.id,
        price: 20,
      });

      expect(product1.productId).not.toBe(product2.productId);
    });
  });

  describe('updateProduct', () => {
    let testProduct: any;

    beforeAll(async () => {
      testProduct = await createTestProduct(testCategory.id, { name: 'Update Me', price: 50 });
    });

    test('should update product name successfully', async () => {
      const result = await productService.updateProduct(testProduct.id, { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
    });

    test('should update product price successfully', async () => {
      const result = await productService.updateProduct(testProduct.id, { price: 99.99 });

      expect(result.price).toBe(99.99);
    });

    test('should update product quantity successfully', async () => {
      const result = await productService.updateProduct(testProduct.id, { quantity: 25 });

      expect(result.quantity).toBe(25);
    });

    test('should update product status successfully', async () => {
      const result = await productService.updateProduct(testProduct.id, { status: 'STOCK_OUT' });

      expect(result.status).toBe('STOCK_OUT');
    });

    test('should update product imageUrl successfully', async () => {
      const result = await productService.updateProduct(testProduct.id, { imageUrl: '/new-image.jpg' });

      expect(result.imageUrl).toBe('/new-image.jpg');
    });

    test('should update product category successfully', async () => {
      const newCategory = await createTestCategory();
      const result = await productService.updateProduct(testProduct.id, { categoryId: newCategory.id });

      expect(result.categoryId).toBe(newCategory.id);
    });

    test('should update multiple fields at once', async () => {
      const result = await productService.updateProduct(testProduct.id, {
        name: 'Multi Update',
        price: 150.00,
        quantity: 30,
        status: 'STOCK_IN',
      });

      expect(result.name).toBe('Multi Update');
      expect(result.price).toBe(150.00);
      expect(result.quantity).toBe(30);
      expect(result.status).toBe('STOCK_IN');
    });

    test('should throw NOT_FOUND for non-existent product', async () => {
      await expect(
        productService.updateProduct(99999, { name: 'Non-existent' })
      .rejects.toThrow(TRPCError);
    });
  });

  describe('deleteProduct', () => {
    let testProduct: any;

    beforeAll(async () => {
      testProduct = await createTestProduct(testCategory.id, { name: 'Delete Me' });
    });

    test('should delete product successfully', async () => {
      await productService.deleteProduct(testProduct.id);

      await expect(
        productService.getProductById(testProduct.id)
      .rejects.toThrow(TRPCError);
    });

    test('should throw NOT_FOUND for non-existent product', async () => {
      await expect(
        productService.deleteProduct(99999)
      .rejects.toThrow(TRPCError);
    });
  });

  describe('bulkDelete', () => {
    let testProducts: any[];

    beforeAll(async () => {
      testProducts = await Promise.all([
        createTestProduct(testCategory.id, { name: 'Bulk Delete 1' }),
        createTestProduct(testCategory.id, { name: 'Bulk Delete 2' }),
        createTestProduct(testCategory.id, { name: 'Bulk Delete 3' }),
      ]);
    });

    test('should delete multiple products successfully', async () => {
      const result = await productService.bulkDelete([testProducts[0].id, testProducts[1].id]);

      expect(result.deletedCount).toBe(2);

      await expect(
        productService.getProductById(testProducts[0].id)
      .rejects.toThrow(TRPCError);
      await expect(
        productService.getProductById(testProducts[1].id)
      .rejects.toThrow(TRPCError);
    });

    test('should throw BAD_REQUEST for empty ids array', async () => {
      await expect(
        productService.bulkDelete([])
      .rejects.toThrow(TRPCError);
    });

    test('should handle single product in bulk delete', async () => {
      const result = await productService.bulkDelete([testProducts[2].id]);

      expect(result.deletedCount).toBe(1);
    });

    test('should handle non-existent product ids gracefully', async () => {
      const result = await productService.bulkDelete([99999, 99998]);

      expect(result.deletedCount).toBe(0);
    });

    test('should handle mix of existing and non-existent ids', async () => {
      const newProduct = await createTestProduct(testCategory.id, { name: 'Mixed Delete' });
      const result = await productService.bulkDelete([newProduct.id, 99999]);

      expect(result.deletedCount).toBe(1);
    });
  });

  describe('bulkUpdateStatus', () => {
    let testProducts: any[];

    beforeAll(async () => {
      testProducts = await Promise.all([
        createTestProduct(testCategory.id, { name: 'Bulk Status 1', status: 'STOCK_IN' }),
        createTestProduct(testCategory.id, { name: 'Bulk Status 2', status: 'STOCK_IN' }),
        createTestProduct(testCategory.id, { name: 'Bulk Status 3', status: 'STOCK_IN' }),
      ]);
    });

    test('should update status of multiple products successfully', async () => {
      const result = await productService.bulkUpdateStatus([testProducts[0].id, testProducts[1].id], 'STOCK_OUT');

      expect(result.updatedCount).toBe(2);

      const p1 = await productService.getProductById(testProducts[0].id);
      const p2 = await productService.getProductById(testProducts[1].id);

      expect(p1.status).toBe('STOCK_OUT');
      expect(p2.status).toBe('STOCK_OUT');
    });

    test('should throw BAD_REQUEST for empty ids array', async () => {
      await expect(
        productService.bulkUpdateStatus([], 'STOCK_OUT')
      ).rejects.toThrow(TRPCError);
    });

    test('should update to STOCK_IN status', async () => {
      const result = await productService.bulkUpdateStatus([testProducts[2].id], 'STOCK_OUT');

      expect(result.updatedCount).toBe(1);

      await productService.bulkUpdateStatus([testProducts[2].id], 'STOCK_IN');
      const product = await productService.getProductById(testProducts[2].id);

      expect(product.status).toBe('STOCK_IN');
    });

    test('should handle single product in bulk update', async () => {
      const newProduct = await createTestProduct(testCategory.id, { status: 'STOCK_IN' });
      const result = await productService.bulkUpdateStatus([newProduct.id], 'STOCK_OUT');

      expect(result.updatedCount).toBe(1);
    });

    test('should handle non-existent product ids gracefully', async () => {
      const result = await productService.bulkUpdateStatus([99999, 99998], 'STOCK_OUT');

      expect(result.updatedCount).toBe(0);
    });
  });

  describe('edge cases', () => {
    test('should handle very large price', async () => {
      const product = await createTestProduct(testCategory.id, { price: 9999999.99 });

      expect(product.price).toBe(9999999.99);
    });

    test('should handle zero price', async () => {
      await expect(
        createTestProduct(testCategory.id, { price: 0 })
      ).rejects.toThrow();
    });

    test('should handle negative price', async () => {
      await expect(
        createTestProduct(testCategory.id, { price: -10 })
      ).rejects.toThrow();
    });

    test('should handle zero quantity', async () => {
      const product = await createTestProduct(testCategory.id, { quantity: 0 });

      expect(product.quantity).toBe(0);
    });

    test('should handle negative quantity', async () => {
      await expect(
        createTestProduct(testCategory.id, { quantity: -5 })
      ).rejects.toThrow();
    });

    test('should handle very long product name', async () => {
      const longName = 'A'.repeat(250);
      await expect(
        createTestProduct(testCategory.id, { name: longName })
      ).rejects.toThrow();
    });

    test('should handle pagination beyond available pages', async () => {
      const result = await productService.listProducts({}, { page: 999, limit: 10 });

      expect(result.products.length).toBe(0);
      expect(result.meta.page).toBe(999);
    });
  });
});
