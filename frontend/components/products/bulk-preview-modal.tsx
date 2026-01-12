"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ProductPreview = {
  id: number;
  productId: string;
  name: string;
  category?: string;
  price?: number;
  quantity?: number;
  status?: string;
};

type BulkPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ProductPreview[];
  totalCount: number;
};

const STATUS_STYLES: Record<string, string> = {
  STOCK_IN:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30",
  STOCK_OUT:
    "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30",
};

export function BulkPreviewModal({
  open,
  onOpenChange,
  products,
  totalCount,
}: BulkPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl sm:max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Selected Products Preview</DialogTitle>
          <DialogDescription>
            Review {totalCount} selected product{totalCount !== 1 ? "s" : ""}{" "}
            before performing bulk actions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Product ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No products selected
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-xs">
                        {product.productId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.category || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.price !== undefined
                          ? `$${product.price.toFixed(2)}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.quantity !== undefined
                          ? product.quantity
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {product.status ? (
                          <Badge
                            variant="outline"
                            className={STATUS_STYLES[product.status] || ""}
                          >
                            {product.status === "STOCK_IN"
                              ? "Stock In"
                              : "Stock Out"}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalCount > products.length && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Showing {products.length} of {totalCount} selected products
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
