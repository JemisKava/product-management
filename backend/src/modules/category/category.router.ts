import { router, viewProductProcedure } from '../../routers/trpc.ts';
import { CategoryService } from './category.service.ts';

const categoryService = new CategoryService();

export const categoryRouter = router({
  list: viewProductProcedure.query(async () => {
    return categoryService.listCategories();
  }),
});
