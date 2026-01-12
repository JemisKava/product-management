import { Suspense } from "react";
import { UsersPageClient } from "@/features/users/components/users-page-client";
import { UsersSkeletonWrapper } from "@/components/dashboard/users-skeleton-wrapper";

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersSkeletonWrapper />}>
      <UsersPageClient />
    </Suspense>
  );
}
