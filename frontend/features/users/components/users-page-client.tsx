"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { UserModal } from "@/features/users/components/user-modal";
import { UserViewModal } from "@/features/users/components/user-view-modal";
import { UsersHeader } from "./users-header";
import { UsersContent } from "./users-content";
import { UsersDeleteDialog } from "./users-delete-dialog";
import { useUsersQueryState } from "../hooks/use-users-query-state";
import { useUsersFilters } from "../hooks/use-users-filters";
import { useUsersAuth } from "../hooks/use-users-auth";
import { useUsersData } from "../hooks/use-users-data";
import { useUsersMutations } from "../hooks/use-users-mutations";
import { useUsersModal } from "../hooks/use-users-modal";
import type { UserRole, UserStatus } from "@/components/users/users-table";

export function UsersPageClient() {
  const queryState = useUsersQueryState();
  const filters = useUsersFilters({
    searchParam: queryState.searchParam,
    rolesParam: queryState.rolesParam,
    statusParam: queryState.statusParam,
    nameParam: queryState.nameParam,
    emailParam: queryState.emailParam,
    statusFilterParam: queryState.statusFilterParam,
    permissionCodesParam: queryState.permissionCodesParam,
    setSearchParam: queryState.setSearchParam,
    setNameParam: queryState.setNameParam,
    setEmailParam: queryState.setEmailParam,
    setStatusFilterParam: queryState.setStatusFilterParam,
    setPermissionCodesParam: queryState.setPermissionCodesParam,
    setPage: queryState.setPage,
  });

  const auth = useUsersAuth();

  const data = useUsersData({
    page: queryState.page,
    pageSize: queryState.pageSize,
    searchParam: queryState.searchParam,
    nameParam: queryState.nameParam,
    emailParam: queryState.emailParam,
    statusFilterValue: filters.statusFilterValue,
    isActiveFilter: filters.isActiveFilter,
    roles: filters.roles,
    permissionCodes: filters.permissionCodes,
    isAuthenticated: auth.isAuthenticated ?? false,
    userRole: auth.userRole,
    setPage: queryState.setPage,
  });

  const mutations = useUsersMutations({
    refetchUsers: data.refetchUsers,
  });

  const modal = useUsersModal();

  // Handle role toggle
  const handleRoleToggle = (role: UserRole) => {
    const nextRoles = filters.handleRoleToggle(role);
    queryState.setRolesParam(nextRoles.length > 0 ? nextRoles.join(",") : null);
    queryState.setPage(1);
  };

  // Handle status toggle
  const handleStatusToggle = (status: UserStatus) => {
    const nextStatuses = filters.handleStatusToggle(status);
    queryState.setStatusParam(
      nextStatuses.length > 0 ? nextStatuses.join(",") : null
    );
    queryState.setPage(1);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    filters.handleClearFilters();
    queryState.setRolesParam(null);
    queryState.setStatusParam(null);
  };

  // Handle create click
  const handleCreateClick = () => {
    queryState.setViewUserId(null);
    modal.openCreateModal();
  };

  // Handle edit
  const handleEdit = (userId: number) => {
    queryState.setViewUserId(null);
    modal.openEditModal(userId);
  };

  // Handle view
  const handleView = (userId: number) => {
    modal.closeModal();
    queryState.setViewUserId(userId);
  };

  // Handle delete
  const handleDelete = (userId: number, userName: string) => {
    modal.openDeleteDialog(userId, userName);
  };

  // Handle delete confirm
  const handleDeleteConfirm = () => {
    if (!modal.deleteTarget) return;
    mutations.deleteMutation.mutate(
      { id: modal.deleteTarget.id },
      {
        onSuccess: () => {
          modal.closeDeleteDialog();
        },
      }
    );
  };

  // Handle view modal change
  const handleViewModalChange = (open: boolean) => {
    if (!open) {
      queryState.setViewUserId(null);
    }
  };

  // Loading state
  if (auth.isLoading) {
    return <AuthLoadingScreen variant="dashboard" />;
  }

  // Guard clauses
  if (!auth.isAuthenticated || !auth.user) {
    return null;
  }

  if (!auth.canView) {
    return (
      <DashboardShell title="Users">
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 w-full">
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
            You do not have permission to view users.
          </div>
        </main>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Users">
      <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 w-full">
        <div className="flex flex-col gap-4 sm:gap-6">
          <UsersHeader canCreate={true} onCreateClick={handleCreateClick} />

          <UsersContent
            users={data.usersData?.users ?? []}
            searchInput={filters.searchInput}
            roles={filters.roles}
            statuses={filters.statuses}
            nameInput={filters.nameInput}
            emailInput={filters.emailInput}
            statusFilterValue={filters.statusFilterValue}
            permissionCodes={filters.permissionCodes}
            isLoading={data.usersLoading}
            error={data.usersError?.message}
            page={queryState.page}
            pageSize={queryState.pageSize}
            totalPages={data.usersData?.meta.totalPages ?? 1}
            totalItems={data.usersData?.meta.total ?? 0}
            searchInputRef={filters.searchInputRef}
            onNameSearchChange={filters.handleNameSearchChange}
            onEmailSearchChange={filters.handleEmailSearchChange}
            onStatusFilterChange={filters.handleStatusFilterChange}
            onPermissionCodesChange={filters.handlePermissionCodesChange}
            onClearTableFilters={filters.handleClearTableFilters}
            onSearchChange={filters.setSearchInput}
            onRoleToggle={handleRoleToggle}
            onStatusToggle={handleStatusToggle}
            onClearFilters={handleClearFilters}
            onPageChange={queryState.setPage}
            onPageSizeChange={(nextSize) => {
              queryState.setPageSize(nextSize);
              queryState.setPage(1);
            }}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            onBulkDelete={mutations.handleBulkDelete}
            isBulkDeleting={mutations.isBulkDeleting}
            onBulkStatusUpdate={mutations.handleBulkStatusUpdate}
            isBulkUpdating={mutations.isBulkUpdating}
          />
        </div>
      </main>
      <UserModal
        open={modal.modalOpen}
        mode={modal.modalMode}
        userId={modal.editUserId}
        onOpenChange={modal.closeModal}
        onSuccess={data.refetchUsers}
      />
      <UserViewModal
        open={typeof queryState.viewUserId === "number"}
        userId={queryState.viewUserId ?? null}
        onOpenChange={handleViewModalChange}
      />
      <UsersDeleteDialog
        open={!!modal.deleteTarget}
        userName={modal.deleteTarget?.name ?? null}
        isDeleting={mutations.deleteMutation.isPending}
        onOpenChange={(open) => !open && modal.closeDeleteDialog()}
        onConfirm={handleDeleteConfirm}
      />
    </DashboardShell>
  );
}
