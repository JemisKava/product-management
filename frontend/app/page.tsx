"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { DashboardContent } from "@/components/dashboard/content";
import { DashboardShell } from "@/components/dashboard/shell";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <AuthLoadingScreen variant="dashboard" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardShell title="Dashboard">
      <DashboardContent />
    </DashboardShell>
  );
}
