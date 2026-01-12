"use client";

import { useMemo, useState } from "react";
import type { EmployeeRow } from "../permissions-utils";

export function usePermissionsSelection(data: EmployeeRow[]) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const selectedUserIds = useMemo(() => {
    return Object.entries(rowSelection)
      .filter(([, selected]) => selected)
      .map(([id]) => Number(id))
      .filter((id) => Number.isFinite(id));
  }, [rowSelection]);

  const selectedCount = selectedUserIds.length;

  const selectedUsers = useMemo(() => {
    if (selectedUserIds.length === 0) return [];
    const selectedSet = new Set(selectedUserIds);
    return data.filter(
      (user) => user.role === "EMPLOYEE" && selectedSet.has(user.id)
    );
  }, [data, selectedUserIds]);

  return {
    rowSelection,
    setRowSelection,
    selectedUserIds,
    selectedCount,
    selectedUsers,
  };
}
