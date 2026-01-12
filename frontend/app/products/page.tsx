import { Suspense } from "react";
import { ProductsPageClient } from "@/features/products/components/products-page-client";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPageClient />
    </Suspense>
  );
}
