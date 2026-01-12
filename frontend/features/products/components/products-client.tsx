"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { ProductsSkeleton } from "@/components/dashboard/products-skeleton";
import { ProductModal } from "@/features/products/components/product-modal";
import { DeleteConfirmation } from "@/components/products/delete-confirmation";
import { ProductsHeader } from "./products-header";
import { ProductsContent } from "./products-content";
import { ProductsBulkPreviewDialog } from "./products-bulk-preview-dialog";
import { useProductsQueryState } from "../hooks/use-products-query-state";
import { useProductsFilters } from "../hooks/use-products-filters";
import { useProductsAuth } from "../hooks/use-products-auth";
import { useProductsData } from "../hooks/use-products-data";
import { useProductsMutations } from "../hooks/use-products-mutations";
import { useProductsSelection } from "../hooks/use-products-selection";
import { useProductsModal } from "../hooks/use-products-modal";
import type { ProductRow } from "../products-utils";
import type { ProductFilterStatus } from "@/components/products/product-filters";

export function ProductsClient() {
  // Query state
  const queryState = useProductsQueryState();

  // Filters
  const filters = useProductsFilters({
    searchQuery: queryState.searchQuery,
    priceMin: queryState.priceMin,
    priceMax: queryState.priceMax,
    stockMin: queryState.stockMin,
    stockMax: queryState.stockMax,
    statusValues: queryState.statusValues,
    setSearchQuery: queryState.setSearchQuery,
    setPriceMin: queryState.setPriceMin,
    setPriceMax: queryState.setPriceMax,
    setStockMin: queryState.setStockMin,
    setStockMax: queryState.setStockMax,
    setPage: queryState.setPage,
  });

  // Auth
  const auth = useProductsAuth();

  // Data
  const data = useProductsData({
    page: queryState.page,
    pageSize: queryState.pageSize,
    searchQuery: queryState.searchQuery,
    categoryIds: queryState.categoryIds,
    statuses: filters.statuses,
    priceMin: queryState.priceMin,
    priceMax: queryState.priceMax,
    stockMin: queryState.stockMin,
    stockMax: queryState.stockMax,
    isAuthenticated: auth.isAuthenticated,
    canViewProducts: auth.canViewProducts,
    setPage: queryState.setPage,
  });

  // Mutations
  const mutations = useProductsMutations();

  // Selection
  const selection = useProductsSelection(data.products);

  // Modal
  const modal = useProductsModal({
    modalState: queryState.modalState,
    modalProductId: queryState.modalProductId,
    setModalState: queryState.setModalState,
    setModalProductId: queryState.setModalProductId,
    canCreate: auth.canCreate,
    canEdit: auth.canEdit,
  });

  // Local state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkPreviewOpen, setBulkPreviewOpen] = useState(false);
  const [bulkPreviewAction, setBulkPreviewAction] = useState<
    { type: "delete" } | { type: "status"; status: ProductFilterStatus } | null
  >(null);

  // Handlers
  const handleDeleteClick = (product: ProductRow) => {
    setDeleteTarget({ id: product.id, name: product.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    mutations.deleteMutation.mutate(
      { id: deleteTarget.id },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        },
        onError: () => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        },
      }
    );
  };

  const handleCategoryChange = (nextCategories: number[]) => {
    queryState.setCategoryIds(
      nextCategories.length > 0 ? nextCategories : null
    );
    queryState.setPage(1);
  };

  const handleStatusChange = (nextStatuses: ProductFilterStatus[]) => {
    queryState.setStatusValues(
      nextStatuses.length > 0 ? nextStatuses : null
    );
    queryState.setPage(1);
  };

  const openBulkPreview = (
    action?:
      | { type: "delete" }
      | { type: "status"; status: ProductFilterStatus }
  ) => {
    if (selection.selectedIds.length === 0) return;
    setBulkPreviewAction(action ?? null);
    setBulkPreviewOpen(true);
  };

  const handleBulkDeleteConfirm = () => {
    if (selection.selectedIds.length === 0) return;
    mutations.bulkDeleteMutation.mutate(
      { ids: selection.selectedIds },
      {
        onSuccess: () => {
          selection.setRowSelection({});
          setBulkPreviewOpen(false);
          setBulkPreviewAction(null);
        },
        onError: () => {
          selection.setRowSelection({});
          setBulkPreviewOpen(false);
          setBulkPreviewAction(null);
        },
      }
    );
  };

  const handleBulkStatusUpdate = (status: ProductFilterStatus) => {
    if (selection.selectedIds.length === 0) return;
    mutations.bulkUpdateStatusMutation.mutate(
      { ids: selection.selectedIds, status },
      {
        onSuccess: () => {
          selection.setRowSelection({});
          setBulkPreviewOpen(false);
          setBulkPreviewAction(null);
        },
        onError: () => {
          selection.setRowSelection({});
        },
      }
    );
  };

  const handleClearFilters = () => {
    // Clear all filter inputs
    filters.handleClearFilters();
    // Clear category and status filters from URL
    queryState.setCategoryIds(null);
    queryState.setStatusValues(null);
  };

  // Loading state
  if (auth.isLoading) {
    return <AuthLoadingScreen variant="dashboard" />;
  }

  // Guard clauses
  if (!auth.isAuthenticated || !auth.user) {
    return null;
  }

  if (!auth.canViewProducts) {
    return (
      <DashboardShell title="Products">
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 w-full">
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
            You do not have permission to view products.
          </div>
        </main>
      </DashboardShell>
    );
  }

  // Show skeleton on initial load when data is not yet available
  const isInitialLoad = data.productsLoading && !data.productsData;

  return (
    <DashboardShell title="Products">
      {isInitialLoad ? (
        <ProductsSkeleton />
      ) : (
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 w-full">
        <div className="flex flex-col gap-4 sm:gap-6">
          <ProductsHeader
            canCreate={auth.canCreate}
            onCreateClick={modal.openCreateModal}
          />

          <ProductsContent
            products={data.products}
            canBulk={auth.canBulk}
            canEdit={auth.canEdit}
            canDelete={auth.canDelete}
            page={queryState.page}
            pageSize={queryState.pageSize}
            totalPages={data.productsData?.meta.totalPages ?? 1}
            totalItems={data.productsData?.meta.total ?? 0}
            isLoading={data.productsLoading}
            error={data.productsError?.message}
            searchInput={filters.searchInput}
            categoryIds={queryState.categoryIds}
            statuses={filters.statuses}
            priceMinInput={filters.priceMinInput}
            priceMaxInput={filters.priceMaxInput}
            stockMinInput={filters.stockMinInput}
            stockMaxInput={filters.stockMaxInput}
            filterOptions={
              data.filterOptions
                ? {
                    categories: data.filterOptions.categories,
                    priceRange: data.filterOptions.priceRange,
                    stockRange: data.filterOptions.stockRange,
                  }
                : null
            }
            statusOptions={data.statusOptions}
            filterOptionsLoading={data.filterOptionsLoading}
            rowSelection={selection.rowSelection}
            setRowSelection={selection.setRowSelection}
            selectedCount={selection.selectedIds.length}
            selectedProductsPreview={selection.selectedProductsPreview}
            extraSelectedCount={selection.extraSelectedCount}
            onSearchChange={filters.setSearchInput}
            onCategoryChange={handleCategoryChange}
            onStatusChange={handleStatusChange}
            onPriceMinChange={filters.setPriceMinInput}
            onPriceMaxChange={filters.setPriceMaxInput}
            onStockMinChange={filters.setStockMinInput}
            onStockMaxChange={filters.setStockMaxInput}
            onClearFilters={handleClearFilters}
            onPageChange={queryState.setPage}
            onPageSizeChange={(nextSize) => {
              queryState.setPageSize(nextSize);
              queryState.setPage(1);
            }}
            onView={modal.openViewModal}
            onEdit={modal.openEditModal}
            onDelete={handleDeleteClick}
            onClearSelection={() => selection.setRowSelection({})}
            onPreview={() => openBulkPreview()}
            onUpdateStatus={(status) => openBulkPreview({ type: "status", status })}
            onBulkDelete={() => openBulkPreview({ type: "delete" })}
            isUpdatingStatus={mutations.bulkUpdateStatusMutation.isPending}
            isDeleting={mutations.bulkDeleteMutation.isPending}
          />
        </div>
      </main>
      )}

      <ProductModal
        open={modal.modalOpen}
        mode={modal.modalMode ?? "create"}
        productId={modal.resolvedModalProductId}
        onClose={modal.closeModal}
      />

      <DeleteConfirmation
        open={deleteDialogOpen}
        productName={deleteTarget?.name}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={mutations.deleteMutation.isPending}
      />

      <ProductsBulkPreviewDialog
        open={bulkPreviewOpen}
        onOpenChange={(open) => {
          setBulkPreviewOpen(open);
          if (!open) {
            setBulkPreviewAction(null);
          }
        }}
        previewProducts={selection.previewProducts}
        selectedCount={selection.selectedIds.length}
        bulkPreviewAction={bulkPreviewAction}
        canEdit={auth.canEdit}
        canDelete={auth.canDelete}
        isUpdatingStatus={mutations.bulkUpdateStatusMutation.isPending}
        isDeleting={mutations.bulkDeleteMutation.isPending}
        onUpdateStatus={handleBulkStatusUpdate}
        onDelete={handleBulkDeleteConfirm}
      />
    </DashboardShell>
  );
}
