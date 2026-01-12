"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";
import type { ProductRow, ProductMeta } from "../products-utils";
import type { ProductFilterStatus } from "@/components/products/product-filters";

export function useProductsSelection(products: ProductRow[]) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Cache product metadata for selected items
  const productMetaByIdRef = useRef<Map<number, ProductMeta>>(new Map());

  // Update product metadata cache when data changes
  useEffect(() => {
    products.forEach((product) => {
      productMetaByIdRef.current.set(product.id, {
        name: product.name,
        productId: product.productId,
        categoryName: product.category.name,
        price: product.price,
        stockDetails: product.stockDetails,
        status: product.status,
      });
    });
  }, [products]);

  const selectedIds = useMemo(() => {
    return Object.entries(rowSelection)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => Number(id))
      .filter((id) => !isNaN(id));
  }, [rowSelection]);

  const selectedProductsPreview = useMemo(() => {
    return selectedIds.slice(0, 4).map((id) => {
      const meta = productMetaByIdRef.current.get(id);
      return {
        id,
        name: meta?.name ?? `Product #${id}`,
        productId: meta?.productId ?? `PRD${id}`,
      };
    });
  }, [selectedIds]);

  const previewProducts = useMemo(() => {
    return selectedIds.map((id) => {
      const meta = productMetaByIdRef.current.get(id);
      return {
        id,
        productId: meta?.productId ?? `PRD${id}`,
        name: meta?.name ?? `Product #${id}`,
        categoryName: meta?.categoryName ?? "—",
        price: meta?.price,
        stockDetails: meta?.stockDetails,
        status: meta?.status,
      };
    });
  }, [selectedIds]);

  const extraSelectedCount = Math.max(
    selectedIds.length - selectedProductsPreview.length,
    0
  );

  return {
    rowSelection,
    setRowSelection,
    selectedIds,
    selectedProductsPreview,
    previewProducts,
    extraSelectedCount,
  };
}
