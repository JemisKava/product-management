import { Suspense } from "react";
import { PermissionsPageClient } from "@/features/permissions/components/permissions-page-client";

export default function PermissionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PermissionsPageClient />
    </Suspense>
  );
}
