import { trpc } from "@/lib/trpc/client";

export type ProductFilterOptionsInput = {
  name?: string;
  categoryIds?: number[];
  statuses?: Array<"STOCK_IN" | "STOCK_OUT">;
  priceMin?: number;
  priceMax?: number;
  stockMin?: number;
  stockMax?: number;
};

type ProductFilterOptionsParams = {
  enabled?: boolean;
};

export function useProductFilterOptions(
  currentFilters: ProductFilterOptionsInput,
  params: ProductFilterOptionsParams = {}
) {
  const query = trpc.product.getFilterOptions.useQuery(currentFilters, {
    refetchOnWindowFocus: false,
    enabled: params.enabled ?? true,
  });

  return {
    options: query.data,
    isLoading: query.isPending,
    error: query.error,
  };
}
