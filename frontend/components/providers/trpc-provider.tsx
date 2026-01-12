/**
 * tRPC Provider Component
 *
 * Wraps the app with tRPC and React Query providers.
 * Handles token refresh automatically on 401 errors.
 *
 * Token Refresh Strategy:
 * 1. Check memory first - if access token exists and not expired, use it
 * 2. If expired or 401 error, use refresh_token HttpOnly cookie to get new access token
 * 3. Update memory with new access token
 * 4. Retry original request with new token
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { useAuthStore } from "@/store/authStore";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Browser should use relative URL or full URL if different origin
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  }
  // Server-side
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 5000}`;
};

// Global state for token refresh (prevents multiple simultaneous refresh calls)
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Refresh access token using refresh token HttpOnly cookie
 * Uses fetch directly to call tRPC endpoint
 * The refresh_token cookie is sent automatically via credentials: "include"
 */
async function refreshAccessToken(): Promise<string | null> {
  // If already refreshing, return the existing promise (prevents duplicate refresh calls)
  if (refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const baseUrl = getBaseUrl();
      // Call tRPC refresh endpoint using fetch directly
      // HttpOnly refresh_token cookie is sent automatically via credentials: "include"
      // tRPC v11 uses batch format even for single requests
      const response = await fetch(`${baseUrl}/trpc/auth.refresh`, {
        method: "POST",
        credentials: "include", // Critical: Include HttpOnly refresh_token cookie
        headers: {
          "Content-Type": "application/json",
        },
        // tRPC v11 batch request format (array format required)
        body: JSON.stringify([
          {
            method: "mutation",
            params: {
              path: "auth.refresh",
              inputs: {}, // Empty input for refresh mutation
            },
          },
        ]),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Refresh failed: ${response.status} - ${errorText}`);
      }

      // Parse tRPC batch response format
      const data = await response.json();

      // tRPC batch responses are arrays with one element per request
      const result = Array.isArray(data) ? data[0] : data;

      // Check for errors in tRPC response
      if (result.error) {
        const errorMessage =
          result.error.message ||
          result.error.data?.message ||
          "Refresh failed";
        throw new Error(errorMessage);
      }

      // Extract data from tRPC response structure: { result: { data: { accessToken, user, permissions } } }
      const resultData = result.result?.data;
      const accessToken = resultData?.accessToken;

      if (!accessToken) {
        throw new Error("No access token in refresh response");
      }

      // Update auth store with new access token (stored in memory only, not persisted)
      useAuthStore.getState().setAccessToken(accessToken);

      // Also update user and permissions if provided (for consistency)
      const user = resultData?.user;
      const permissions = resultData?.permissions;
      if (user && permissions) {
        useAuthStore.getState().setAuth(user, permissions, accessToken);
      }

      return accessToken;
    } catch (error) {
      // Only log unexpected errors (not "token not found" which is expected on first load)
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const isExpectedError =
        errorMessage.includes("Refresh token not found") ||
        errorMessage.includes("Invalid refresh token") ||
        errorMessage.includes("UNAUTHORIZED");

      if (!isExpectedError) {
        console.error("Token refresh failed:", error);
      }

      // Refresh failed - clear auth state and logout user
      useAuthStore.getState().logout();
      return null;
    } finally {
      refreshPromise = null;
      isRefreshing = false;
    }
  })();

  return refreshPromise;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000, // 5 seconds
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/trpc`,
          // Custom fetch that handles token refresh automatically
          async fetch(url, options) {
            const authStore = useAuthStore.getState();
            let accessToken = authStore.accessToken;

            // Strategy 1: Check memory first - if token exists and not expired, use it
            // Strategy 2: If no token OR expired, try refreshing using refresh_token HttpOnly cookie
            const needsRefresh =
              !accessToken || (accessToken && authStore.isAccessTokenExpired());

            if (needsRefresh) {
              // No token or token expired - try to refresh using refresh_token cookie
              // This works on initial page load if user has a valid refresh_token cookie
              const newToken = await refreshAccessToken();
              if (newToken) {
                accessToken = newToken;
              }
              // If refresh failed (no refresh_token cookie or expired), continue without token
              // The request will likely return 401, which we handle below
            }

            // Build headers with access token (if available)
            const headers = new Headers(options?.headers);

            if (accessToken) {
              headers.set("authorization", `Bearer ${accessToken}`);
            }

            // Make the request with access token in header and cookies (refresh_token)
            let response = await fetch(url, {
              ...options,
              headers,
              credentials: "include", // Critical: Include HttpOnly refresh_token cookie
            });

            // Strategy 3: If 401 error and we haven't already tried refreshing, try refreshing and retry
            // This handles cases where the token expired mid-request or was invalid
            if (response.status === 401 && !isRefreshing) {
              isRefreshing = true;
              try {
                const newToken = await refreshAccessToken();

                if (newToken) {
                  // Retry the original request with new token
                  headers.set("authorization", `Bearer ${newToken}`);
                  response = await fetch(url, {
                    ...options,
                    headers,
                    credentials: "include", // Include refresh_token cookie for retry
                  });
                }
                // If refresh failed (no valid refresh_token cookie), return original 401 response
                // AuthProvider will handle logout on 401
              } catch (refreshError) {
                console.error(
                  "Token refresh error during retry:",
                  refreshError
                );
                // Return original 401 response
              } finally {
                isRefreshing = false;
              }
            }

            return response;
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
