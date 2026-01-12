"use client";

import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import type { ProductFilterStatus } from "@/components/products/product-filters";

export function useProductsMutations() {
  const utils = trpc.useUtils();

  const handleMutationError = async (
    error: { message?: string; data?: { code?: string } | null },
    fallbackMessage: string,
    onForbidden?: () => void
  ) => {
    toast.error(error.message || fallbackMessage);
    if (error.data?.code === "FORBIDDEN") {
      onForbidden?.();
      await utils.auth.me.invalidate();
    }
  };

  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: async () => {
      toast.success("Product deleted successfully", {
        description: "The product has been removed from the inventory.",
      });
      await utils.product.list.invalidate();
    },
    onError: (error) => {
      void handleMutationError(error, "Unable to delete product.");
    },
  });

  const bulkDeleteMutation = trpc.product.bulkDelete.useMutation({
    onSuccess: async (data) => {
      toast.success("Products deleted successfully", {
        description: `${data.deletedCount} ${data.deletedCount === 1 ? "product" : "products"} removed from inventory.`,
      });
      await utils.product.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete products", {
        description: error.message || "Unable to delete products.",
      });
      void handleMutationError(error, "Unable to delete products.");
    },
  });

  const bulkUpdateStatusMutation = trpc.product.bulkUpdateStatus.useMutation({
    onSuccess: async (data) => {
      toast.success("Status updated successfully", {
        description: `${data.updatedCount} ${data.updatedCount === 1 ? "product" : "products"} updated.`,
      });
      await utils.product.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update status", {
        description: error.message || "Unable to update products.",
      });
      void handleMutationError(error, "Unable to update products.");
    },
  });

  return {
    deleteMutation,
    bulkDeleteMutation,
    bulkUpdateStatusMutation,
  };
}
