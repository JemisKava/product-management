import {
  router,
  viewProductProcedure,
  createProductProcedure,
  editProductProcedure,
  deleteProductProcedure,
  bulkProductProcedure,
} from '../../routers/trpc.ts';
import { ProductService } from './product.service.ts';
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  listProductsSchema,
  filterOptionsInputSchema,
  bulkDeleteSchema,
  bulkUpdateStatusSchema,
} from './product.schema.ts';

const productService = new ProductService();

export const productRouter = router({
  list: viewProductProcedure
    .input(listProductsSchema)
    .query(async ({ input }) => {
      return productService.listProducts(
        {
          name: input.name,
          categoryIds: input.categoryIds,
          statuses: input.statuses,
          priceMin: input.priceMin,
          priceMax: input.priceMax,
          stockMin: input.stockMin,
          stockMax: input.stockMax,
          sortBy: input.sortBy,
          sortOrder: input.sortOrder,
        },
        {
          page: input.page,
          limit: input.limit,
        }
      );
    }),

  getFilterOptions: viewProductProcedure
    .input(filterOptionsInputSchema)
    .query(async ({ input }) => {
      return productService.getFilterOptions(input);
    }),

  getById: viewProductProcedure
    .input(productIdSchema)
    .query(async ({ input }) => {
      return productService.getProductById(input.id);
    }),

  create: createProductProcedure
    .input(createProductSchema)
    .mutation(async ({ input }) => {
      return productService.createProduct(input);
    }),

  update: editProductProcedure
    .input(updateProductSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return productService.updateProduct(id, data);
    }),

  delete: deleteProductProcedure
    .input(productIdSchema)
    .mutation(async ({ input }) => {
      await productService.deleteProduct(input.id);
      return { success: true };
    }),

  bulkDelete: bulkProductProcedure
    .input(bulkDeleteSchema)
    .mutation(async ({ input }) => {
      return productService.bulkDelete(input.ids);
    }),

  bulkUpdateStatus: bulkProductProcedure
    .input(bulkUpdateStatusSchema)
    .mutation(async ({ input }) => {
      return productService.bulkUpdateStatus(input.ids, input.status);
    }),
});
