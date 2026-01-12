"use client";

import { useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { useProductFilterOptions } from "@/hooks/use-product-filter-options";
import type { ProductFilterStatus } from "@/components/products/product-filters";

interface UseProductsDataProps {
  page: number;
  pageSize: number;
  searchQuery: string;
  categoryIds: number[];
  statuses: ProductFilterStatus[];
  priceMin: number | null;
  priceMax: number | null;
  stockMin: number | null;
  stockMax: number | null;
  isAuthenticated: boolean;
  canViewProducts: boolean;
  setPage: (value: number) => void;
}

export function useProductsData({
  page,
  pageSize,
  searchQuery,
  categoryIds,
  statuses,
  priceMin,
  priceMax,
  stockMin,
  stockMax,
  isAuthenticated,
  canViewProducts,
  setPage,
}: UseProductsDataProps) {
  const filterInputs = {
    name: searchQuery.trim() ? searchQuery : undefined,
    categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
    statuses: statuses.length > 0 ? statuses : undefined,
    priceMin: priceMin ?? undefined,
    priceMax: priceMax ?? undefined,
    stockMin: stockMin ?? undefined,
    stockMax: stockMax ?? undefined,
  };

  const { options: filterOptions, isLoading: filterOptionsLoading } =
    useProductFilterOptions(filterInputs, {
      enabled: isAuthenticated && canViewProducts,
    });

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = trpc.product.list.useQuery(
    {
      page,
      limit: pageSize,
      name: searchQuery.trim() ? searchQuery : undefined,
      categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
      statuses: statuses.length > 0 ? statuses : undefined,
      priceMin: priceMin ?? undefined,
      priceMax: priceMax ?? undefined,
      stockMin: stockMin ?? undefined,
      stockMax: stockMax ?? undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    {
      enabled: isAuthenticated && canViewProducts,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (!productsData) return;
    const maxPage = Math.max(productsData.meta.totalPages, 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, productsData, setPage]);

  const products = productsData?.products ?? [];

  const priceRange = filterOptions?.priceRange ?? { min: 0, max: 0 };
  const stockRange = filterOptions?.stockRange ?? { min: 0, max: 0 };
  const statusOptions = useMemo<ProductFilterStatus[]>(() => {
    const options = filterOptions?.statuses ?? ["STOCK_IN", "STOCK_OUT"];
    return Array.from(options);
  }, [filterOptions?.statuses]);

  return {
    products,
    productsData,
    productsLoading,
    productsError,
    filterOptions,
    filterOptionsLoading,
    priceRange,
    stockRange,
    statusOptions,
  };
}
