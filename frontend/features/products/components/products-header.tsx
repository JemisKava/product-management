"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductsHeaderProps {
  canCreate: boolean;
  onCreateClick: () => void;
}

export function ProductsHeader({
  canCreate,
  onCreateClick,
}: ProductsHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold">Products</h2>
        <p className="text-sm text-muted-foreground">
          Track inventory and availability.
        </p>
      </div>
      {canCreate && (
        <Button size="sm" className="gap-2" onClick={onCreateClick}>
          <Plus className="size-4" />
          Create Product
        </Button>
      )}
    </div>
  );
}
