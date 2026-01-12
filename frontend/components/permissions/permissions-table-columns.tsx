"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ALL_PERMISSION_CODES,
  PERMISSION_LABELS,
  type PermissionCode,
} from "@/lib/permissions";
import type { EmployeeRow } from "./permissions-utils";

interface PermissionsTableColumnsProps {
  basePermissionsByUser: Map<number, Set<PermissionCode>>;
  draftPermissions: Map<number, Set<PermissionCode>>;
  isSaving: boolean;
  onTogglePermission: (userId: number, permission: PermissionCode) => void;
}

export function usePermissionsTableColumns({
  basePermissionsByUser,
  draftPermissions,
  isSaving,
  onTogglePermission,
}: PermissionsTableColumnsProps) {
  const router = useRouter();

  const columns = useMemo<ColumnDef<EmployeeRow>[]>(
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
      ...ALL_PERMISSION_CODES.map(
        (permission): ColumnDef<EmployeeRow> => ({
          id: permission,
          header: () => (
            <div className="text-center">
              <div className="text-xs font-medium">
                {PERMISSION_LABELS[permission].split(" ")[0]}
              </div>
            </div>
          ),
          cell: ({ row }) => {
            const user = row.original;
            const baseSet =
              basePermissionsByUser.get(user.id) ?? new Set<PermissionCode>();
            const effectiveSet = draftPermissions.get(user.id) ?? baseSet;
            const hasPermission = effectiveSet.has(permission);
            const isChanged =
              draftPermissions.has(user.id) &&
              baseSet.has(permission) !== effectiveSet.has(permission);

            const hasEdit = effectiveSet.has("PRODUCT_EDIT");
            const hasDelete = effectiveSet.has("PRODUCT_DELETE");
            const isBulkDisabled =
              permission === "PRODUCT_BULK" && !hasEdit && !hasDelete;

            return (
              <div className="flex justify-center">
                <Checkbox
                  checked={hasPermission}
                  disabled={isSaving || isBulkDisabled}
                  onCheckedChange={() => onTogglePermission(user.id, permission)}
                  className={cn(
                    isChanged &&
                      "border-sky-400 ring-2 ring-sky-400/40 ring-offset-2 ring-offset-background"
                  )}
                  aria-label={`${PERMISSION_LABELS[permission]} for ${user.name}`}
                />
              </div>
            );
          },
        })
      ),
      {
        id: "actions",
        header: () => (
          <div className="text-center">
            <div className="text-xs font-medium">Action</div>
          </div>
        ),
        size: 80,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => router.push(`/users?view=${user.id}`)}
                aria-label={`View ${user.name}`}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [
      basePermissionsByUser,
      draftPermissions,
      isSaving,
      onTogglePermission,
      router,
    ]
  );

  return columns;
}
