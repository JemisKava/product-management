"use client";

import { useCallback } from "react";
import { getCoreRowModel, useReactTable, type RowSelectionState } from "@tanstack/react-table";
import { DataTable, type DataTableStickyContext } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { MemoizedProductFilters } from "@/components/products/product-filters";
import { useProductsTableColumns } from "./products-table-columns";
import { ProductsSelectionBanner } from "./products-selection-banner";
import type { ProductRow } from "../products-utils";
import type { ProductFilterStatus } from "@/components/products/product-filters";

interface ProductsContentProps {
  products: ProductRow[];
  canBulk: boolean;
  canEdit: boolean;
  canDelete: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  isLoading: boolean;
  error: string | undefined;
  searchInput: string;
  categoryIds: number[];
  statuses: ProductFilterStatus[];
  priceMinInput: number | null;
  priceMaxInput: number | null;
  stockMinInput: number | null;
  stockMaxInput: number | null;
  filterOptions: {
    categories: Array<{ id: number; name: string }>;
    priceRange: { min: number; max: number };
    stockRange: { min: number; max: number };
  } | null;
  statusOptions: ProductFilterStatus[];
  filterOptionsLoading: boolean;
  rowSelection: RowSelectionState;
  setRowSelection: (selection: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void;
  selectedCount: number;
  selectedProductsPreview: Array<{ id: number; name: string; productId: string }>;
  extraSelectedCount: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (categories: number[]) => void;
  onStatusChange: (statuses: ProductFilterStatus[]) => void;
  onPriceMinChange: (value: number | null) => void;
  onPriceMaxChange: (value: number | null) => void;
  onStockMinChange: (value: number | null) => void;
  onStockMaxChange: (value: number | null) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (product: ProductRow) => void;
  onClearSelection: () => void;
  onPreview: () => void;
  onUpdateStatus: (status: ProductFilterStatus) => void;
  onBulkDelete: () => void;
  isUpdatingStatus: boolean;
  isDeleting: boolean;
}

export function ProductsContent({
  products,
  canBulk,
  canEdit,
  canDelete,
  page,
  pageSize,
  totalPages,
  totalItems,
  isLoading,
  error,
  searchInput,
  categoryIds,
  statuses,
  priceMinInput,
  priceMaxInput,
  stockMinInput,
  stockMaxInput,
  filterOptions,
  statusOptions,
  filterOptionsLoading,
  rowSelection,
  setRowSelection,
  selectedCount,
  selectedProductsPreview,
  extraSelectedCount,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onPriceMinChange,
  onPriceMaxChange,
  onStockMinChange,
  onStockMaxChange,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
  onDelete,
  onClearSelection,
  onPreview,
  onUpdateStatus,
  onBulkDelete,
  isUpdatingStatus,
  isDeleting,
}: ProductsContentProps) {
  const columns = useProductsTableColumns({
    canBulk,
    canEdit,
    canDelete,
    onView,
    onEdit,
    onDelete,
  });

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.max(totalPages, 1),
    enableRowSelection: canBulk,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => String(row.id),
    state: {
      pagination: {
        pageIndex: Math.max(page - 1, 0),
        pageSize,
      },
      rowSelection,
    },
  });

  // Memoize the renderPrependRows callback to prevent unnecessary re-renders
  // Only include filter values in dependencies, not callback functions
  const renderPrependRowsCallback = useCallback(
    ({ getStickyCellProps }: DataTableStickyContext) => (
      <MemoizedProductFilters
        canBulk={canBulk}
        showActions
        search={searchInput}
        categoryIds={categoryIds}
        statuses={statuses}
        priceMin={priceMinInput}
        priceMax={priceMaxInput}
        stockMin={stockMinInput}
        stockMax={stockMaxInput}
        categories={filterOptions?.categories ?? []}
        statusOptions={statusOptions}
        priceRange={filterOptions?.priceRange ?? { min: 0, max: 0 }}
        stockRange={filterOptions?.stockRange ?? { min: 0, max: 0 }}
        onSearchChange={onSearchChange}
        onCategoryChange={onCategoryChange}
        onStatusChange={onStatusChange}
        onPriceMinChange={onPriceMinChange}
        onPriceMaxChange={onPriceMaxChange}
        onStockMinChange={onStockMinChange}
        onStockMaxChange={onStockMaxChange}
        onClear={onClearFilters}
        isLoading={isLoading || filterOptionsLoading}
        getStickyCellProps={getStickyCellProps}
      />
    ),
    [
      canBulk,
      searchInput,
      categoryIds,
      statuses,
      priceMinInput,
      priceMaxInput,
      stockMinInput,
      stockMaxInput,
      filterOptions?.categories,
      filterOptions?.priceRange,
      filterOptions?.stockRange,
      statusOptions,
      isLoading,
      filterOptionsLoading,
      // Callback functions are stable so don't need to be in deps
      // but we include them to be safe - the memo comparison will ignore them anyway
      onSearchChange,
      onCategoryChange,
      onStatusChange,
      onPriceMinChange,
      onPriceMaxChange,
      onStockMinChange,
      onStockMaxChange,
      onClearFilters,
    ]
  );

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
          {canBulk && (
        <ProductsSelectionBanner
          selectedCount={selectedCount}
          selectedProductsPreview={selectedProductsPreview}
          extraSelectedCount={extraSelectedCount}
          canEdit={canEdit}
          canDelete={canDelete}
          onClearSelection={onClearSelection}
          onPreview={onPreview}
          onUpdateStatus={onUpdateStatus}
          onDelete={onBulkDelete}
          isUpdatingStatus={isUpdatingStatus}
          isDeleting={isDeleting}
        />
      )}

      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
          {error || "Unable to load products."}
        </div>
      ) : (
        <DataTable
          table={table}
          isLoading={isLoading}
          skeletonRows={pageSize}
          stickyColumns={canBulk ? 2 : 1}
          renderPrependRows={renderPrependRowsCallback}
          emptyState={
            <span className="text-sm text-muted-foreground">
              No products match these filters.
            </span>
          }
        />
      )}

      {!error && (
        <DataTablePagination
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
