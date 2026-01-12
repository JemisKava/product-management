"use client";

import { useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import type { UserRole } from "@/components/users/users-table";

interface UseUsersDataProps {
  page: number;
  pageSize: number;
  searchParam: string;
  nameParam: string;
  emailParam: string;
  statusFilterValue: "all" | "active" | "inactive";
  isActiveFilter: boolean | undefined;
  roles: UserRole[];
  permissionCodes: string[];
  isAuthenticated: boolean;
  userRole: string | null | undefined;
  setPage: (value: number) => void;
}

export function useUsersData({
  page,
  pageSize,
  searchParam,
  nameParam,
  emailParam,
  statusFilterValue,
  isActiveFilter,
  roles,
  permissionCodes,
  isAuthenticated,
  userRole,
  setPage,
}: UseUsersDataProps) {
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = trpc.user.list.useQuery(
    {
      page,
      limit: pageSize,
      search: searchParam.trim() ? searchParam : undefined,
      name: nameParam.trim() ? nameParam : undefined,
      email: emailParam.trim() ? emailParam : undefined,
      isActive:
        statusFilterValue === "all"
          ? isActiveFilter
          : statusFilterValue === "active",
      roles: roles.length > 0 ? roles : undefined,
      permissionCodes: permissionCodes.length > 0 ? permissionCodes : undefined,
    },
    {
      enabled: isAuthenticated && userRole === "ADMIN",
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (!usersData) return;
    const maxPage = Math.max(usersData.meta.totalPages, 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, setPage, usersData]);

  return {
    usersData,
    usersLoading,
    usersError,
    refetchUsers,
  };
}
