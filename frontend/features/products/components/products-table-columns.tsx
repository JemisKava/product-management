"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import type { ProductRow } from "../products-utils";
import { STATUS_STYLES } from "../products-utils";
import type { ProductFilterStatus } from "@/components/products/product-filters";

interface UseProductsTableColumnsProps {
  canBulk: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (product: ProductRow) => void;
}

export function useProductsTableColumns({
  canBulk,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
}: UseProductsTableColumnsProps) {
  const columns = useMemo<ColumnDef<ProductRow>[]>(() => {
    const baseColumns: ColumnDef<ProductRow>[] = [
      {
        accessorKey: "productId",
        header: "Product ID",
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs sm:text-sm">
            {row.original.productId}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Button
            variant="link"
            className="h-auto px-0 text-left"
            onClick={() => onView(row.original.id)}
          >
            {row.original.name}
          </Button>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.category.name}
          </span>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
          <span className="text-sm">${row.original.price.toFixed(2)}</span>
        ),
      },
      {
        accessorKey: "stockDetails",
        header: "Stock",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.stockDetails}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={STATUS_STYLES[row.original.status]}
          >
            {row.original.status === "STOCK_IN" ? "Stock In" : "Stock Out"}
          </Badge>
        ),
      },
    ];

    baseColumns.push({
      id: "actions",
      header: "Actions",
      size: 72,
      cell: ({ row }) =>
        canEdit || canDelete ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 sm:size-8 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="size-3.5 sm:size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(row.original.id)}>
                <Eye className="size-4 mr-2" />
                View
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
                  <Edit className="size-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(row.original)}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 sm:size-8 text-muted-foreground hover:text-foreground"
                onClick={() => onView(row.original.id)}
                aria-label="View product"
              >
                <Eye className="size-3.5 sm:size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" align="center">
              View
            </TooltipContent>
          </Tooltip>
        ),
    });

    if (canBulk) {
      return [
        {
          id: "select",
          header: ({ table }) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(Boolean(value))
              }
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
              aria-label={`Select ${row.original.name}`}
            />
          ),
          size: 40,
        },
        ...baseColumns,
      ];
    }

    return baseColumns;
  }, [canBulk, canDelete, canEdit, onDelete, onEdit, onView]);

  return columns;
}
