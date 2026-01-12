import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../../routers/trpc.ts';
import { AuthService } from './auth.service.ts';
import { loginSchema } from './auth.schema.ts';
import { env } from '../../config/env.ts';

const authService = new AuthService();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export const authRouter = router({
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await authService.login(input.email, input.password);
      
      ctx.res.cookie('refresh_token', result.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return {
        user: result.user,
        permissions: result.permissions,
        accessToken: result.accessToken,
      };
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    const refreshToken = ctx.req.cookies?.refresh_token;
    const result = await authService.logout(refreshToken);
    ctx.res.clearCookie('refresh_token', { path: '/' });
    return result;
  }),

  refresh: publicProcedure.mutation(async ({ ctx }) => {
    const refreshToken = ctx.req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Refresh token not found',
      });
    }

    return authService.refresh(refreshToken);
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return authService.me(
      ctx.user!.id,
      ctx.user!.email,
      ctx.user!.name,
      ctx.user!.role,
      ctx.user!.permissions
    );
  }),
});
