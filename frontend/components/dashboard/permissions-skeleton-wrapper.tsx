"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { PermissionsSkeleton } from "./permissions-skeleton";

export function PermissionsSkeletonWrapper() {
  return (
    <DashboardShell title="Permissions">
      <PermissionsSkeleton />
    </DashboardShell>
  );
}
