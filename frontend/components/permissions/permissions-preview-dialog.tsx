"use client";

import { CircleMinus, CirclePlus } from "lucide-react";
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
import { PERMISSION_PREVIEW_META } from "./permissions-utils";
import type { PermissionCode } from "@/lib/permissions";

interface PreviewItem {
  userId: number;
  name: string;
  email: string;
  added: PermissionCode[];
  removed: PermissionCode[];
}

interface PermissionsPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewItems: PreviewItem[];
  previewTitle: string;
  previewDescription: string;
  isSaving: boolean;
  hasChanges: boolean;
  onSave: () => void;
}

export function PermissionsPreviewDialog({
  open,
  onOpenChange,
  previewItems,
  previewTitle,
  previewDescription,
  isSaving,
  hasChanges,
  onSave,
}: PermissionsPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
        <div className="flex max-h-screen flex-col sm:max-h-[80vh]">
          <div className="border-b bg-background px-6 py-4">
            <DialogHeader>
              <DialogTitle>{previewTitle}</DialogTitle>
              <DialogDescription>{previewDescription}</DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="rounded-lg border bg-background/70">
              {previewItems.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  No permission changes to review.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-2 border-b px-4 py-2 text-xs font-medium text-muted-foreground sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                    <span>Employee</span>
                    <span>Changes</span>
                  </div>
                  {previewItems.map((item) => (
                    <div
                      key={item.userId}
                      className="grid grid-cols-1 gap-3 border-b px-4 py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"
                    >
                      <div className="sm:self-start">
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.email}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:self-center">
                        {item.added.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            {item.added.map((permission) => {
                              const meta = PERMISSION_PREVIEW_META[permission];
                              return (
                                <Badge
                                  key={`${item.userId}-add-${permission}`}
                                  variant="outline"
                                  className="flex items-center gap-1.5 text-[11px] font-medium border border-emerald-200 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-300"
                                >
                                  <CirclePlus className="size-4" />
                                  {meta.action}
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                        {item.removed.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            {item.removed.map((permission) => {
                              const meta = PERMISSION_PREVIEW_META[permission];
                              return (
                                <Badge
                                  key={`${item.userId}-remove-${permission}`}
                                  variant="outline"
                                  className="flex items-center gap-1.5 text-[11px] font-medium border border-rose-200 bg-rose-50/70 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-300"
                                >
                                  <CircleMinus className="size-4" />
                                  {meta.action}
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          <div className="border-t bg-background px-6 py-4">
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={onSave} disabled={isSaving || !hasChanges}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
