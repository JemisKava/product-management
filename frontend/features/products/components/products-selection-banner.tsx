"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProductFilterStatus } from "@/components/products/product-filters";

interface ProductsSelectionBannerProps {
  selectedCount: number;
  selectedProductsPreview: Array<{ id: number; name: string; productId: string }>;
  extraSelectedCount: number;
  canEdit: boolean;
  canDelete: boolean;
  onClearSelection: () => void;
  onPreview: () => void;
  onUpdateStatus: (status: ProductFilterStatus) => void;
  onDelete: () => void;
  isUpdatingStatus: boolean;
  isDeleting: boolean;
}

export function ProductsSelectionBanner({
  selectedCount,
  selectedProductsPreview,
  extraSelectedCount,
  canEdit,
  canDelete,
  onClearSelection,
  onPreview,
  onUpdateStatus,
  onDelete,
  isUpdatingStatus,
  isDeleting,
}: ProductsSelectionBannerProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {selectedCount} selected
            </Badge>
            <span className="text-sm text-muted-foreground">products</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedProductsPreview.map((product) => (
              <Badge
                key={product.id}
                variant="outline"
                className="bg-background/60 text-xs"
              >
                {product.name}
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
            onClick={onClearSelection}
            className="border border-rose-300 bg-rose-50/70 text-rose-700 hover:bg-rose-100/80 hover:text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60"
          >
            Clear selection
          </Button>
          <Button variant="outline" size="sm" onClick={onPreview}>
            Preview
          </Button>
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUpdatingStatus}
                >
                  Update Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => onUpdateStatus("STOCK_IN")}
                >
                  Mark as Stock In
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdateStatus("STOCK_OUT")}
                >
                  Mark as Stock Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
            >
              Delete Selected
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
