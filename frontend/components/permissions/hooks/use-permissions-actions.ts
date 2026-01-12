"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import {
  arePermissionSetsEqual,
  type EmployeeMeta,
} from "../permissions-utils";
import type { PermissionCode } from "@/lib/permissions";

interface UsePermissionsActionsProps {
  basePermissionsByUser: Map<number, Set<PermissionCode>>;
  userMetaById: Map<number, EmployeeMeta>;
  setDraftPermissions: React.Dispatch<
    React.SetStateAction<Map<number, Set<PermissionCode>>>
  >;
}

export function usePermissionsActions({
  basePermissionsByUser,
  userMetaById,
  setDraftPermissions,
}: UsePermissionsActionsProps) {
  const handleTogglePermission = useCallback(
    (userId: number, permission: PermissionCode) => {
      let bulkAutoRemoved = false;
      let affectedUserName = "";

      setDraftPermissions((prev) => {
        const next = new Map(prev);
        const baseSet =
          basePermissionsByUser.get(userId) ?? new Set<PermissionCode>();
        const currentSet = next.get(userId)
          ? new Set(next.get(userId)!)
          : new Set(baseSet);

        if (currentSet.has(permission)) {
          currentSet.delete(permission);
        } else {
          currentSet.add(permission);
        }

        // If unchecking PRODUCT_EDIT or PRODUCT_DELETE, check if we need to auto-uncheck PRODUCT_BULK
        if (
          (permission === "PRODUCT_EDIT" || permission === "PRODUCT_DELETE") &&
          !currentSet.has(permission) // being unchecked
        ) {
          const hasEdit = currentSet.has("PRODUCT_EDIT");
          const hasDelete = currentSet.has("PRODUCT_DELETE");

          if (!hasEdit && !hasDelete && currentSet.has("PRODUCT_BULK")) {
            currentSet.delete("PRODUCT_BULK");
            bulkAutoRemoved = true;
            affectedUserName =
              userMetaById.get(userId)?.name || `Employee #${userId}`;
          }
        }

        if (arePermissionSetsEqual(currentSet, baseSet)) {
          next.delete(userId);
        } else {
          next.set(userId, currentSet);
        }

        return next;
      });

      if (bulkAutoRemoved) {
        toast.info("Bulk Actions permission removed", {
          description: `Bulk Actions removed from ${affectedUserName}. This permission requires at least Product Edit or Product Delete to be assigned.`,
        });
      }
    },
    [basePermissionsByUser, userMetaById, setDraftPermissions]
  );

  const handleBulkApply = useCallback(
    (
      selectedUserIds: number[],
      permissions: PermissionCode[],
      replaceExisting: boolean
    ) => {
      if (selectedUserIds.length === 0) return;
      setDraftPermissions((prev) => {
        const next = new Map(prev);
        selectedUserIds.forEach((userId) => {
          const baseSet =
            basePermissionsByUser.get(userId) ?? new Set<PermissionCode>();
          const currentSet = next.get(userId)
            ? new Set(next.get(userId)!)
            : new Set(baseSet);

          const nextSet = replaceExisting
            ? new Set(permissions)
            : new Set([...currentSet, ...permissions]);

          if (arePermissionSetsEqual(nextSet, baseSet)) {
            next.delete(userId);
          } else {
            next.set(userId, nextSet);
          }
        });
        return next;
      });
    },
    [basePermissionsByUser, setDraftPermissions]
  );

  return {
    handleTogglePermission,
    handleBulkApply,
  };
}
