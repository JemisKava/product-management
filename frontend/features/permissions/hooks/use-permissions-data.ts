"use client";

import { useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import type { EmployeeRow } from "@/components/permissions/permissions-table";
import type { PermissionCode } from "@/lib/permissions";

interface UsePermissionsDataProps {
  page: number;
  pageSize: number;
  searchParam: string;
  nameParam: string;
  emailParam: string;
  isActiveFilter: boolean | undefined;
  permissionsFilterCodes: PermissionCode[];
  permissionCodes: PermissionCode[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  setPage: (value: number) => void;
}

export function usePermissionsData({
  page,
  pageSize,
  searchParam,
  nameParam,
  emailParam,
  isActiveFilter,
  permissionsFilterCodes,
  permissionCodes,
  isAuthenticated,
  isAdmin,
  setPage,
}: UsePermissionsDataProps) {
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = trpc.user.list.useQuery(
    {
      page,
      limit: pageSize,
      search: searchParam.trim() ? searchParam : undefined,
      name: nameParam.trim() ? nameParam : undefined,
      email: emailParam.trim() ? emailParam : undefined,
      isActive: isActiveFilter,
      roles: ["EMPLOYEE"],
      permissionCodes:
        permissionsFilterCodes.length > 0
          ? permissionsFilterCodes
          : permissionCodes.length > 0
            ? permissionCodes
            : undefined,
    },
    {
      enabled: isAuthenticated && isAdmin,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Transform users data to EmployeeRow format
  const employees: EmployeeRow[] = useMemo(
    () =>
      usersData?.users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
      })) || [],
    [usersData]
  );

  // Validate page number
  useEffect(() => {
    if (!usersData) return;
    const maxPage = Math.max(usersData.meta.totalPages, 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, setPage, usersData]);

  return {
    employees,
    usersData,
    usersLoading,
    usersError,
  };
}
