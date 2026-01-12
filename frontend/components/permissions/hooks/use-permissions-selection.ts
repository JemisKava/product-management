"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";
import type { EmployeeRow, EmployeeMeta } from "../permissions-utils";

export function usePermissionsSelection(data: EmployeeRow[]) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Cache user metadata for selected items
  const userMetaByIdRef = useRef<Map<number, EmployeeMeta>>(new Map());

  // Update user metadata cache when data changes
  useEffect(() => {
    data.forEach((user) => {
      if (user.role === "EMPLOYEE") {
        userMetaByIdRef.current.set(user.id, {
          name: user.name,
          email: user.email,
        });
      }
    });
  }, [data]);

  const selectedUserIds = useMemo(() => {
    return Object.entries(rowSelection)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => Number(id))
      .filter((id) => !isNaN(id));
  }, [rowSelection]);

  const selectedCount = selectedUserIds.length;

  const selectedUsers = useMemo(() => {
    return selectedUserIds.map((id) => {
      const meta = userMetaByIdRef.current.get(id);
      return {
        id,
        name: meta?.name ?? `Employee #${id}`,
        email: meta?.email ?? "—",
        role: "EMPLOYEE" as const,
        permissions: [] as string[],
      };
    });
  }, [selectedUserIds]);

  const selectedUsersPreview = useMemo(() => {
    return selectedUserIds.slice(0, 4).map((id) => {
      const meta = userMetaByIdRef.current.get(id);
      return {
        id,
        name: meta?.name ?? `Employee #${id}`,
        email: meta?.email ?? "—",
      };
    });
  }, [selectedUserIds]);

  const extraSelectedCount = Math.max(
    selectedUserIds.length - selectedUsersPreview.length,
    0
  );

  return {
    rowSelection,
    setRowSelection,
    selectedUserIds,
    selectedCount,
    selectedUsers,
    selectedUsersPreview,
    extraSelectedCount,
  };
}
