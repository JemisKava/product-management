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

export type ProductFilterStatus = "STOCK_IN" | "STOCK_OUT";

type CategoryOption = {
  id: number;
  name: string;
};

type ProductFiltersProps = {
  canBulk: boolean;
  showActions: boolean;
  search: string;
  categoryIds: number[];
  statuses: ProductFilterStatus[];
  priceMin: number | null;
  priceMax: number | null;
  stockMin: number | null;
  stockMax: number | null;
  categories: CategoryOption[];
  statusOptions: ProductFilterStatus[];
  priceRange: { min: number; max: number };
  stockRange: { min: number; max: number };
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: number[]) => void;
  onStatusChange: (value: ProductFilterStatus[]) => void;
  onPriceMinChange: (value: number | null) => void;
  onPriceMaxChange: (value: number | null) => void;
  onStockMinChange: (value: number | null) => void;
  onStockMaxChange: (value: number | null) => void;
  onClear: () => void;
  isLoading?: boolean;
  getStickyCellProps?: DataTableStickyContext["getStickyCellProps"];
};

const STATUS_LABELS: Record<ProductFilterStatus, string> = {
  STOCK_IN: "Stock In",
  STOCK_OUT: "Stock Out",
};

export function ProductFilters({
  canBulk,
  showActions,
  search,
  categoryIds,
  statuses,
  priceMin,
  priceMax,
  stockMin,
  stockMax,
  categories,
  statusOptions,
  priceRange,
  stockRange,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onPriceMinChange,
  onPriceMaxChange,
  onStockMinChange,
  onStockMaxChange,
  onClear,
  isLoading,
  getStickyCellProps,
}: ProductFiltersProps) {
  const { createInputRef } = useFocusPreservation();

  const hasFilters =
    search.trim().length > 0 ||
    categoryIds.length > 0 ||
    statuses.length > 0 ||
    priceMin !== null ||
    priceMax !== null ||
    stockMin !== null ||
    stockMax !== null;

  const categoryLabel = useMemo(() => {
    if (categoryIds.length === 0) return "All categories";
    if (categoryIds.length === 1) {
      const match = categories.find((item) => item.id === categoryIds[0]);
      return match ? match.name : "1 category";
    }
    return `${categoryIds.length} categories`;
  }, [categories, categoryIds]);

  const statusLabel = useMemo(() => {
    if (statuses.length === 0) return "All statuses";
    if (statuses.length === 1) return STATUS_LABELS[statuses[0]];
    return `${statuses.length} statuses`;
  }, [statuses]);

  const handleCategoryToggle = (categoryId: number) => {
    const next = categoryIds.includes(categoryId)
      ? categoryIds.filter((item) => item !== categoryId)
      : [...categoryIds, categoryId];
    onCategoryChange(next);
  };

  const handleStatusToggle = (status: ProductFilterStatus) => {
    const next = statuses.includes(status)
      ? statuses.filter((item) => item !== status)
      : [...statuses, status];
    onStatusChange(next);
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

  const columnIndex = (offset: number) => (canBulk ? offset + 1 : offset);

  return (
    <TableRow className="group">
      {canBulk && <TableCell {...getCellProps(0, "w-12")} />}
      <TableCell {...getCellProps(columnIndex(0), "min-w-[120px]")}>
        <Input placeholder="PRD###" disabled className="h-8 text-xs" />
      </TableCell>
      <TableCell {...getCellProps(columnIndex(1), "min-w-[180px]")}>
        <Input
          placeholder="Search name..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-8 text-xs"
          ref={createInputRef("search")}
        />
      </TableCell>
      <TableCell {...getCellProps(columnIndex(2))}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full justify-between text-xs"
              disabled={isLoading}
            >
              <span className="truncate">{categoryLabel}</span>
              <ChevronDown className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[220px]">
            <DropdownMenuLabel>Categories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                No categories found.
              </div>
            ) : (
              categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category.id}
                  checked={categoryIds.includes(category.id)}
                  onCheckedChange={() => handleCategoryToggle(category.id)}
                >
                  {category.name}
                </DropdownMenuCheckboxItem>
              ))
            )}
            {categoryIds.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="px-3 py-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {categoryIds.length} selected
                  </Badge>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      <TableCell {...getCellProps(columnIndex(3))}>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={`${priceRange.min}`}
            min={priceRange.min}
            max={priceRange.max}
            step="0.01"
            value={priceMin ?? ""}
            onChange={(event) =>
              onPriceMinChange(
                event.target.value === "" ? null : Number(event.target.value)
              )
            }
            className="h-8 text-xs flex-1 min-w-0"
            ref={createInputRef("priceMin")}
          />
          <span className="text-xs text-muted-foreground shrink-0">-</span>
          <Input
            type="number"
            placeholder={`${priceRange.max}`}
            min={priceRange.min}
            max={priceRange.max}
            step="0.01"
            value={priceMax ?? ""}
            onChange={(event) =>
              onPriceMaxChange(
                event.target.value === "" ? null : Number(event.target.value)
              )
            }
            className="h-8 text-xs flex-1 min-w-0"
            ref={createInputRef("priceMax")}
          />
        </div>
      </TableCell>
      <TableCell {...getCellProps(columnIndex(4))}>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={`${stockRange.min}`}
            min={stockRange.min}
            max={stockRange.max}
            step="1"
            value={stockMin ?? ""}
            onChange={(event) =>
              onStockMinChange(
                event.target.value === "" ? null : Number(event.target.value)
              )
            }
            className="h-8 text-xs flex-1 min-w-0"
            ref={createInputRef("stockMin")}
          />
          <span className="text-xs text-muted-foreground shrink-0">-</span>
          <Input
            type="number"
            placeholder={`${stockRange.max}`}
            min={stockRange.min}
            max={stockRange.max}
            step="1"
            value={stockMax ?? ""}
            onChange={(event) =>
              onStockMaxChange(
                event.target.value === "" ? null : Number(event.target.value)
              )
            }
            className="h-8 text-xs flex-1 min-w-0"
            ref={createInputRef("stockMax")}
          />
        </div>
      </TableCell>
      <TableCell {...getCellProps(columnIndex(5))}>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full justify-between text-xs"
                disabled={isLoading}
              >
                <span className="truncate">{statusLabel}</span>
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statusOptions.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statuses.includes(status)}
                  onCheckedChange={() => handleStatusToggle(status)}
                >
                  {STATUS_LABELS[status]}
                </DropdownMenuCheckboxItem>
              ))}
              {statuses.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="px-3 py-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {statuses.length} selected
                    </Badge>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {!showActions && renderClearButton("shrink-0")}
        </div>
      </TableCell>
      {showActions && (
        <TableCell {...getCellProps(columnIndex(6))}>
          {renderClearButton()}
        </TableCell>
      )}
    </TableRow>
  );
}

export const MemoizedProductFilters = memo(
  ProductFilters,
  (prevProps, nextProps) => {
    return (
      prevProps.canBulk === nextProps.canBulk &&
      prevProps.showActions === nextProps.showActions &&
      prevProps.search === nextProps.search &&
      prevProps.categoryIds.join(",") === nextProps.categoryIds.join(",") &&
      prevProps.statuses.join(",") === nextProps.statuses.join(",") &&
      prevProps.priceMin === nextProps.priceMin &&
      prevProps.priceMax === nextProps.priceMax &&
      prevProps.stockMin === nextProps.stockMin &&
      prevProps.stockMax === nextProps.stockMax &&
      prevProps.isLoading === nextProps.isLoading
    );
  }
);
