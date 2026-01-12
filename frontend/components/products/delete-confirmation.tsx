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

type DeleteConfirmationProps = {
  open: boolean;
  productName?: string | null;
  productCount?: number;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

export function DeleteConfirmation({
  open,
  productName,
  productCount,
  onCancel,
  onConfirm,
  isLoading,
}: DeleteConfirmationProps) {
  const isBulkDelete = typeof productCount === "number" && productCount > 0;
  const title = isBulkDelete
    ? `Delete ${productCount} product${productCount !== 1 ? "s" : ""}?`
    : "Delete product?";
  const description = isBulkDelete
    ? `This action cannot be undone. This will permanently delete ${productCount} product${productCount !== 1 ? "s" : ""} from your inventory.`
    : `This action cannot be undone. This will permanently delete${productName ? ` "${productName}"` : " this product"}.`;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
