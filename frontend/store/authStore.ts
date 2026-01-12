/**
 * Auth Store (Zustand)
 *
 * Manages authentication state in the frontend.
 * Stores user info, permissions, and access token in memory (not persisted).
 * Access token is stored in memory only for security.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: number;
  email: string;
  name: string;
  role: "ADMIN" | "EMPLOYEE";
}

interface AuthState {
  user: User | null;
  permissions: string[];
  accessToken: string | null;
  accessTokenExpiry: number | null; // Timestamp when token expires
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, permissions: string[], accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasPermission: (code: string) => boolean;
  isAccessTokenExpired: () => boolean;
  getUserRoleFromToken: () => "ADMIN" | "EMPLOYEE" | null;
  getPermissionsFromToken: () => string[];
}

/**
 * Decode JWT token to get expiry timestamp
 */
function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]!));
    return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  } catch {
    return null;
  }
}

/**
 * Decode JWT token payload (without verification - for client-side checks only)
 * Used to validate localStorage against JWT token and extract permissions
 */
function decodeTokenPayload(token: string): {
  userId?: number;
  email?: string;
  name?: string;
  role?: "ADMIN" | "EMPLOYEE";
  permissions?: string[];
} | null {
  try {
    console.log(
      "[decodeTokenPayload] Decoding token...",
      token.substring(0, 50) + "..."
    );
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error(
        "[decodeTokenPayload] Invalid token format - expected 3 parts, got",
        parts.length
      );
      return null;
    }
    const base64Payload = parts[1]!;
    const decoded = atob(base64Payload);
    console.log("[decodeTokenPayload] Decoded base64:", decoded);
    const payload = JSON.parse(decoded);
    console.log("[decodeTokenPayload] Parsed payload:", payload);
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      permissions: payload.permissions || [],
    };
  } catch (error) {
    console.error("[decodeTokenPayload] Error decoding token:", error);
    return null;
  }
}

/**
 * Validate user state against JWT token payload
 * Detects localStorage tampering by comparing persisted user data with JWT token
 */
function validateUserAgainstToken(
  user: User | null,
  accessToken: string | null
): { isValid: boolean; correctedUser?: User } {
  console.log("[validateUserAgainstToken] Validating user against token...", {
    hasUser: !!user,
    hasToken: !!accessToken,
  });

  if (!user || !accessToken) {
    console.log(
      "[validateUserAgainstToken] Missing user or token, skipping validation"
    );
    return { isValid: true }; // Can't validate if no user or token
  }

  const tokenPayload = decodeTokenPayload(accessToken);
  console.log(
    "[validateUserAgainstToken] Token payload decoded:",
    tokenPayload
  );
  if (!tokenPayload) {
    console.warn("[validateUserAgainstToken] Failed to decode token payload");
    return { isValid: false }; // Invalid token
  }

  // Check if localStorage user matches JWT token payload
  if (
    user.id !== tokenPayload.userId ||
    user.email !== tokenPayload.email ||
    user.name !== tokenPayload.name ||
    user.role !== tokenPayload.role
  ) {
    // localStorage was tampered with! Use token payload instead
    console.warn(
      "⚠️ localStorage user data doesn't match JWT token! Using token data."
    );
    return {
      isValid: false,
      correctedUser: {
        id: tokenPayload.userId!,
        email: tokenPayload.email!,
        name: tokenPayload.name!,
        role: tokenPayload.role!,
      },
    };
  }

  return { isValid: true };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      accessToken: null,
      accessTokenExpiry: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, permissions, accessToken) => {
        console.log("[setAuth] Called with:", {
          user: user?.email,
          role: user?.role,
          tokenLength: accessToken?.length,
        });

        // accessToken is always provided (from login or refresh)
        // It's stored in memory only for security

        // Security: Validate user data against JWT token payload
        // This detects localStorage tampering (e.g., someone changing role to ADMIN)
        const validation = validateUserAgainstToken(user, accessToken);
        console.log("[setAuth] Validation result:", validation);
        if (!validation.isValid && validation.correctedUser) {
          // localStorage was tampered with! Use corrected user from JWT token
          console.warn(
            "⚠️ Detected localStorage tampering! Using user data from JWT token."
          );
          user = validation.correctedUser;
        }

        const expiry = getTokenExpiry(accessToken);
        set({
          user,
          permissions,
          accessToken,
          accessTokenExpiry: expiry,
          isAuthenticated: true,
          isLoading: false,
        });
        console.log("[setAuth] Auth state updated");
      },

      setAccessToken: (accessToken: string) => {
        const expiry = getTokenExpiry(accessToken);
        set({
          accessToken,
          accessTokenExpiry: expiry,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          permissions: [],
          accessToken: null,
          accessTokenExpiry: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      hasPermission: (code: string) => {
        const state = get();

        // SECURITY: Always check permissions from JWT token (source of truth)
        // This prevents localStorage tampering from granting unauthorized permissions
        if (state.accessToken) {
          const tokenPayload = decodeTokenPayload(state.accessToken);
          if (tokenPayload) {
            // Admin has all permissions
            if (tokenPayload.role === "ADMIN") return true;
            // Check permissions from JWT token
            return tokenPayload.permissions?.includes(code) || false;
          }
        }

        // Fallback to localStorage (only if no token available)
        if (state.user?.role === "ADMIN") return true;
        return state.permissions.includes(code);
      },

      isAccessTokenExpired: () => {
        const state = get();
        if (!state.accessToken || !state.accessTokenExpiry) return true;
        // Add 5 second buffer to refresh before actual expiry
        return Date.now() >= state.accessTokenExpiry - 5000;
      },

      getUserRoleFromToken: () => {
        const state = get();
        if (!state.accessToken) return null;

        const tokenPayload = decodeTokenPayload(state.accessToken);
        return tokenPayload?.role || null;
      },

      getPermissionsFromToken: () => {
        const state = get();
        if (!state.accessToken) return [];

        const tokenPayload = decodeTokenPayload(state.accessToken);
        return tokenPayload?.permissions || [];
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist user and permissions, NOT access token (security - stored in memory only)
      partialize: (state) => ({
        user: state.user,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
        // accessToken and accessTokenExpiry are NOT persisted (memory only)
      }),
    }
  )
);
