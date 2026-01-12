"use client";

import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import type { PermissionCode } from "@/lib/permissions";

export function usePermissionsSave(
  onSuccess?: () => void
) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const assignPermissionsMutation = trpc.user.assignPermissions.useMutation();

  const saveChanges = async (
    draftPermissions: Map<number, Set<PermissionCode>>
  ) => {
    if (draftPermissions.size === 0) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const updates = Array.from(draftPermissions.entries()).map(
        ([userId, permissions]) =>
          assignPermissionsMutation.mutateAsync({
            userId,
            permissionCodes: Array.from(permissions),
          })
      );
      await Promise.all(updates);
      toast.success("Permissions saved successfully", {
        description: `Updated permissions for ${draftPermissions.size} ${draftPermissions.size === 1 ? "employee" : "employees"}.`,
      });
      utils.user.list.invalidate();
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save permissions. Please try again.";
      toast.error("Failed to save permissions", {
        description: errorMessage,
      });
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    setSaveError(null);
  };

  return {
    isSaving,
    saveError,
    saveChanges,
    discardChanges,
  };
}
