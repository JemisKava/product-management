"use client";

import { useState, useCallback } from "react";
import type { PermissionCode } from "@/lib/permissions";

export function usePermissionsDraft() {
  const [draftPermissions, setDraftPermissions] = useState<
    Map<number, Set<PermissionCode>>
  >(new Map());

  const clearDraft = useCallback(() => {
    setDraftPermissions(new Map());
  }, []);

  const updateDraft = useCallback(
    (userId: number, permissions: Set<PermissionCode>) => {
      setDraftPermissions((prev) => {
        const next = new Map(prev);
        if (permissions.size === 0) {
          next.delete(userId);
        } else {
          next.set(userId, permissions);
        }
        return next;
      });
    },
    []
  );

  const togglePermission = useCallback(
    (userId: number, permission: PermissionCode) => {
      setDraftPermissions((prev) => {
        const next = new Map(prev);
        const current = next.get(userId) ?? new Set<PermissionCode>();
        const updated = new Set(current);

        if (updated.has(permission)) {
          updated.delete(permission);
        } else {
          updated.add(permission);
        }

        if (updated.size === 0) {
          next.delete(userId);
        } else {
          next.set(userId, updated);
        }

        return next;
      });
    },
    []
  );

  const bulkApply = useCallback(
    (
      userIds: number[],
      permissions: PermissionCode[],
      replaceExisting: boolean
    ) => {
      setDraftPermissions((prev) => {
        const next = new Map(prev);
        const permissionsSet = new Set(permissions);

        userIds.forEach((userId) => {
          if (replaceExisting) {
            next.set(userId, permissionsSet);
          } else {
            const current = next.get(userId) ?? new Set<PermissionCode>();
            const updated = new Set(current);
            permissions.forEach((perm) => updated.add(perm));
            next.set(userId, updated);
          }
        });

        return next;
      });
    },
    []
  );

  return {
    draftPermissions,
    setDraftPermissions,
    clearDraft,
    updateDraft,
    togglePermission,
    bulkApply,
  };
}
