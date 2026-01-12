"use client";

import { useMemo, useState } from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { CommandBar } from "@/components/ui/command-bar";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { BulkAssignModal } from "./bulk-assign-modal";
import { MemoizedPermissionsFilters } from "./permissions-filters";
import { usePermissionsState } from "./hooks/use-permissions-state";
import { usePermissionsSelection } from "./hooks/use-permissions-selection";
import { usePermissionsPreview } from "./hooks/use-permissions-preview";
import { usePermissionsSave } from "./hooks/use-permissions-save";
import { usePermissionsActions } from "./hooks/use-permissions-actions";
import { usePermissionsTableColumns } from "./permissions-table-columns";
import { PermissionsSelectionBanner } from "./permissions-selection-banner";
import { PermissionsUnsavedBanner } from "./permissions-unsaved-banner";
import { PermissionsPreviewDialog } from "./permissions-preview-dialog";
import { PermissionsTableEmpty } from "./permissions-table-empty";
import { PermissionsTableError } from "./permissions-table-error";
import type { EmployeeRow } from "./permissions-utils";
import type { PermissionCode } from "@/lib/permissions";

// Re-export for backward compatibility
export type { EmployeeRow } from "./permissions-utils";

type EmployeeStatus = "active" | "inactive";

type PermissionsTableFilters = {
  search: string;
  statuses: EmployeeStatus[];
  permissionCodes: PermissionCode[];
};

type PermissionsTableProps = {
  data: EmployeeRow[];
  filters: PermissionsTableFilters;
  nameSearch: string;
  emailSearch: string;
  permissionCodesFilter: PermissionCode[];
  isLoading: boolean;
  error?: string | null;
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  onNameSearchChange: (value: string) => void;
  onEmailSearchChange: (value: string) => void;
  onPermissionCodesFilterChange: (value: PermissionCode[]) => void;
  onClearTableFilters: () => void;
  onSearchChange: (value: string) => void;
  onStatusToggle: (status: EmployeeStatus) => void;
  onPermissionFilterToggle: (permission: PermissionCode) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onPermissionToggle?: () => void;
};

export function PermissionsTable({
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
  onNameSearchChange,
  onEmailSearchChange,
  onPermissionCodesFilterChange,
  onClearTableFilters,
  onPageChange,
  onPageSizeChange,
  onPermissionToggle,
}: PermissionsTableProps) {
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [draftPermissions, setDraftPermissions] = useState<
    Map<number, Set<PermissionCode>>
  >(new Map());

  // Permission state management
  const { basePermissionsByUser, userMetaById } = usePermissionsState(data);

  // Row selection
  const {
    rowSelection,
    setRowSelection,
    selectedUserIds,
    selectedCount,
    selectedUsers,
  } = usePermissionsSelection(data);

  // Preview logic
  const {
    previewOpen,
    setPreviewOpen,
    hasChanges,
    changeSummary,
    previewItems,
    previewTitle,
    previewDescription,
  } = usePermissionsPreview({
    draftPermissions,
    basePermissionsByUser,
    userMetaById,
  });

  // Save/discard logic
  const { isSaving, saveError, saveChanges, discardChanges } =
    usePermissionsSave(() => {
      setDraftPermissions(new Map());
      setRowSelection({});
      setPreviewOpen(false);
      onPermissionToggle?.();
    });

  // Permission actions (toggle, bulk apply)
  const { handleTogglePermission, handleBulkApply } = usePermissionsActions({
    basePermissionsByUser,
    userMetaById,
    setDraftPermissions,
  });

  // Table columns
  const columns = usePermissionsTableColumns({
    basePermissionsByUser,
    draftPermissions,
    isSaving,
    onTogglePermission: handleTogglePermission,
  });

  // Table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.max(totalPages, 1),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id.toString(),
    state: {
      rowSelection,
      pagination: {
        pageIndex: Math.max(page - 1, 0),
        pageSize,
      },
    },
  });

  // Selected users preview
  const selectedPreview = useMemo(() => {
    return selectedUserIds.slice(0, 4).map((id) => {
      const meta = userMetaById.get(id);
      return {
        id,
        name: meta?.name ?? `Employee #${id}`,
        email: meta?.email ?? "Unknown email",
      };
    });
  }, [selectedUserIds, userMetaById]);

  const extraSelectedCount = Math.max(
    selectedCount - selectedPreview.length,
    0
  );

  const hasFilters =
    filters.search.trim().length > 0 ||
    filters.statuses.length > 0 ||
    filters.permissionCodes.length > 0;

  const handleDiscardChanges = () => {
    setDraftPermissions(new Map());
    discardChanges();
    setPreviewOpen(false);
  };

  const handleSaveChanges = async () => {
    await saveChanges(draftPermissions);
  };

  const handleBulkApplyPermissions = (
    permissions: PermissionCode[],
    replaceExisting: boolean
  ) => {
    handleBulkApply(selectedUserIds, permissions, replaceExisting);
  };

  return (
    <div className="space-y-3">
      <PermissionsSelectionBanner
        selectedCount={selectedCount}
        selectedPreview={selectedPreview}
        extraSelectedCount={extraSelectedCount}
        table={table}
        onBulkModalOpen={() => setBulkModalOpen(true)}
        isSaving={isSaving}
      />

      {hasChanges && (
        <PermissionsUnsavedBanner
          changeSummary={changeSummary}
          saveError={saveError}
          isSaving={isSaving}
          onDiscard={handleDiscardChanges}
          onPreview={() => setPreviewOpen(true)}
          onSave={() => setPreviewOpen(true)}
        />
      )}

      {error ? (
        <PermissionsTableError error={error} />
      ) : (
        <DataTable
          table={table}
          isLoading={isLoading}
          skeletonRows={pageSize}
          stickyColumns={2}
          renderPrependRows={({ getStickyCellProps }) => (
            <MemoizedPermissionsFilters
              nameSearch={nameSearch}
              emailSearch={emailSearch}
              permissionCodes={permissionCodesFilter}
              onNameSearchChange={onNameSearchChange}
              onEmailSearchChange={onEmailSearchChange}
              onPermissionCodesChange={onPermissionCodesFilterChange}
              onClear={onClearTableFilters}
              isLoading={isLoading}
              getStickyCellProps={getStickyCellProps}
            />
          )}
          emptyState={<PermissionsTableEmpty hasFilters={hasFilters} />}
        />
      )}

      {!error && (
        <DataTablePagination
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}

      <BulkAssignModal
        open={bulkModalOpen}
        onOpenChange={setBulkModalOpen}
        userIds={selectedUserIds}
        userCount={selectedCount}
        selectedUsers={selectedUsers}
        onApply={handleBulkApplyPermissions}
      />

      <PermissionsPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        previewItems={previewItems}
        previewTitle={previewTitle}
        previewDescription={previewDescription}
        isSaving={isSaving}
        hasChanges={hasChanges}
        onSave={handleSaveChanges}
      />

      <CommandBar open={hasChanges && !isSaving && !previewOpen}>
        <CommandBar.Bar>
          <CommandBar.Value>
            {changeSummary.changedUsers} employee
            {changeSummary.changedUsers !== 1 ? "s" : ""} •{" "}
            {changeSummary.changedCells} change
            {changeSummary.changedCells !== 1 ? "s" : ""}
          </CommandBar.Value>
          <CommandBar.Seperator />
          <CommandBar.Command
            action={() => setPreviewOpen(true)}
            label="Save"
            shortcut="s"
            disabled={isSaving}
          />
          <CommandBar.Seperator />
          <CommandBar.Command
            action={() => setPreviewOpen(true)}
            label="Preview"
            shortcut="p"
            disabled={isSaving}
          />
          <CommandBar.Seperator />
          <CommandBar.Command
            action={handleDiscardChanges}
            label="Discard"
            shortcut="d"
            disabled={isSaving}
          />
        </CommandBar.Bar>
      </CommandBar>
    </div>
  );
}
