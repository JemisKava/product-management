import { Suspense } from "react";
import { ProductsPageClient } from "@/features/products/components/products-page-client";
import { ProductsSkeletonWrapper } from "@/components/dashboard/products-skeleton-wrapper";

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsSkeletonWrapper />}>
      <ProductsPageClient />
    </Suspense>
  );
}
