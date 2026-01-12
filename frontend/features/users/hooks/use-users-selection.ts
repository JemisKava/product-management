"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";

export type UserRow = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  isActive: boolean;
  permissions: string[];
};

export function useUsersSelection(users: UserRow[]) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Cache user metadata for selected items
  const userMetaByIdRef = useRef<
    Map<number, { name: string; email: string; role: "ADMIN" | "EMPLOYEE"; isActive: boolean }>
  >(new Map());

  // Update user metadata cache when data changes
  useEffect(() => {
    users.forEach((user) => {
      userMetaByIdRef.current.set(user.id, {
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    });
  }, [users]);

  const selectedIds = useMemo(() => {
    return Object.entries(rowSelection)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => Number(id))
      .filter((id) => !isNaN(id));
  }, [rowSelection]);

  const selectedUsersPreview = useMemo(() => {
    return selectedIds.slice(0, 4).map((id) => {
      const meta = userMetaByIdRef.current.get(id);
      return {
        id,
        name: meta?.name ?? `Employee #${id}`,
        email: meta?.email ?? "—",
      };
    });
  }, [selectedIds]);

  const previewUsers = useMemo(() => {
    return selectedIds
      .map((id) => {
        const meta = userMetaByIdRef.current.get(id);
        return {
          id,
          name: meta?.name ?? `Employee #${id}`,
          email: meta?.email ?? "—",
          role: meta?.role ?? "EMPLOYEE",
          isActive: meta?.isActive ?? true,
        };
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [selectedIds]);

  const extraSelectedCount = Math.max(
    selectedIds.length - selectedUsersPreview.length,
    0
  );

  return {
    rowSelection,
    setRowSelection,
    selectedIds,
    selectedUsersPreview,
    previewUsers,
    extraSelectedCount,
  };
}
