"use client";

import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusPreservation } from "@/hooks/use-focus-preservation";
import type { DataTableStickyContext } from "@/components/data-table/data-table";
import { PERMISSION_LABELS, PermissionCode } from "@/lib/permissions";

export type UserStatus = "active" | "inactive" | "all";

type UsersFiltersProps = {
  nameSearch: string;
  emailSearch: string;
  status: UserStatus;
  permissionCodes: string[];
  availablePermissions: string[];
  onNameSearchChange: (value: string) => void;
  onEmailSearchChange: (value: string) => void;
  onStatusChange: (value: UserStatus) => void;
  onPermissionCodesChange: (value: string[]) => void;
  onClear: () => void;
  isLoading?: boolean;
  getStickyCellProps?: DataTableStickyContext["getStickyCellProps"];
};

export function UsersFilters({
  nameSearch,
  emailSearch,
  status,
  permissionCodes,
  availablePermissions,
  onNameSearchChange,
  onEmailSearchChange,
  onStatusChange,
  onPermissionCodesChange,
  onClear,
  isLoading,
  getStickyCellProps,
}: UsersFiltersProps) {
  const { createInputRef } = useFocusPreservation();

  const hasFilters =
    nameSearch.trim().length > 0 ||
    emailSearch.trim().length > 0 ||
    status !== "all" ||
    permissionCodes.length > 0;

  const permissionsLabel = useMemo(() => {
    if (permissionCodes.length === 0) return "All permissions";
    if (permissionCodes.length === 1) {
      return (
        PERMISSION_LABELS[
          permissionCodes[0] as keyof typeof PERMISSION_LABELS
        ] || permissionCodes[0]
      );
    }
    return `${permissionCodes.length} permissions`;
  }, [permissionCodes]);

  const handlePermissionToggle = (permissionCode: string) => {
    const next = permissionCodes.includes(permissionCode)
      ? permissionCodes.filter((item) => item !== permissionCode)
      : [...permissionCodes, permissionCode];
    onPermissionCodesChange(next);
  };

  const renderClearButton = (className?: string) => (
    <Button
      variant="secondary"
      size="sm"
      className={cn(
        "h-8 text-xs border border-rose-300 bg-rose-50/70 text-rose-700 hover:bg-rose-100/80 hover:text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60",
        className
      )}
      onClick={onClear}
      disabled={!hasFilters || isLoading}
    >
      <X className="size-3 mr-1" />
      Clear
    </Button>
  );

  const getCellProps = (index: number, className?: string) => {
    if (!getStickyCellProps) {
      return { className };
    }
    return getStickyCellProps(index, { className, variant: "filter" });
  };

  return (
    <TableRow className="group">
      <TableCell {...getCellProps(0, "w-12")} />
      <TableCell {...getCellProps(1, "min-w-[180px]")}>
        <Input
          placeholder="Search name..."
          value={nameSearch}
          onChange={(event) => onNameSearchChange(event.target.value)}
          className="h-8 text-xs"
          ref={createInputRef("nameSearch")}
        />
      </TableCell>
      <TableCell {...getCellProps(2, "min-w-[200px]")}>
        <Input
          placeholder="Search email..."
          value={emailSearch}
          onChange={(event) => onEmailSearchChange(event.target.value)}
          className="h-8 text-xs"
          ref={createInputRef("emailSearch")}
        />
      </TableCell>
      <TableCell {...getCellProps(3)}>
        <Input placeholder="Role" disabled className="h-8 text-xs" />
      </TableCell>
      <TableCell {...getCellProps(4)}>
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as UserStatus)}
          disabled={isLoading}
        >
          <SelectTrigger className="h-8 text-xs w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell {...getCellProps(5)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full justify-between text-xs"
              disabled={isLoading}
            >
              <span className="truncate">{permissionsLabel}</span>
              <ChevronDown className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[220px]">
            <DropdownMenuLabel>Permissions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availablePermissions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                No permissions found.
              </div>
            ) : (
              availablePermissions.map((permission) => (
                <DropdownMenuCheckboxItem
                  key={permission}
                  checked={permissionCodes.includes(permission)}
                  onCheckedChange={() => handlePermissionToggle(permission)}
                >
                  {PERMISSION_LABELS[permission as PermissionCode] ||
                    permission}
                </DropdownMenuCheckboxItem>
              ))
            )}
            {permissionCodes.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="px-3 py-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {permissionCodes.length} selected
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onPermissionCodesChange([])}
                >
                  <X className="size-3.5 mr-2" />
                  Clear selection
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      <TableCell {...getCellProps(6)}>{renderClearButton()}</TableCell>
    </TableRow>
  );
}

export const MemoizedUsersFilters = memo(
  UsersFilters,
  (prevProps, nextProps) => {
    return (
      prevProps.nameSearch === nextProps.nameSearch &&
      prevProps.emailSearch === nextProps.emailSearch &&
      prevProps.status === nextProps.status &&
      prevProps.permissionCodes.join(",") ===
        nextProps.permissionCodes.join(",") &&
      prevProps.isLoading === nextProps.isLoading
    );
  }
);

MemoizedUsersFilters.displayName = "MemoizedUsersFilters";
