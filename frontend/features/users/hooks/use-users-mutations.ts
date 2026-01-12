"use client";

import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";

interface UseUsersMutationsProps {
  refetchUsers: () => void;
}

export function useUsersMutations({ refetchUsers }: UseUsersMutationsProps) {
  const deleteMutation = trpc.user.delete.useMutation({
    onSuccess: () => {
      toast.success("Employee deleted successfully", {
        description: "The employee has been removed from the system.",
      });
      refetchUsers();
    },
    onError: (error) => {
      toast.error("Failed to delete employee", {
        description: error.message || "Unable to delete employee.",
      });
    },
  });

  const bulkDeleteMutation = trpc.user.delete.useMutation();
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const bulkStatusMutation = trpc.user.update.useMutation();
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const handleBulkDelete = async (userIds: number[]) => {
    if (userIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      await Promise.all(
        userIds.map((id) => bulkDeleteMutation.mutateAsync({ id }))
      );
      toast.success("Employees deleted successfully", {
        description: `${userIds.length} employee${
          userIds.length !== 1 ? "s" : ""
        } removed from the system.`,
      });
      refetchUsers();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to delete employees.";
      toast.error("Failed to delete employees", { description: message });
      throw error;
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkStatusUpdate = async (
    userIds: number[],
    isActive: boolean
  ) => {
    if (userIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await Promise.all(
        userIds.map((id) => bulkStatusMutation.mutateAsync({ id, isActive }))
      );
      toast.success("Status updated successfully", {
        description: `${userIds.length} employee${
          userIds.length !== 1 ? "s" : ""
        } marked as ${isActive ? "active" : "inactive"}.`,
      });
      refetchUsers();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update employees.";
      toast.error("Failed to update status", { description: message });
      throw error;
    } finally {
      setIsBulkUpdating(false);
    }
  };

  return {
    deleteMutation,
    handleBulkDelete,
    isBulkDeleting,
    handleBulkStatusUpdate,
    isBulkUpdating,
  };
}
