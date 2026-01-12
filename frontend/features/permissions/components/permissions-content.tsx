"use client";

import {
  PermissionsTable,
  type EmployeeRow,
} from "@/components/permissions/permissions-table";
import type { PermissionCode } from "@/lib/permissions";
import type { RowSelectionState } from "@tanstack/react-table";
import { PermissionsHeader } from "./permissions-header";

type EmployeeStatus = "active" | "inactive";

interface PermissionsContentProps {
  data: EmployeeRow[];
  filters: {
    search: string;
    statuses: EmployeeStatus[];
    permissionCodes: PermissionCode[];
  };
  nameSearch: string;
  emailSearch: string;
  permissionCodesFilter: PermissionCode[];
  isLoading: boolean;
  error: string | undefined;
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  rowSelection: RowSelectionState;
  setRowSelection: (selection: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void;
  selectedUserIds: number[];
  selectedUsers: EmployeeRow[];
  selectedUsersPreview: Array<{ id: number; name: string; email: string }>;
  extraSelectedCount: number;
  onNameSearchChange: (value: string) => void;
  onEmailSearchChange: (value: string) => void;
  onPermissionCodesFilterChange: (codes: PermissionCode[]) => void;
  onClearTableFilters: () => void;
  onSearchChange: (value: string) => void;
  onStatusToggle: (status: EmployeeStatus) => void;
  onPermissionFilterToggle: (permission: PermissionCode) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function PermissionsContent({
  data,
  filters,
  nameSearch,
  emailSearch,
  permissionCodesFilter,
  isLoading,
  error,
  page,
  pageSize,
  totalPages,
  totalItems,
  rowSelection,
  setRowSelection,
  selectedUserIds,
  selectedUsers,
  selectedUsersPreview,
  extraSelectedCount,
  onNameSearchChange,
  onEmailSearchChange,
  onPermissionCodesFilterChange,
  onClearTableFilters,
  onSearchChange,
  onStatusToggle,
  onPermissionFilterToggle,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
}: PermissionsContentProps) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <PermissionsHeader />
      <PermissionsTable
        data={data}
        filters={filters}
        nameSearch={nameSearch}
        emailSearch={emailSearch}
        permissionCodesFilter={permissionCodesFilter}
        isLoading={isLoading}
        error={error}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={totalItems}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        selectedUserIds={selectedUserIds}
        selectedUsers={selectedUsers}
        selectedUsersPreview={selectedUsersPreview}
        extraSelectedCount={extraSelectedCount}
        onNameSearchChange={onNameSearchChange}
        onEmailSearchChange={onEmailSearchChange}
        onPermissionCodesFilterChange={onPermissionCodesFilterChange}
        onClearTableFilters={onClearTableFilters}
        onSearchChange={onSearchChange}
        onStatusToggle={onStatusToggle}
        onPermissionFilterToggle={onPermissionFilterToggle}
        onClearFilters={onClearFilters}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
