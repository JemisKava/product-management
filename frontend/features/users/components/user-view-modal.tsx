"use client";

import { useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ALL_PERMISSION_CODES,
  PERMISSION_LABELS,
  type PermissionCode,
} from "@/lib/permissions";

type UserViewModalProps = {
  open: boolean;
  userId?: number | null;
  onOpenChange: (open: boolean) => void;
};

const ROLE_LABELS = {
  ADMIN: "Admin",
  EMPLOYEE: "Employee",
} as const;

const STATUS_LABELS = {
  true: "Active",
  false: "Inactive",
} as const;

const STATUS_CLASSES = {
  true: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30",
  false:
    "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30",
} as const;

const ROLE_CLASSES = {
  ADMIN: "bg-primary/15 text-primary border-primary/30",
  EMPLOYEE: "bg-muted text-muted-foreground border-border",
} as const;

const formatDate = (value?: Date | string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export function UserViewModal({
  open,
  userId,
  onOpenChange,
}: UserViewModalProps) {
  const shouldFetchUser = open && typeof userId === "number";

  const {
    data: userData,
    isPending: userLoading,
    error: userError,
  } = trpc.user.getById.useQuery(
    { id: userId ?? 0 },
    {
      enabled: shouldFetchUser,
      refetchOnWindowFocus: false,
    }
  );

  const permissionCodes = useMemo<PermissionCode[]>(() => {
    if (!userData) return [];
    if (userData.role === "ADMIN") return ALL_PERMISSION_CODES;
    return (userData.permissions ?? []).filter(
      (permission): permission is PermissionCode =>
        ALL_PERMISSION_CODES.includes(permission as PermissionCode)
    );
  }, [userData]);

  const statusKey = userData?.isActive ? "true" : "false";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[100vh] max-h-[100vh] w-[100vw] max-w-[100vw] sm:h-auto sm:max-h-[82vh] sm:w-full sm:max-w-2xl !gap-0 !overflow-hidden !p-0">
        <div className="flex max-h-[100vh] flex-col sm:max-h-[82vh]">
          <DialogHeader className="shrink-0 border-b px-6 py-4 pr-12 bg-background">
            <div className="flex flex-wrap items-center gap-2">
              <DialogTitle>{userData?.name ?? "Employee details"}</DialogTitle>
              {userData?.role && (
                <Badge
                  variant="outline"
                  className={ROLE_CLASSES[userData.role]}
                >
                  {ROLE_LABELS[userData.role]}
                </Badge>
              )}
              {userData && (
                <Badge variant="outline" className={STATUS_CLASSES[statusKey]}>
                  {STATUS_LABELS[statusKey]}
                </Badge>
              )}
            </div>
            <DialogDescription>
              View employee profile details and assigned permissions.
            </DialogDescription>
          </DialogHeader>

          {userLoading && shouldFetchUser ? (
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : userError ? (
            <div className="flex-1 px-6 py-4">
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                {userError.message || "Unable to load user."}
              </div>
            </div>
          ) : userData ? (
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Contact
                  </p>
                  <div>
                    <p className="text-xs text-muted-foreground">Full name</p>
                    <p className="text-sm font-medium">
                      {userData.name || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium break-all">
                      {userData.email || "—"}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Account
                  </p>
                  <div>
                    <p className="text-xs text-muted-foreground">Employee ID</p>
                    <p className="text-sm font-medium">{userData.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <Badge
                      variant="outline"
                      className={ROLE_CLASSES[userData.role]}
                    >
                      {ROLE_LABELS[userData.role]}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge
                      variant="outline"
                      className={STATUS_CLASSES[statusKey]}
                    >
                      {STATUS_LABELS[statusKey]}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Permissions
                </p>
                {userData.role === "ADMIN" && (
                  <p className="text-xs text-muted-foreground">
                    Admins automatically receive all permissions.
                  </p>
                )}
                {permissionCodes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No permissions assigned.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {permissionCodes.map((permission) => (
                      <Badge
                        key={permission}
                        variant="outline"
                        className="text-xs"
                      >
                        {PERMISSION_LABELS[permission] || permission}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {formatDate(userData.createdAt)}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">Last updated</p>
                  <p className="text-sm font-medium">
                    {formatDate(userData.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 px-6 py-4">
              <div className="rounded-lg border border-muted bg-muted/20 p-4 text-sm text-muted-foreground">
                No employee data available.
              </div>
            </div>
          )}

          <DialogFooter className="shrink-0 border-t px-6 py-4 bg-background">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
