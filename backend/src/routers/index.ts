import { router } from './trpc.ts';
import { authRouter } from '../modules/auth/auth.router.ts';
import { userRouter } from '../modules/user/user.router.ts';
import { productRouter } from '../modules/product/product.router.ts';
import { categoryRouter } from '../modules/category/category.router.ts';
import { roleRouter } from '../modules/role/role.router.ts';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  product: productRouter,
  category: categoryRouter,
  role: roleRouter,
});

export type AppRouter = typeof appRouter;
