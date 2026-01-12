import type { ProductFilterStatus } from "@/components/products/product-filters";

export type ProductRow = {
  id: number;
  productId: string;
  name: string;
  category: { id: number; name: string; slug: string };
  price: number;
  quantity: number;
  stockDetails: number;
  status: ProductFilterStatus;
  imageUrl: string | null;
};

export type ProductMeta = {
  name: string;
  productId: string;
  categoryName: string;
  price: number;
  stockDetails: number;
  status: ProductFilterStatus;
};

export const STATUS_STYLES: Record<ProductFilterStatus, string> = {
  STOCK_IN:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30",
  STOCK_OUT:
    "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30",
};
