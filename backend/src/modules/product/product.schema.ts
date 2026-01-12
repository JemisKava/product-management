/**
 * Product Schemas
 *
 * Zod validation schemas for product management.
 */

import { z } from "zod";

// ============================================
// ENUMS
// ============================================

export const productStatusSchema = z.enum(["STOCK_IN", "STOCK_OUT"]);
export type ProductStatus = z.infer<typeof productStatusSchema>;

// ============================================
// CUSTOM VALIDATORS
// ============================================

const isValidImageUrl = (val: string) => {
  if (val.startsWith("/")) return true;
  try {
    new URL(val);
    return true;
  } catch {
    return false;
  }
};

const parseImageUrls = (val: string) => {
  const raw = val.trim();
  if (!raw) return [];
  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return null;
    }
  }
  if (raw.includes(",") || raw.includes("|") || raw.includes("\n")) {
    return raw
      .split(/[,\n|]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [raw];
};

const imageUrlSchema = z
  .string()
  .refine((val) => {
    const urls = parseImageUrls(val);
    if (!urls) return false;
    return urls.every((url) => isValidImageUrl(url));
  }, { message: "Invalid image URL or path" })
  .nullable()
  .optional();

// ============================================
// CREATE PRODUCT
// ============================================

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(255, "Product name must be less than 255 characters"),
  categoryId: z.number().int().positive("Category is required"),
  price: z
    .number()
    .positive("Price must be greater than 0")
    .max(9999999.99, "Price is too high"),
  quantity: z.number().int().min(0, "Quantity cannot be negative").default(0),
  stockDetails: z.number().int().min(0, "Stock details cannot be negative").default(0),
  status: productStatusSchema.default("STOCK_IN"),
  imageUrl: imageUrlSchema,
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

// ============================================
// UPDATE PRODUCT
// ============================================

export const updateProductSchema = z.object({
  id: z.number().int().positive(),
  name: z
    .string()
    .min(1, "Product name is required")
    .max(255, "Product name must be less than 255 characters")
    .optional(),
  categoryId: z.number().int().positive().optional(),
  price: z
    .number()
    .positive("Price must be greater than 0")
    .max(9999999.99, "Price is too high")
    .optional(),
  quantity: z.number().int().min(0, "Quantity cannot be negative").optional(),
  stockDetails: z.number().int().min(0, "Stock details cannot be negative").optional(),
  status: productStatusSchema.optional(),
  imageUrl: imageUrlSchema,
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ============================================
// PRODUCT ID
// ============================================

export const productIdSchema = z.object({
  id: z.number().int().positive(),
});

export type ProductIdInput = z.infer<typeof productIdSchema>;

export const productIdStringSchema = z.object({
  productId: z.string().regex(/^PRD\d{3,}$/, "Invalid product ID format"),
});

export type ProductIdStringInput = z.infer<typeof productIdStringSchema>;

// ============================================
// LIST PRODUCTS (with filters)
// ============================================

export const listProductsSchema = z.object({
  // Pagination
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),

  // Text search
  name: z.string().optional(),

  // Multi-select filters
  categoryIds: z.array(z.number().int().positive()).optional(),
  statuses: z.array(productStatusSchema).optional(),

  // Range filters
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  stockMin: z.number().int().min(0).optional(),
  stockMax: z.number().int().min(0).optional(),

  // Sorting
  sortBy: z.enum(["name", "price", "quantity", "stockDetails", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ListProductsInput = z.infer<typeof listProductsSchema>;

// ============================================
// FILTER OPTIONS (for dynamic ranges)
// ============================================

export const filterOptionsInputSchema = z.object({
  // Current filters applied (to calculate dynamic ranges)
  categoryIds: z.array(z.number().int().positive()).optional(),
  statuses: z.array(productStatusSchema).optional(),
  name: z.string().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  stockMin: z.number().int().min(0).optional(),
  stockMax: z.number().int().min(0).optional(),
});

export type FilterOptionsInput = z.infer<typeof filterOptionsInputSchema>;

// ============================================
// BULK OPERATIONS
// ============================================

export const bulkDeleteSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, "Select at least one product"),
});

export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;

export const bulkUpdateStatusSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, "Select at least one product"),
  status: productStatusSchema,
});

export type BulkUpdateStatusInput = z.infer<typeof bulkUpdateStatusSchema>;

// ============================================
// RESPONSE TYPES
// ============================================

export const productSchema = z.object({
  id: z.number(),
  productId: z.string(),
  name: z.string(),
  categoryId: z.number(),
  category: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  }),
  price: z.number(),
  quantity: z.number(),
  stockDetails: z.number(),
  status: productStatusSchema,
  imageUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Product = z.infer<typeof productSchema>;

export const filterOptionsSchema = z.object({
  categories: z.array(z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  })),
  statuses: z.array(productStatusSchema),
  priceRange: z.object({
    min: z.number(),
    max: z.number(),
  }),
  stockRange: z.object({
    min: z.number(),
    max: z.number(),
  }),
});

export type FilterOptions = z.infer<typeof filterOptionsSchema>;

export const paginatedProductsSchema = z.object({
  products: z.array(productSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type PaginatedProducts = z.infer<typeof paginatedProductsSchema>;
