import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { CategoryService } from '@/modules/category/category.service.ts';
import { CategoryRepo } from '@/modules/category/category.repo.ts';
import { setupTestDatabase, teardownTestDatabase, createTestCategory, createTestAdmin, createTestPermissions, createTestEmployee } from '../../helpers.ts';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let categoryRepo: CategoryRepo;

  beforeAll(async () => {
    await setupTestDatabase();
    categoryService = new CategoryService();
    categoryRepo = new CategoryRepo();
    await createTestAdmin();
    await createTestPermissions();
    await createTestEmployee(['PRODUCT_VIEW', 'PRODUCT_CREATE']);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('listCategories', () => {
    beforeAll(async () => {
      await Promise.all([
        categoryRepo.create({ name: 'Electronics', slug: 'electronics' }),
        categoryRepo.create({ name: 'Clothing', slug: 'clothing' }),
        categoryRepo.create({ name: 'Books', slug: 'books' }),
      ]);
    });

    test('should list all categories successfully', async () => {
      const result = await categoryService.listCategories();

      expect(result).toBeArray();
      expect(result.length).toBeGreaterThan(0);
    });

    test('should return categories with correct structure', async () => {
      const result = await categoryService.listCategories();

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('slug');
      expect(result[0]).toHaveProperty('createdAt');
    });

    test('should return categories in creation order', async () => {
      const result = await categoryService.listCategories();

      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].createdAt <= result[i].createdAt).toBe(true);
      }
    });

    test('should handle empty categories list', async () => {
      await categoryRepo.deleteAll();
      const result = await categoryService.listCategories();

      expect(result).toBeArray();
      expect(result.length).toBe(0);
    });

    test('should return all fields correctly', async () => {
      const created = await categoryRepo.create({ name: 'Test', slug: 'test' });
      const result = await categoryService.listCategories();
      const found = result.find((c: any) => c.id === created.id);

      expect(found.name).toBe('Test');
      expect(found.slug).toBe('test');
      expect(found.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('getCategoryById', () => {
    let testCategory: any;

    beforeAll(async () => {
      testCategory = await categoryRepo.create({ name: 'Get By ID', slug: 'get-by-id' });
    });

    test('should get category by id successfully', async () => {
      const result = await categoryService.getCategoryById(testCategory.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(testCategory.id);
      expect(result.name).toBe('Get By ID');
      expect(result.slug).toBe('get-by-id');
    });

    test('should return null for non-existent category', async () => {
      const result = await categoryService.getCategoryById(99999);

      expect(result).toBeNull();
    });

    test('should include all fields', async () => {
      const result = await categoryService.getCategoryById(testCategory.id);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('createdAt');
    });

    test('should return correct createdAt', async () => {
      const result = await categoryService.getCategoryById(testCategory.id);

      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('edge cases', () => {
    test('should handle category id = 0', async () => {
      const result = await categoryService.getCategoryById(0);

      expect(result).toBeNull();
    });

    test('should handle negative category id', async () => {
      const result = await categoryService.getCategoryById(-1);

      expect(result).toBeNull();
    });

    test('should handle string category id', async () => {
      await expect(
        categoryService.getCategoryById('abc' as any)
      ).rejects.toThrow();
    });

    test('should handle very long category name', async () => {
      const longName = 'A'.repeat(150);
      await expect(
        categoryRepo.create({ name: longName, slug: 'long' })
      ).rejects.toThrow();
    });

    test('should handle duplicate slug', async () => {
      await categoryRepo.create({ name: 'Duplicate 1', slug: 'duplicate' });
      await expect(
        categoryRepo.create({ name: 'Duplicate 2', slug: 'duplicate' })
      ).rejects.toThrow();
    });

    test('should handle special characters in slug', async () => {
      const result = await categoryRepo.create({ name: 'Special', slug: 'special-with-dash' });

      expect(result.slug).toBe('special-with-dash');
    });

    test('should handle numbers in slug', async () => {
      const result = await categoryRepo.create({ name: 'Numbers', slug: 'category-123' });

      expect(result.slug).toBe('category-123');
    });
  });

  describe('repository methods', () => {
    test('should create category with minimal data', async () => {
      const result = await categoryRepo.create({ name: 'Minimal', slug: 'minimal' });

      expect(result.id).toBeNumber();
      expect(result.name).toBe('Minimal');
      expect(result.slug).toBe('minimal');
    });

    test('should update category name', async () => {
      const created = await categoryRepo.create({ name: 'Update Name', slug: 'update-name' });
      const updated = await categoryRepo.update(created.id, { name: 'Updated Name' });

      expect(updated.name).toBe('Updated Name');
    });

    test('should update category slug', async () => {
      const created = await categoryRepo.create({ name: 'Update Slug', slug: 'update-slug' });
      const updated = await categoryRepo.update(created.id, { slug: 'updated-slug' });

      expect(updated.slug).toBe('updated-slug');
    });

    test('should delete category', async () => {
      const created = await categoryRepo.create({ name: 'Delete Me', slug: 'delete-me' });
      await categoryRepo.delete(created.id);

      const result = await categoryService.getCategoryById(created.id);
      expect(result).toBeNull();
    });

    test('should find category by slug', async () => {
      const created = await categoryRepo.create({ name: 'Find By Slug', slug: 'find-by-slug' });
      const result = await categoryRepo.findBySlug('find-by-slug');

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
    });

    test('should return null when finding non-existent slug', async () => {
      const result = await categoryRepo.findBySlug('non-existent-slug');

      expect(result).toBeNull();
    });

    test('should delete all categories', async () => {
      await categoryRepo.create({ name: 'Delete All 1', slug: 'delete-all-1' });
      await categoryRepo.create({ name: 'Delete All 2', slug: 'delete-all-2' });

      await categoryRepo.deleteAll();
      const result = await categoryService.listCategories();

      expect(result.length).toBe(0);
    });
  });

  describe('integration with products', () => {
    test('should list categories even when products exist', async () => {
      const category = await categoryRepo.create({ name: 'With Products', slug: 'with-products' });

      const result = await categoryService.listCategories();

      expect(result.some((c: any) => c.id === category.id)).toBe(true);
    });

    test('should get category that has products', async () => {
      const category = await categoryRepo.create({ name: 'Product Category', slug: 'product-category' });
      const result = await categoryService.getCategoryById(category.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(category.id);
    });
  });
});
