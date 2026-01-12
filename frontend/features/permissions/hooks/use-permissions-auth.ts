"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function usePermissionsAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, getUserRoleFromToken } =
    useAuthStore();
  const userRole = getUserRoleFromToken() || user?.role;
  const isAdmin = userRole === "ADMIN";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Redirect to products if not admin
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push("/products");
    }
  }, [isAuthenticated, isLoading, isAdmin, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
  };
}
