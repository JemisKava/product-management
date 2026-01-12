"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STATUS_STYLES } from "../products-utils";
import type { ProductFilterStatus } from "@/components/products/product-filters";

interface PreviewProduct {
  id: number;
  productId: string;
  name: string;
  categoryName: string;
  price?: number;
  stockDetails?: number;
  status?: ProductFilterStatus;
}

interface ProductsBulkPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewProducts: PreviewProduct[];
  selectedCount: number;
  bulkPreviewAction:
    | { type: "delete" }
    | { type: "status"; status: ProductFilterStatus }
    | null;
  canEdit: boolean;
  canDelete: boolean;
  isUpdatingStatus: boolean;
  isDeleting: boolean;
  onUpdateStatus: (status: ProductFilterStatus) => void;
  onDelete: () => void;
}

export function ProductsBulkPreviewDialog({
  open,
  onOpenChange,
  previewProducts,
  selectedCount,
  bulkPreviewAction,
  canEdit,
  canDelete,
  isUpdatingStatus,
  isDeleting,
  onUpdateStatus,
  onDelete,
}: ProductsBulkPreviewDialogProps) {
  const title =
    bulkPreviewAction?.type === "delete"
      ? "Review delete selection"
      : bulkPreviewAction?.type === "status"
        ? `Review status update`
        : "Preview selected products";

  const description =
    bulkPreviewAction?.type === "status"
      ? `These products will be marked as ${
          bulkPreviewAction.status === "STOCK_IN" ? "Stock In" : "Stock Out"
        }.`
      : bulkPreviewAction?.type === "delete"
        ? "These products will be permanently removed."
        : "Review the selected products before applying an action.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-5xl p-0 overflow-hidden max-h-screen sm:max-h-[90vh] w-full">
        <div className="flex flex-col h-full max-h-screen sm:max-h-[90vh] overflow-hidden">
          <div className="border-b bg-background px-3 sm:px-6 py-4">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-[10px]">
                  {selectedCount} selected
                </Badge>
                {bulkPreviewAction?.type === "status" && (
                  <Badge
                    variant="outline"
                    className={STATUS_STYLES[bulkPreviewAction.status]}
                  >
                    {bulkPreviewAction.status === "STOCK_IN"
                      ? "Stock In"
                      : "Stock Out"}
                  </Badge>
                )}
                {bulkPreviewAction?.type === "delete" && (
                  <Badge
                    variant="outline"
                    className="text-rose-700 border-rose-200 bg-rose-50/70 dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-300"
                  >
                    Delete
                  </Badge>
                )}
              </div>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
            <div className="rounded-lg border bg-background/70 overflow-hidden mx-3 md:mx-6">
              <div className="overflow-x-auto w-full">
                <div className="min-w-[650px] md:min-w-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">
                          Product ID
                        </TableHead>
                        <TableHead className="whitespace-nowrap">Name</TableHead>
                        <TableHead className="whitespace-nowrap">
                          Category
                        </TableHead>
                        <TableHead className="whitespace-nowrap">Price</TableHead>
                        <TableHead className="whitespace-nowrap">Stock</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-mono text-xs whitespace-nowrap">
                            {product.productId}
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">
                            {product.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {product.categoryName}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {typeof product.price === "number"
                              ? `$${product.price.toFixed(2)}`
                              : "—"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {typeof product.stockDetails === "number"
                              ? product.stockDetails
                              : "—"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {product.status ? (
                              <Badge
                                variant="outline"
                                className={STATUS_STYLES[product.status]}
                              >
                                {product.status === "STOCK_IN"
                                  ? "Stock In"
                                  : "Stock Out"}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {previewProducts.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">
                  No products selected.
                </div>
              )}
            </div>
          </div>
          <div className="border-t bg-background px-3 sm:px-6 py-4">
            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUpdatingStatus || isDeleting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              {bulkPreviewAction?.type === "status" ? (
                <Button
                  onClick={() => onUpdateStatus(bulkPreviewAction.status)}
                  disabled={isUpdatingStatus || selectedCount === 0}
                  className="w-full sm:w-auto"
                >
                  Update to{" "}
                  {bulkPreviewAction.status === "STOCK_IN"
                    ? "Stock In"
                    : "Stock Out"}
                </Button>
              ) : bulkPreviewAction?.type === "delete" ? (
                <Button
                  variant="destructive"
                  onClick={onDelete}
                  disabled={isDeleting || selectedCount === 0}
                  className="w-full sm:w-auto"
                >
                  Delete Selected
                </Button>
              ) : (
                <>
                  {canEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={isUpdatingStatus}
                          className="w-full sm:w-auto"
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
                      onClick={onDelete}
                      disabled={isDeleting || selectedCount === 0}
                      className="w-full sm:w-auto"
                    >
                      Delete Selected
                    </Button>
                  )}
                </>
              )}
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
