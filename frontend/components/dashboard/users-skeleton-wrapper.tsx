"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { UsersSkeleton } from "./users-skeleton";

export function UsersSkeletonWrapper() {
  return (
    <DashboardShell title="Users">
      <UsersSkeleton />
    </DashboardShell>
  );
}
