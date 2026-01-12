"use client";

import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusPreservation } from "@/hooks/use-focus-preservation";
import type { DataTableStickyContext } from "@/components/data-table/data-table";
import {
  ALL_PERMISSION_CODES,
  PERMISSION_LABELS,
  type PermissionCode,
} from "@/lib/permissions";

type PermissionsFiltersProps = {
  nameSearch: string;
  emailSearch: string;
  permissionCodes: PermissionCode[];
  onNameSearchChange: (value: string) => void;
  onEmailSearchChange: (value: string) => void;
  onPermissionCodesChange: (value: PermissionCode[]) => void;
  onClear: () => void;
  isLoading?: boolean;
  getStickyCellProps?: DataTableStickyContext["getStickyCellProps"];
};

export function PermissionsFilters({
  nameSearch,
  emailSearch,
  permissionCodes,
  onNameSearchChange,
  onEmailSearchChange,
  onPermissionCodesChange,
  onClear,
  isLoading,
  getStickyCellProps,
}: PermissionsFiltersProps) {
  const { createInputRef } = useFocusPreservation();

  const hasFilters =
    nameSearch.trim().length > 0 ||
    emailSearch.trim().length > 0 ||
    permissionCodes.length > 0;

  const permissionsLabel = useMemo(() => {
    if (permissionCodes.length === 0) return "All permissions";
    if (permissionCodes.length === 1) {
      return PERMISSION_LABELS[permissionCodes[0]] || permissionCodes[0];
    }
    return `${permissionCodes.length} permissions`;
  }, [permissionCodes]);

  const handlePermissionToggle = (permissionCode: PermissionCode) => {
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
      return { className: cn("bg-muted", className) };
    }
    // Only apply sticky props for columns 0 and 1 (checkbox and name)
    // Column 2 (email) should not be sticky, but should have the same background
    if (index >= 2) {
      return { className: cn("bg-muted", className) };
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
      <TableCell
        colSpan={ALL_PERMISSION_CODES.length}
        {...getCellProps(3, "bg-muted")}
      >
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
            {ALL_PERMISSION_CODES.map((perm) => (
              <DropdownMenuCheckboxItem
                key={perm}
                checked={permissionCodes.includes(perm)}
                onCheckedChange={() => handlePermissionToggle(perm)}
              >
                {PERMISSION_LABELS[perm]}
              </DropdownMenuCheckboxItem>
            ))}
            {permissionCodes.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="px-3 py-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {permissionCodes.length} selected
                  </Badge>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      <TableCell {...getCellProps(3 + ALL_PERMISSION_CODES.length, "bg-muted")}>
        <div className="flex justify-center">{renderClearButton()}</div>
      </TableCell>
    </TableRow>
  );
}

export const MemoizedPermissionsFilters = memo(
  PermissionsFilters,
  (prevProps, nextProps) => {
    return (
      prevProps.nameSearch === nextProps.nameSearch &&
      prevProps.emailSearch === nextProps.emailSearch &&
      prevProps.permissionCodes.join(",") ===
        nextProps.permissionCodes.join(",") &&
      prevProps.isLoading === nextProps.isLoading
    );
  }
);

MemoizedPermissionsFilters.displayName = "MemoizedPermissionsFilters";
