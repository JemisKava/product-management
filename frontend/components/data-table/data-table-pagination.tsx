"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationEllipsis } from "@/components/ui/pagination";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

type DataTablePaginationProps = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function DataTablePagination({
  page,
  pageSize,
  totalPages,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const isMobile = useIsMobile();
  const safeTotalPages = Math.max(totalPages, 1);
  const startItem = totalItems ? (page - 1) * pageSize + 1 : undefined;
  const endItem = totalItems
    ? Math.min(page * pageSize, totalItems)
    : undefined;

  // Generate page items with ellipses
  type PageItem = number | { type: "ellipsis"; targetPage: number };
  const getPageItems = (): PageItem[] => {
    const items: PageItem[] = [];

    if (isMobile) {
      // Mobile: Maximum 5 page items (including ellipses)
      if (safeTotalPages <= 5) {
        // Show all pages if 5 or fewer
        for (let i = 1; i <= safeTotalPages; i++) {
          items.push(i);
        }
        return items;
      }

      if (page <= 3) {
        // Near beginning: 1 2 3 4 5
        for (let i = 1; i <= 5; i++) {
          items.push(i);
        }
      } else if (page >= safeTotalPages - 2) {
        // Near end: (last-4) (last-3) (last-2) (last-1) last
        for (let i = safeTotalPages - 4; i <= safeTotalPages; i++) {
          items.push(i);
        }
      } else {
        // Middle: 1 ... current ... last (5 items total)
        items.push(1);
        items.push({ type: "ellipsis", targetPage: Math.floor((1 + page) / 2) });
        items.push(page);
        items.push({ type: "ellipsis", targetPage: Math.floor((page + safeTotalPages) / 2) });
        items.push(safeTotalPages);
      }
    } else {
      // Desktop: Current behavior (more page items)
      if (safeTotalPages <= 5) {
        // Show all pages if 5 or fewer
        for (let i = 1; i <= safeTotalPages; i++) {
          items.push(i);
        }
        return items;
      }

      // Always show first page
      items.push(1);

      if (page <= 3) {
        // Near beginning: 1 2 3 4 5 ... last
        for (let i = 2; i <= 5; i++) {
          items.push(i);
        }
        items.push({ type: "ellipsis", targetPage: Math.floor((5 + safeTotalPages) / 2) });
        items.push(safeTotalPages);
      } else if (page >= safeTotalPages - 2) {
        // Near end: 1 ... (last-4) (last-3) (last-2) (last-1) last
        items.push({ type: "ellipsis", targetPage: Math.floor((1 + (safeTotalPages - 4)) / 2) });
        for (let i = safeTotalPages - 4; i <= safeTotalPages; i++) {
          items.push(i);
        }
      } else {
        // Middle: 1 ... (page-1) page (page+1) ... last
        items.push({ type: "ellipsis", targetPage: Math.floor((1 + (page - 1)) / 2) });
        items.push(page - 1);
        items.push(page);
        items.push(page + 1);
        items.push({ type: "ellipsis", targetPage: Math.floor(((page + 1) + safeTotalPages) / 2) });
        items.push(safeTotalPages);
      }
    }

    return items;
  };

  const pageItems = getPageItems();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-6 py-3 border-t border-border">
      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
        <span className="hidden sm:inline">Rows per page:</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {totalItems !== undefined &&
          startItem !== undefined &&
          endItem !== undefined && (
            <span className="text-muted-foreground">
              {startItem}-{endItem} of {totalItems}
            </span>
          )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="flex items-center gap-1 mx-1">
          {pageItems.map((item, index) => {
            if (typeof item === "object" && item.type === "ellipsis") {
              return (
                <PaginationEllipsis
                  key={`ellipsis-${index}`}
                  onClick={() => onPageChange(item.targetPage)}
                />
              );
            }
            const pageNumber = item as number;
            return (
              <Button
                key={pageNumber}
                variant={pageNumber === page ? "default" : "outline"}
                size="icon"
                className="size-8"
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= safeTotalPages}
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={page >= safeTotalPages}
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
