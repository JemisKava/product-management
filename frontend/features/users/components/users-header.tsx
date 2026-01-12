"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsersHeaderProps {
  canCreate: boolean;
  onCreateClick: () => void;
}

export function UsersHeader({ canCreate, onCreateClick }: UsersHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold">Employee Accounts</h2>
        <p className="text-sm text-muted-foreground">
          Manage employee access and create new accounts.
        </p>
      </div>
      {canCreate && (
        <Button size="sm" className="gap-2" onClick={onCreateClick}>
          <Plus className="size-4" />
          Create Employee
        </Button>
      )}
    </div>
  );
}
