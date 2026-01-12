"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { PermissionsSkeleton } from "@/components/dashboard/permissions-skeleton";
import { usePermissionsQueryState } from "../hooks/use-permissions-query-state";
import { usePermissionsFilters } from "../hooks/use-permissions-filters";
import { usePermissionsAuth } from "../hooks/use-permissions-auth";
import { usePermissionsData } from "../hooks/use-permissions-data";
import { PermissionsContent } from "./permissions-content";

export function PermissionsClient() {
  // Query state management
  const queryState = usePermissionsQueryState();

  // Filter state and handlers
  const filters = usePermissionsFilters({
    searchParam: queryState.searchParam,
    statusParam: queryState.statusParam,
    permissionsParam: queryState.permissionsParam,
    nameParam: queryState.nameParam,
    emailParam: queryState.emailParam,
    permissionsFilterParam: queryState.permissionsFilterParam,
    setSearchParam: queryState.setSearchParam,
    setNameParam: queryState.setNameParam,
    setEmailParam: queryState.setEmailParam,
    setStatusParam: queryState.setStatusParam,
    setPermissionsParam: queryState.setPermissionsParam,
    setPermissionsFilterParam: queryState.setPermissionsFilterParam,
    setPage: queryState.setPage,
  });

  // Authentication and authorization
  const auth = usePermissionsAuth();

  // Data fetching
  const data = usePermissionsData({
    page: queryState.page,
    pageSize: queryState.pageSize,
    searchParam: queryState.searchParam,
    nameParam: queryState.nameParam,
    emailParam: queryState.emailParam,
    isActiveFilter: filters.isActiveFilter,
    permissionsFilterCodes: filters.permissionsFilterCodes,
    permissionCodes: filters.permissionCodes,
    isAuthenticated: auth.isAuthenticated,
    isAdmin: auth.isAdmin,
    setPage: queryState.setPage,
  });

  // Loading state
  if (auth.isLoading) {
    return <AuthLoadingScreen variant="dashboard" />;
  }

  // Guard clauses
  if (!auth.isAuthenticated || !auth.user) {
    return null;
  }

  if (!auth.isAdmin) {
    return null;
  }

  // Show skeleton on initial load when data is not yet available
  const isInitialLoad = data.usersLoading && !data.usersData;

  return (
    <DashboardShell title="Permissions">
      {isInitialLoad ? (
        <PermissionsSkeleton />
      ) : (
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 w-full">
        <PermissionsContent
          data={data.employees}
          filters={{
            search: filters.searchInput,
            statuses: filters.statuses,
            permissionCodes: filters.permissionCodes,
          }}
          nameSearch={filters.nameInput}
          emailSearch={filters.emailInput}
          permissionCodesFilter={filters.permissionsFilterCodes}
          isLoading={data.usersLoading}
          error={data.usersError?.message}
          page={queryState.page}
          pageSize={queryState.pageSize}
          totalPages={data.usersData?.meta.totalPages ?? 1}
          totalItems={data.usersData?.meta.total ?? 0}
          onNameSearchChange={filters.handleNameSearchChange}
          onEmailSearchChange={filters.handleEmailSearchChange}
          onPermissionCodesFilterChange={filters.handlePermissionsFilterChange}
          onClearTableFilters={filters.handleClearTableFilters}
          onSearchChange={filters.setSearchInput}
          onStatusToggle={filters.handleStatusToggle}
          onPermissionFilterToggle={filters.handlePermissionToggle}
          onClearFilters={filters.handleClearFilters}
          onPageChange={queryState.setPage}
          onPageSizeChange={(nextSize) => {
            queryState.setPageSize(nextSize);
            queryState.setPage(1);
          }}
        />
      </main>
      )}
    </DashboardShell>
  );
}
