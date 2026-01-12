import { Suspense } from "react";
import { UsersPageClient } from "@/features/users/components/users-page-client";

export default function UsersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UsersPageClient />
    </Suspense>
  );
}
