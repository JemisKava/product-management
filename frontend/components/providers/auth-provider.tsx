/**
 * Auth Provider Component
 *
 * Initializes authentication on app load by checking for existing JWT token.
 * If no access token in memory, the tRPC provider will attempt to refresh using refresh_token cookie.
 * Calls the /auth/me endpoint to get user info from JWT access token.
 */

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { trpc } from "@/lib/trpc/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, setLoading, logout } = useAuthStore();

  const { data, error, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }

    if (error) {
      // Check if it's an unauthorized error (expected when not logged in)
      const isUnauthorized =
        error.data?.code === "UNAUTHORIZED" ||
        error.message?.includes("UNAUTHORIZED");

      if (!isUnauthorized) {
        console.error("Auth error:", error);
      }

      // Not authenticated - clear state
      logout();
      setLoading(false);
      return;
    }

    // Authenticated - set user data
    if (data?.user && data?.permissions && data?.accessToken) {
      setAuth(data.user, data.permissions, data.accessToken);
      setLoading(false);
    } else {
      logout();
      setLoading(false);
    }
  }, [data, error, isLoading, setAuth, setLoading, logout]);

  return <>{children}</>;
}
