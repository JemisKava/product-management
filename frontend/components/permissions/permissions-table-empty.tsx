"use client";

import { Users } from "lucide-react";

interface PermissionsTableEmptyProps {
  hasFilters: boolean;
}

export function PermissionsTableEmpty({
  hasFilters,
}: PermissionsTableEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Users className="size-12 text-muted-foreground mb-2" />
      <p className="text-sm font-medium">No employees found</p>
      <p className="text-xs text-muted-foreground mt-1">
        {hasFilters
          ? "Try adjusting your filters"
          : "Employees will appear here once created"}
      </p>
    </div>
  );
}
