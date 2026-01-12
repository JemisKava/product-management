"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function PermissionsSkeleton() {
  return (
    <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 w-full">
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Header Skeleton */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-full sm:w-64" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="space-y-4">
          <div className="rounded-md border">
            <div className="p-4">
              <div className="space-y-3">
                {/* Table Header */}
                <div className="flex items-center gap-4 border-b pb-3">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-64" />
                </div>
                {/* Table Rows */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Pagination Skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
