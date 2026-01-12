"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  type RowSelectionState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { ALL_PERMISSION_CODES } from "@/lib/permissions";
import { MemoizedUsersFilters } from "./users-filters";

export type UserRole = "ADMIN" | "EMPLOYEE";
export type UserStatus = "active" | "inactive";

export type UserRow = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  permissions: string[];
};

type UsersTableFilters = {
  search: string;
  roles: UserRole[];
  statuses: UserStatus[];
};

type UsersTableProps = {
  data: UserRow[];
  filters: UsersTableFilters;
  nameSearch: string;
  emailSearch: string;
  statusFilter: "all" | "active" | "inactive";
  permissionCodes: string[];
  isLoading: boolean;
  error?: string | null;
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  onNameSearchChange: (value: string) => void;
  onEmailSearchChange: (value: string) => void;
  onStatusFilterChange: (value: "all" | "active" | "inactive") => void;
  onPermissionCodesChange: (value: string[]) => void;
  onClearTableFilters: () => void;
  onSearchChange: (value: string) => void;
  onRoleToggle: (role: UserRole) => void;
  onStatusToggle: (status: UserStatus) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onEdit: (userId: number) => void;
  onView: (userId: number) => void;
  onDelete: (userId: number, userName: string) => void;
  onBulkDelete?: (userIds: number[]) => Promise<void> | void;
  onBulkStatusUpdate?: (
    userIds: number[],
    isActive: boolean
  ) => Promise<void> | void;
  isBulkDeleting?: boolean;
  isBulkUpdating?: boolean;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  rowSelection?: RowSelectionState;
  setRowSelection?: (selection: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void;
  selectedIds?: number[];
  selectedUsersPreview?: Array<{ id: number; name: string; email: string }>;
  previewUsers?: Array<{ id: number; name: string; email: string; role: UserRole; isActive: boolean }>;
  extraSelectedCount?: number;
  onClearSelection?: () => void;
};

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  EMPLOYEE: "Employee",
};


const PERMISSION_LABELS: Record<string, string> = {
  PRODUCT_VIEW: "View",
  PRODUCT_CREATE: "Create",
  PRODUCT_EDIT: "Edit",
  PRODUCT_DELETE: "Delete",
  PRODUCT_BULK: "Bulk",
};

const PERMISSION_STYLES: Record<string, string> = {
  PRODUCT_VIEW:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30",
  PRODUCT_CREATE:
    "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20 dark:border-sky-500/30",
  PRODUCT_EDIT:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30",
  PRODUCT_DELETE:
    "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30",
  PRODUCT_BULK:
    "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20 dark:border-violet-500/30",
};

function renderPermissionBadges(user: UserRow) {
  const permissions =
    user.role === "ADMIN" ? ALL_PERMISSION_CODES : user.permissions;
  const permissionCount = permissions.length;
  const totalPermissions = ALL_PERMISSION_CODES.length;

  if (user.role === "ADMIN") {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="bg-primary/15 text-primary border-primary/30"
        >
          All Permissions
        </Badge>
      </div>
    );
  }

  if (permissionCount === 0) {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="text-muted-foreground border-border"
        >
          No permissions
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge
        variant="outline"
        className="bg-muted text-muted-foreground border-border text-xs"
      >
        {permissionCount}/{totalPermissions}
      </Badge>
      <div className="flex flex-wrap gap-1.5">
        {permissions.slice(0, 3).map((permission) => (
          <Badge
            key={permission}
            variant="outline"
            className={
              PERMISSION_STYLES[permission] ||
              "bg-muted text-muted-foreground border-border"
            }
          >
            {PERMISSION_LABELS[permission] || permission}
          </Badge>
        ))}
        {permissions.length > 3 && (
          <Badge
            variant="outline"
            className="bg-muted text-muted-foreground border-border"
          >
            +{permissions.length - 3}
          </Badge>
        )}
      </div>
    </div>
  );
}

export function UsersTable({
  data,
  nameSearch,
  emailSearch,
  statusFilter,
  permissionCodes,
  isLoading,
  error,
  page,
  pageSize,
  totalPages,
  totalItems,
  onNameSearchChange,
  onEmailSearchChange,
  onStatusFilterChange,
  onPermissionCodesChange,
  onClearTableFilters,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onView,
  onDelete,
  onBulkDelete,
  onBulkStatusUpdate,
  isBulkDeleting = false,
  isBulkUpdating = false,
  rowSelection: externalRowSelection,
  setRowSelection: externalSetRowSelection,
  selectedIds: externalSelectedIds,
  selectedUsersPreview: externalSelectedUsersPreview,
  previewUsers: externalPreviewUsers,
  extraSelectedCount: externalExtraSelectedCount,
  onClearSelection,
}: UsersTableProps) {
  // Use external selection state if provided, otherwise fall back to local state
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});
  const rowSelection = externalRowSelection ?? internalRowSelection;
  const setRowSelection = externalSetRowSelection ?? setInternalRowSelection;
  const selectedIds = externalSelectedIds ?? Object.entries(rowSelection)
    .filter(([, isSelected]) => isSelected)
    .map(([id]) => Number(id))
    .filter((id) => Number.isFinite(id));
  const selectedUsersPreview = externalSelectedUsersPreview ?? selectedIds.slice(0, 4).map((id) => ({
    id,
    name: `Employee #${id}`,
    email: "—",
  }));
  const previewUsers = externalPreviewUsers ?? selectedIds
    .map((id) => ({
      id,
      name: `Employee #${id}`,
      email: "—",
      role: "EMPLOYEE" as UserRole,
      isActive: true,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
  const extraSelectedCount = externalExtraSelectedCount ?? Math.max(
    selectedIds.length - selectedUsersPreview.length,
    0
  );

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAction, setPreviewAction] = useState<
    { type: "delete" } | { type: "status"; isActive: boolean } | null
  >(null);

  const selectedCount = selectedIds.length;
  const canBulkActions = Boolean(onBulkDelete);

  useEffect(() => {
    if (selectedCount === 0 && previewOpen) {
      setPreviewOpen(false);
    }
  }, [previewOpen, selectedCount]);

  const handleDiscardSelection = () => {
    if (onClearSelection) {
      onClearSelection();
    } else {
      setRowSelection({});
    }
    setPreviewOpen(false);
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedIds.length === 0) return;
    try {
      await onBulkDelete(selectedIds);
      if (onClearSelection) {
        onClearSelection();
      } else {
        setRowSelection({});
      }
      setPreviewOpen(false);
    } catch {
      // errors are handled upstream
    }
  };

  const handleBulkStatusChange = async (isActive: boolean) => {
    if (!onBulkStatusUpdate || selectedIds.length === 0) return;
    try {
      await onBulkStatusUpdate(selectedIds, isActive);
      if (onClearSelection) {
        onClearSelection();
      } else {
        setRowSelection({});
      }
      setPreviewOpen(false);
      setPreviewAction(null);
    } catch {
      // errors are handled upstream
    }
  };

  const openPreview = (
    action?: { type: "delete" } | { type: "status"; isActive: boolean }
  ) => {
    if (selectedIds.length === 0) return;
    setPreviewAction(action ?? null);
    setPreviewOpen(true);
  };

  const columns = useMemo<ColumnDef<UserRow>[]>(
    () => [
      {
        id: "select",
        size: 48,
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select ${row.original.name}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 180,
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 200,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.role === "ADMIN"
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-muted text-muted-foreground border-border"
            }
          >
            {ROLE_LABELS[row.original.role]}
          </Badge>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.isActive
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30"
            }
          >
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        accessorKey: "permissions",
        header: "Permissions",
        cell: ({ row }) => renderPermissionBadges(row.original),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          if (row.original.role === "ADMIN") {
            return (
              <div className="text-center text-xs text-muted-foreground">—</div>
            );
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 sm:size-8 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="size-3.5 sm:size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(row.original.id)}>
                  <Eye className="size-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
                  <Edit className="size-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(row.original.id, row.original.name)}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onEdit, onDelete, onView]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.max(totalPages, 1),
    getRowId: (row) => String(row.id),
    enableRowSelection: (row) => row.original.role !== "ADMIN",
    onRowSelectionChange: setRowSelection,
    state: {
      pagination: {
        pageIndex: Math.max(page - 1, 0),
        pageSize,
      },
      rowSelection,
    },
  });


  return (
    <div className="space-y-3">
      {canBulkActions && selectedCount > 0 && (
        <div className="rounded-xl border bg-card p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {selectedCount} selected
                </Badge>
                <span className="text-sm text-muted-foreground">employees</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedUsersPreview.map((user) => (
                  <Badge
                    key={user.id}
                    variant="outline"
                    className="bg-background/60 text-xs"
                  >
                    {user.name}
                  </Badge>
                ))}
                {extraSelectedCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    +{extraSelectedCount} more
                  </Badge>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDiscardSelection}
                className="border border-rose-300 bg-rose-50/70 text-rose-700 hover:bg-rose-100/80 hover:text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60"
              >
                Clear selection
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isBulkDeleting || isBulkUpdating}
                  >
                    Update Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      openPreview({ type: "status", isActive: true })
                    }
                  >
                    Mark as Active
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      openPreview({ type: "status", isActive: false })
                    }
                  >
                    Mark as Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openPreview()}
                disabled={isBulkDeleting || isBulkUpdating}
              >
                Preview
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => openPreview({ type: "delete" })}
                disabled={
                  isBulkDeleting || isBulkUpdating || selectedCount === 0
                }
              >
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <DataTable
          table={table}
          isLoading={isLoading}
          skeletonRows={pageSize}
          stickyColumns={2}
          renderPrependRows={({ getStickyCellProps }) => (
            <MemoizedUsersFilters
              nameSearch={nameSearch}
              emailSearch={emailSearch}
              status={statusFilter}
              permissionCodes={permissionCodes}
              availablePermissions={ALL_PERMISSION_CODES}
              onNameSearchChange={onNameSearchChange}
              onEmailSearchChange={onEmailSearchChange}
              onStatusChange={onStatusFilterChange}
              onPermissionCodesChange={onPermissionCodesChange}
              onClear={onClearTableFilters}
              isLoading={isLoading}
              getStickyCellProps={getStickyCellProps}
            />
          )}
          emptyState={
            <span className="text-sm text-muted-foreground">
              No users match these filters.
            </span>
          }
        />
      )}

      <Dialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) {
            setPreviewAction(null);
          }
        }}
      >
        <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-4xl p-0 overflow-hidden max-h-screen sm:max-h-[90vh] w-full">
          <div className="flex flex-col h-full max-h-screen sm:max-h-[90vh] overflow-hidden">
            <div className="border-b bg-background px-3 sm:px-6 py-4">
              <DialogHeader>
                <DialogTitle>
                  {previewAction?.type === "delete"
                    ? "Review delete selection"
                    : previewAction?.type === "status"
                      ? "Review status update"
                      : "Preview selected employees"}
                </DialogTitle>
                <DialogDescription>
                  {previewAction?.type === "status"
                    ? `These employees will be marked as ${previewAction.isActive ? "Active" : "Inactive"}.`
                    : previewAction?.type === "delete"
                      ? "These employees will be permanently removed."
                      : "Review the selected employees before applying an action."}
                </DialogDescription>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-[10px]">
                    {selectedCount} selected
                  </Badge>
                  {previewAction?.type === "status" && (
                    <Badge
                      variant="outline"
                      className={
                        previewAction.isActive
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30"
                      }
                    >
                      {previewAction.isActive ? "Active" : "Inactive"}
                    </Badge>
                  )}
                  {previewAction?.type === "delete" && (
                    <Badge
                      variant="outline"
                      className="text-rose-700 border-rose-200 bg-rose-50/70 dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-300"
                    >
                      Delete
                    </Badge>
                  )}
                </div>
              </DialogHeader>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
              <div className="rounded-lg border bg-background/70 overflow-hidden mx-3 md:mx-6">
                <div className="overflow-x-auto w-full">
                  <div className="min-w-[600px] md:min-w-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">
                            Name
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Email
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Role
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium whitespace-nowrap">
                              {user.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">
                              {user.email}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge
                                variant="outline"
                                className={
                                  user.role === "ADMIN"
                                    ? "bg-primary/15 text-primary border-primary/30"
                                    : "bg-muted text-muted-foreground border-border"
                                }
                              >
                                {ROLE_LABELS[user.role]}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge
                                variant="outline"
                                className={
                                  user.isActive
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30"
                                    : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30"
                                }
                              >
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                {previewUsers.length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground">
                    No employees selected.
                  </div>
                )}
              </div>
            </div>
            <div className="border-t bg-background px-3 sm:px-6 py-4">
              <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setPreviewOpen(false)}
                  disabled={isBulkDeleting || isBulkUpdating}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                {previewAction?.type === "status" ? (
                  <Button
                    onClick={() =>
                      handleBulkStatusChange(previewAction.isActive)
                    }
                    disabled={isBulkUpdating || selectedIds.length === 0}
                    className="w-full sm:w-auto"
                  >
                    Update to {previewAction.isActive ? "Active" : "Inactive"}
                  </Button>
                ) : previewAction?.type === "delete" ? (
                  <Button
                    variant="destructive"
                    onClick={handleBulkDelete}
                    disabled={
                      isBulkDeleting ||
                      selectedIds.length === 0 ||
                      !canBulkActions
                    }
                    className="w-full sm:w-auto"
                  >
                    {isBulkDeleting ? "Deleting..." : "Delete selected"}
                  </Button>
                ) : (
                  <>
                    {onBulkStatusUpdate && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={isBulkUpdating}
                            className="w-full sm:w-auto"
                          >
                            Update Status
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleBulkStatusChange(true)}
                          >
                            Mark as Active
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleBulkStatusChange(false)}
                          >
                            Mark as Inactive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    {canBulkActions && (
                      <Button
                        variant="destructive"
                        onClick={handleBulkDelete}
                        disabled={
                          isBulkDeleting ||
                          selectedIds.length === 0 ||
                          !canBulkActions
                        }
                        className="w-full sm:w-auto"
                      >
                        Delete Selected
                      </Button>
                    )}
                  </>
                )}
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
