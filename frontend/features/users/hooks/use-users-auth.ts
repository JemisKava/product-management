"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function useUsersAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, getUserRoleFromToken } =
    useAuthStore();
  const userRole = getUserRoleFromToken() || user?.role;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && userRole !== "ADMIN") {
      router.push("/products");
    }
  }, [isAuthenticated, isLoading, userRole, router]);

  return {
    isLoading,
    isAuthenticated,
    user,
    userRole,
    canView: userRole === "ADMIN",
  };
}
