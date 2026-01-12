"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  PERMISSIONS,
  hasPermission as checkPermission,
} from "@/lib/permissions";

export function useProductsAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    getUserRoleFromToken,
    hasPermission,
  } = useAuthStore();

  const userRole = getUserRoleFromToken() || user?.role;
  const isAdmin = userRole === "ADMIN";
  const userPermissions = useAuthStore.getState().getPermissionsFromToken();
  const allPermissions = isAdmin ? Object.values(PERMISSIONS) : userPermissions;

  const canViewProducts = isAdmin || hasPermission("PRODUCT_VIEW");
  const canCreate =
    isAdmin ||
    checkPermission(allPermissions, PERMISSIONS.PRODUCT_CREATE, isAdmin);
  const canEdit =
    isAdmin ||
    checkPermission(allPermissions, PERMISSIONS.PRODUCT_EDIT, isAdmin);
  const canDelete =
    isAdmin ||
    checkPermission(allPermissions, PERMISSIONS.PRODUCT_DELETE, isAdmin);
  const canBulk =
    isAdmin ||
    checkPermission(allPermissions, PERMISSIONS.PRODUCT_BULK, isAdmin);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    canViewProducts,
    canCreate,
    canEdit,
    canDelete,
    canBulk,
  };
}
