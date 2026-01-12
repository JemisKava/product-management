"use client";

import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Table } from "@tanstack/react-table";
import type { EmployeeRow } from "./permissions-utils";

interface PermissionsSelectionBannerProps {
  selectedCount: number;
  selectedPreview: Array<{ id: number; name: string; email: string }>;
  extraSelectedCount: number;
  table: Table<EmployeeRow>;
  onBulkModalOpen: () => void;
  isSaving: boolean;
}

export function PermissionsSelectionBanner({
  selectedCount,
  selectedPreview,
  extraSelectedCount,
  table,
  onBulkModalOpen,
  isSaving,
}: PermissionsSelectionBannerProps) {
  if (selectedCount === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        Select employees to bulk assign permissions.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card/70 p-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Users className="size-4" />
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium">
              {selectedCount} employee{selectedCount !== 1 ? "s" : ""} selected
            </p>
            <p className="text-xs text-muted-foreground">
              Apply the same permissions to everyone selected.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
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
              <Badge variant="secondary">+{extraSelectedCount} more</Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => table.resetRowSelection()}
          className="border border-rose-300 bg-rose-50/70 text-rose-700 hover:bg-rose-100/80 hover:text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60"
        >
          Clear selection
        </Button>
        <Button
          onClick={onBulkModalOpen}
          size="sm"
          className="gap-2"
          disabled={isSaving}
        >
          <Users className="size-4" />
          Manage Permissions
        </Button>
      </div>
    </div>
  );
}
