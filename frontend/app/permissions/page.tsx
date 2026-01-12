import { Suspense } from "react";
import { PermissionsPageClient } from "@/features/permissions/components/permissions-page-client";
import { PermissionsSkeletonWrapper } from "@/components/dashboard/permissions-skeleton-wrapper";

export default function PermissionsPage() {
  return (
    <Suspense fallback={<PermissionsSkeletonWrapper />}>
      <PermissionsPageClient />
    </Suspense>
  );
}
