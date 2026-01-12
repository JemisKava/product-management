"use client";

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { flexRender, type Table as TableType } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableStickyCellVariant = "header" | "body" | "filter";

export type DataTableStickyCellOptions = {
  className?: string;
  variant?: DataTableStickyCellVariant;
};

export type DataTableStickyCellProps = {
  className?: string;
  style?: CSSProperties;
};

export type DataTableStickyContext = {
  getStickyCellProps: (
    columnIndex: number,
    options?: DataTableStickyCellOptions
  ) => DataTableStickyCellProps;
};

type DataTableProps<TData> = {
  table: TableType<TData>;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyState?: ReactNode;
  prependRows?: ReactNode;
  renderPrependRows?: (context: DataTableStickyContext) => ReactNode;
  className?: string;
  stickyColumns?: number;
};

export function DataTable<TData>({
  table,
  isLoading = false,
  skeletonRows = 5,
  emptyState,
  prependRows,
  renderPrependRows,
  className,
  stickyColumns = 0,
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const columnCount = visibleColumns.length;
  const stickyColumnCount = Math.min(Math.max(stickyColumns, 0), columnCount);

  const pinnedLeftColumnIds = useMemo(
    () => visibleColumns.slice(0, stickyColumnCount).map((column) => column.id),
    [stickyColumnCount, visibleColumns]
  );

  useEffect(() => {
    table.setColumnPinning((current) => {
      const nextLeft = pinnedLeftColumnIds;
      const currentLeft = current?.left ?? [];
      const currentRight = current?.right ?? [];

      const leftMatches =
        currentLeft.length === nextLeft.length &&
        currentLeft.every((id, index) => id === nextLeft[index]);

      if (leftMatches && currentRight.length === 0) {
        return current;
      }

      return {
        left: nextLeft,
        right: [],
      };
    });
  }, [pinnedLeftColumnIds, table]);

  const getStickyCellProps = useCallback(
    (
      columnIndex: number,
      options: DataTableStickyCellOptions = {}
    ): DataTableStickyCellProps => {
      const column = visibleColumns[columnIndex];
      if (!column) {
        return { className: options.className };
      }

      // Check if column should be sticky based on index (primary source of truth)
      const shouldBeSticky = columnIndex < stickyColumnCount;

      const pinPosition = column.getIsPinned();
      // Use column index as fallback if table state isn't ready
      const isPinned = pinPosition !== false || shouldBeSticky;
      const isPinnedLeft =
        pinPosition === "left" || (shouldBeSticky && pinPosition !== "right");
      const isPinnedRight = pinPosition === "right";
      const variant = options.variant ?? "body";
      const size = column.getSize();

      const pinnedIndex =
        column.getPinnedIndex() ?? (shouldBeSticky ? columnIndex : undefined);
      const leftPinnedCount =
        table.getState().columnPinning.left?.length ?? stickyColumnCount;
      const isLastLeftPinned =
        isPinnedLeft &&
        (pinnedIndex === leftPinnedCount - 1 ||
          columnIndex === stickyColumnCount - 1);
      const isFirstRightPinned = isPinnedRight && pinnedIndex === 0;

      // FIX: Always calculate left offset from cumulative column widths
      // This fixes the issue where left becomes 0px after route navigation
      let offset: number | undefined = undefined;
      if (isPinnedLeft && shouldBeSticky) {
        // Calculate cumulative left from previous column widths
        let cumulativeLeft = 0;
        for (let i = 0; i < columnIndex; i++) {
          const prevColumn = visibleColumns[i];
          if (prevColumn) {
            cumulativeLeft += prevColumn.getSize();
          }
        }
        // Always use calculated value, never trust table's getStart("left")
        offset = cumulativeLeft;
      } else if (isPinnedRight) {
        offset = column.getAfter("right");
      }

      // Calculate z-index for filter cells based on pinned index (earlier columns have higher z-index)
      const filterZIndex =
        isPinned &&
        variant === "filter" &&
        typeof pinnedIndex === "number" &&
        pinnedIndex >= 0
          ? 30 - pinnedIndex
          : variant === "filter" && isPinned
            ? 20 // fallback for edge cases
            : undefined;

      const stickyClassName = isPinned
        ? variant === "header"
          ? "sticky z-30 bg-muted transition-colors"
          : variant === "filter"
            ? "sticky bg-muted transition-colors"
            : "sticky z-20 bg-card group-hover:bg-muted group-data-[state=selected]:bg-muted transition-colors"
        : variant === "filter"
          ? "bg-muted transition-colors"
          : "";

      const dividerClassName =
        isLastLeftPinned || isFirstRightPinned
          ? "shadow-[inset_-1px_0_0_0_hsl(var(--border))]"
          : "";

      const baseStyle: CSSProperties | undefined = isPinned
        ? {
            width: size,
            minWidth: size,
            ...(filterZIndex !== undefined ? { zIndex: filterZIndex } : {}),
          }
        : undefined;

      return {
        className: cn(options.className, stickyClassName, dividerClassName),
        style: isPinned
          ? {
              ...baseStyle,
              left: isPinnedLeft ? offset : undefined,
              right: isPinnedRight ? offset : undefined,
            }
          : baseStyle,
      };
    },
    [table, visibleColumns, stickyColumnCount]
  );

  const prependContent = renderPrependRows
    ? renderPrependRows({ getStickyCellProps })
    : prependRows;

  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
      <Table className="min-w-max">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted hover:bg-muted">
              {headerGroup.headers.map((header, headerIndex) => {
                const stickyProps = getStickyCellProps(headerIndex, {
                  variant: "header",
                });
                return (
                  <TableHead
                    key={header.id}
                    data-column-id={header.column.id}
                    className={stickyProps.className}
                    style={stickyProps.style}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {prependContent}
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow
                key={`skeleton-${rowIndex}`}
                className="group hover:bg-muted transition-colors"
              >
                {visibleColumns.map((column, cellIndex) => {
                  const stickyProps = getStickyCellProps(cellIndex);
                  return (
                    <TableCell
                      key={`skeleton-${rowIndex}-${cellIndex}`}
                      data-column-id={column.id}
                      className={stickyProps.className}
                      style={stickyProps.style}
                    >
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : rows.length ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="group hover:bg-muted transition-colors"
              >
                {row.getVisibleCells().map((cell, cellIndex) => {
                  const stickyProps = getStickyCellProps(cellIndex);
                  return (
                    <TableCell
                      key={cell.id}
                      data-column-id={cell.column.id}
                      className={stickyProps.className}
                      style={stickyProps.style}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-24 text-center">
                {emptyState || (
                  <span className="text-sm text-muted-foreground">
                    No results found.
                  </span>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
