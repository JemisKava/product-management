"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { ProductsSkeleton } from "./products-skeleton";

export function ProductsSkeletonWrapper() {
  return (
    <DashboardShell title="Products">
      <ProductsSkeleton />
    </DashboardShell>
  );
}
