"use client";

import type { RowSelectionState } from "@tanstack/react-table";
import { UsersTable, type UserRole, type UserStatus } from "@/components/users/users-table";

interface UsersContentProps {
  users: Array<{
    id: number;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    permissions: string[];
  }>;
  searchInput: string;
  roles: UserRole[];
  statuses: UserStatus[];
  nameInput: string;
  emailInput: string;
  statusFilterValue: "all" | "active" | "inactive";
  permissionCodes: string[];
  isLoading: boolean;
  error: string | undefined;
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  rowSelection: RowSelectionState;
  setRowSelection: (selection: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void;
  selectedIds: number[];
  selectedUsersPreview: Array<{ id: number; name: string; email: string }>;
  previewUsers: Array<{ id: number; name: string; email: string; role: UserRole; isActive: boolean }>;
  extraSelectedCount: number;
  onNameSearchChange: (value: string) => void;
  onEmailSearchChange: (value: string) => void;
  onStatusFilterChange: (value: "all" | "active" | "inactive") => void;
  onPermissionCodesChange: (codes: string[]) => void;
  onClearTableFilters: () => void;
  onSearchChange: (value: string) => void;
  onRoleToggle: (role: UserRole) => void;
  onStatusToggle: (status: UserStatus) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (userId: number) => void;
  onView: (userId: number) => void;
  onDelete: (userId: number, userName: string) => void;
  onBulkDelete: (userIds: number[]) => Promise<void> | void;
  isBulkDeleting: boolean;
  onBulkStatusUpdate: (
    userIds: number[],
    isActive: boolean
  ) => Promise<void> | void;
  isBulkUpdating: boolean;
  onClearSelection: () => void;
}

export function UsersContent({
  users,
  searchInput,
  roles,
  statuses,
  nameInput,
  emailInput,
  statusFilterValue,
  permissionCodes,
  isLoading,
  error,
  page,
  pageSize,
  totalPages,
  totalItems,
  searchInputRef,
  rowSelection,
  setRowSelection,
  selectedIds,
  selectedUsersPreview,
  previewUsers,
  extraSelectedCount,
  onNameSearchChange,
  onEmailSearchChange,
  onStatusFilterChange,
  onPermissionCodesChange,
  onClearTableFilters,
  onSearchChange,
  onRoleToggle,
  onStatusToggle,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onView,
  onDelete,
  onBulkDelete,
  isBulkDeleting,
  onBulkStatusUpdate,
  isBulkUpdating,
  onClearSelection,
}: UsersContentProps) {
  return (
    <UsersTable
      data={users}
      filters={{
        search: searchInput,
        roles,
        statuses,
      }}
      nameSearch={nameInput}
      emailSearch={emailInput}
      statusFilter={statusFilterValue}
      permissionCodes={permissionCodes}
      isLoading={isLoading}
      error={error}
      page={page}
      pageSize={pageSize}
      totalPages={totalPages}
      totalItems={totalItems}
      rowSelection={rowSelection}
      setRowSelection={setRowSelection}
      selectedIds={selectedIds}
      selectedUsersPreview={selectedUsersPreview}
      previewUsers={previewUsers}
      extraSelectedCount={extraSelectedCount}
      onNameSearchChange={onNameSearchChange}
      onEmailSearchChange={onEmailSearchChange}
      onStatusFilterChange={onStatusFilterChange}
      onPermissionCodesChange={onPermissionCodesChange}
      onClearTableFilters={onClearTableFilters}
      onSearchChange={onSearchChange}
      onRoleToggle={onRoleToggle}
      onStatusToggle={onStatusToggle}
      onClearFilters={onClearFilters}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onEdit={onEdit}
      onView={onView}
      onDelete={onDelete}
      onBulkDelete={onBulkDelete}
      isBulkDeleting={isBulkDeleting}
      onBulkStatusUpdate={onBulkStatusUpdate}
      isBulkUpdating={isBulkUpdating}
      onClearSelection={onClearSelection}
      searchInputRef={searchInputRef}
    />
  );
}
