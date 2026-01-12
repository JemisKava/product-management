"use client";

import { useRef, useState, useCallback } from "react";
import type { PermissionCode } from "@/lib/permissions";

/**
 * Hook to manage draft permissions state that persists across page changes, filters, and searches.
 * Uses a ref to cache the draft permissions so they don't get lost when the component re-renders.
 */
export function usePermissionsDraft() {
  // Use ref to persist draft permissions across re-renders (source of truth)
  const draftPermissionsRef = useRef<Map<number, Set<PermissionCode>>>(new Map());
  
  // State to trigger re-renders - initialize from ref
  const [draftPermissions, setDraftPermissionsState] = useState<
    Map<number, Set<PermissionCode>>
  >(() => new Map(draftPermissionsRef.current));

  // Update function that modifies both ref and state
  const setDraftPermissions = useCallback(
    (
      updater:
        | Map<number, Set<PermissionCode>>
        | ((
            prev: Map<number, Set<PermissionCode>>
          ) => Map<number, Set<PermissionCode>>)
    ) => {
      // Read from ref to get current state
      const current = draftPermissionsRef.current;
      const next =
        typeof updater === "function"
          ? updater(current)
          : updater;

      // Update ref (source of truth) - create new map instance
      const newMap = new Map(next);
      draftPermissionsRef.current = newMap;
      // Update state to trigger re-render
      setDraftPermissionsState(newMap);
    },
    []
  );

  // Clear all draft permissions
  const clearDraftPermissions = useCallback(() => {
    const newMap = new Map();
    draftPermissionsRef.current = newMap;
    setDraftPermissionsState(newMap);
  }, []);

  return {
    draftPermissions,
    setDraftPermissions,
    clearDraftPermissions,
  };
}
