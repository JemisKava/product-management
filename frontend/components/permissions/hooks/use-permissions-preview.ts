"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getPreviewResources,
  type EmployeeMeta,
} from "../permissions-utils";
import { ALL_PERMISSION_CODES, type PermissionCode } from "@/lib/permissions";

interface UsePermissionsPreviewProps {
  draftPermissions: Map<number, Set<PermissionCode>>;
  basePermissionsByUser: Map<number, Set<PermissionCode>>;
  userMetaById: Map<number, EmployeeMeta>;
}

export function usePermissionsPreview({
  draftPermissions,
  basePermissionsByUser,
  userMetaById,
}: UsePermissionsPreviewProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const hasChanges = draftPermissions.size > 0;

  const changeSummary = useMemo(() => {
    let changedUsers = 0;
    let changedCells = 0;
    for (const [userId, draftSet] of draftPermissions) {
      const baseSet =
        basePermissionsByUser.get(userId) ?? new Set<PermissionCode>();
      let diff = 0;
      for (const permission of ALL_PERMISSION_CODES) {
        if (baseSet.has(permission) !== draftSet.has(permission)) {
          diff += 1;
        }
      }
      if (diff > 0) {
        changedUsers += 1;
        changedCells += diff;
      }
    }
    return { changedUsers, changedCells };
  }, [draftPermissions, basePermissionsByUser]);

  const previewItems = useMemo(() => {
    return Array.from(draftPermissions.entries())
      .map(([userId, draftSet]) => {
        const baseSet =
          basePermissionsByUser.get(userId) ?? new Set<PermissionCode>();
        const added: PermissionCode[] = [];
        const removed: PermissionCode[] = [];

        ALL_PERMISSION_CODES.forEach((permission) => {
          const wasEnabled = baseSet.has(permission);
          const isEnabled = draftSet.has(permission);
          if (wasEnabled === isEnabled) return;
          if (isEnabled) {
            added.push(permission);
          } else {
            removed.push(permission);
          }
        });

        const meta = userMetaById.get(userId);

        return {
          userId,
          name: meta?.name ?? `Employee #${userId}`,
          email: meta?.email ?? "Unknown email",
          added,
          removed,
        };
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [draftPermissions, basePermissionsByUser, userMetaById]);

  const previewResources = useMemo(
    () => getPreviewResources(previewItems),
    [previewItems]
  );

  const previewTitle =
    previewResources.length === 1
      ? `Review ${previewResources[0]} permissions`
      : "Review permission changes";

  const previewDescription =
    previewResources.length === 1
      ? "Review changes before saving."
      : "Review all edits before saving. Changes are grouped by employee.";

  useEffect(() => {
    if (!hasChanges && previewOpen) {
      setPreviewOpen(false);
    }
  }, [hasChanges, previewOpen]);

  return {
    previewOpen,
    setPreviewOpen,
    hasChanges,
    changeSummary,
    previewItems,
    previewTitle,
    previewDescription,
  };
}
