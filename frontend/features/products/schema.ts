import { z } from "zod";

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
  .refine(
    (val) => {
      const urls = parseImageUrls(val);
      if (!urls) return false;
      return urls.every((url) => isValidImageUrl(url));
    },
    { message: "Invalid image URL or path" }
  )
  .nullable()
  .optional();

export const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  categoryId: z.string().min(1, "Category is required"),
  price: z
    .number({ error: "Price is required" })
    .positive("Price must be greater than 0"),
  quantity: z
    .number({ error: "Quantity is required" })
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),
  stockDetails: z
    .number({ error: "Stock details are required" })
    .int("Stock details must be a whole number")
    .min(0, "Stock details cannot be negative"),
  status: z.enum(["STOCK_IN", "STOCK_OUT"]),
  imageUrl: imageUrlSchema,
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const PRODUCT_DEFAULT_VALUES: ProductFormValues = {
  name: "",
  categoryId: "",
  price: 0,
  quantity: 0,
  stockDetails: 0,
  status: "STOCK_IN",
  imageUrl: null,
};
