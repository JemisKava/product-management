import { z } from 'zod';

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.date(),
});
