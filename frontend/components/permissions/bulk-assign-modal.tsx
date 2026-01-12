"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ALL_PERMISSION_CODES,
  PERMISSION_LABELS,
  PERMISSION_DESCRIPTIONS,
  PERMISSIONS,
  type PermissionCode,
} from "@/lib/permissions";
import { Users } from "lucide-react";

type SelectedUser = {
  id: number;
  name: string;
  email: string;
};

const PERMISSION_PRESETS: Array<{
  id: string;
  label: string;
  description: string;
  permissions: PermissionCode[];
}> = [
  {
    id: "view-only",
    label: "View only",
    description: "Read-only access to products.",
    permissions: ["PRODUCT_VIEW"],
  },
  {
    id: "editor",
    label: "Editor",
    description: "View, create, and edit products.",
    permissions: ["PRODUCT_VIEW", "PRODUCT_CREATE", "PRODUCT_EDIT"],
  },
  {
    id: "full-access",
    label: "Full access",
    description: "All product permissions.",
    permissions: ALL_PERMISSION_CODES,
  },
];

type BulkAssignModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userIds: number[];
  userCount: number;
  selectedUsers?: SelectedUser[];
  onApply: (permissions: PermissionCode[], replaceExisting: boolean) => void;
  onSuccess?: () => void;
};

export function BulkAssignModal({
  open,
  onOpenChange,
  userIds,
  userCount,
  selectedUsers,
  onApply,
  onSuccess,
}: BulkAssignModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<
    Set<PermissionCode>
  >(new Set());
  const [replaceExisting, setReplaceExisting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedPermissions(new Set());
      setReplaceExisting(false);
    }
  }, [open]);

  const selectedPreview = useMemo(
    () => selectedUsers?.slice(0, 6) ?? [],
    [selectedUsers]
  );
  const extraSelectedCount = Math.max(
    (selectedUsers?.length ?? 0) - selectedPreview.length,
    0
  );

  const handleTogglePermission = (permission: PermissionCode) => {
    const newSet = new Set(selectedPermissions);
    if (newSet.has(permission)) {
      newSet.delete(permission);
    } else {
      newSet.add(permission);
    }

    // If unchecking PRODUCT_EDIT or PRODUCT_DELETE, check if we need to auto-uncheck PRODUCT_BULK
    if (
      (permission === PERMISSIONS.PRODUCT_EDIT ||
        permission === PERMISSIONS.PRODUCT_DELETE) &&
      !newSet.has(permission) // being unchecked
    ) {
      // Check if the other required permission is also not selected
      const hasEdit = newSet.has(PERMISSIONS.PRODUCT_EDIT);
      const hasDelete = newSet.has(PERMISSIONS.PRODUCT_DELETE);

      // If neither EDIT nor DELETE is selected, auto-uncheck BULK
      if (!hasEdit && !hasDelete && newSet.has(PERMISSIONS.PRODUCT_BULK)) {
        newSet.delete(PERMISSIONS.PRODUCT_BULK);
        toast.info("Bulk Actions permission removed", {
          description:
            "Bulk Actions requires at least Product Edit or Product Delete permission to be assigned.",
        });
      }
    }

    setSelectedPermissions(newSet);
  };

  const handleSelectAll = () => {
    if (selectedPermissions.size === ALL_PERMISSION_CODES.length) {
      setSelectedPermissions(new Set());
    } else {
      setSelectedPermissions(new Set(ALL_PERMISSION_CODES));
    }
  };

  const handlePresetSelect = (permissions: PermissionCode[]) => {
    setSelectedPermissions(new Set(permissions));
  };

  const handleSubmit = () => {
    if (userIds.length === 0 || selectedPermissions.size === 0) return;

    onApply(Array.from(selectedPermissions), replaceExisting);
    onSuccess?.();
    onOpenChange(false);
  };

  const allSelected = selectedPermissions.size === ALL_PERMISSION_CODES.length;
  const someSelected = selectedPermissions.size > 0 && !allSelected;
  const isPresetActive = (permissions: PermissionCode[]) =>
    permissions.length === selectedPermissions.size &&
    permissions.every((permission) => selectedPermissions.has(permission));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-screen max-h-screen w-screen max-w-[100vw] sm:h-auto sm:max-h-[82vh] sm:w-full sm:max-w-[500px] !gap-0 !overflow-hidden !p-0">
        <div className="flex max-h-screen flex-col sm:max-h-[82vh]">
          <DialogHeader className="shrink-0 border-b px-6 py-4 pr-12 bg-background">
            <DialogTitle>Bulk Manage Permissions</DialogTitle>
            <DialogDescription>
              Manage permissions for {userCount} selected employee
              {userCount !== 1 ? "s" : ""}. Changes are staged and saved when
              you click Save changes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            {selectedUsers && selectedUsers.length > 0 && (
              <div className="rounded-lg border bg-muted/30 px-3 py-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="size-3.5" />
                  <span>Selected employees</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedPreview.map((user) => (
                    <Badge
                      key={user.id}
                      variant="outline"
                      className="bg-background/60"
                    >
                      {user.name}
                    </Badge>
                  ))}
                  {extraSelectedCount > 0 && (
                    <Badge variant="secondary">
                      +{extraSelectedCount} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Quick presets
              </p>
              <div className="flex flex-wrap gap-2">
                {PERMISSION_PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    size="sm"
                    variant={
                      isPresetActive(preset.permissions)
                        ? "secondary"
                        : "outline"
                    }
                    onClick={() => handlePresetSelect(preset.permissions)}
                    title={preset.description}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Presets replace your current selection.
              </p>
            </div>

            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={allSelected || (someSelected && "indeterminate")}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Select All
                </label>
              </div>
              <span className="text-xs text-muted-foreground">
                {selectedPermissions.size} of {ALL_PERMISSION_CODES.length}{" "}
                selected
              </span>
            </div>

            <div className="space-y-3">
              {ALL_PERMISSION_CODES.map((permission) => {
                // Disable PRODUCT_BULK if neither PRODUCT_EDIT nor PRODUCT_DELETE is selected
                const hasEdit = selectedPermissions.has(
                  PERMISSIONS.PRODUCT_EDIT
                );
                const hasDelete = selectedPermissions.has(
                  PERMISSIONS.PRODUCT_DELETE
                );
                const isBulkDisabled =
                  permission === PERMISSIONS.PRODUCT_BULK &&
                  !hasEdit &&
                  !hasDelete;

                return (
                  <div
                    key={permission}
                    className={cn(
                      "flex items-start space-x-3 rounded-lg border p-3 transition-colors",
                      selectedPermissions.has(permission)
                        ? "border-primary/40 bg-primary/5"
                        : "hover:bg-muted/50",
                      isBulkDisabled && "opacity-50"
                    )}
                  >
                    <Checkbox
                      id={permission}
                      checked={selectedPermissions.has(permission)}
                      onCheckedChange={() => handleTogglePermission(permission)}
                      className="mt-0.5"
                      disabled={isBulkDisabled}
                    />
                    <div className="flex-1 space-y-1">
                      <label
                        htmlFor={permission}
                        className={cn(
                          "text-sm font-medium leading-none cursor-pointer",
                          isBulkDisabled && "cursor-not-allowed"
                        )}
                      >
                        {PERMISSION_LABELS[permission]}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {PERMISSION_DESCRIPTIONS[permission]}
                        {isBulkDisabled && (
                          <span className="block mt-1 text-xs text-orange-600 dark:text-orange-400">
                            Requires Product Edit or Product Delete permission
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="replace-existing"
                  checked={replaceExisting}
                  onCheckedChange={(value) => setReplaceExisting(!!value)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="replace-existing"
                  className={cn(
                    "text-xs leading-5 cursor-pointer",
                    replaceExisting
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  Replace existing permissions (remove any not selected).
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t px-6 py-4 bg-background">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedPermissions.size === 0 || userIds.length === 0}
            >
              Add to draft
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
