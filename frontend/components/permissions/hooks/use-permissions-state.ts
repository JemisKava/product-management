"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  arePermissionSetsEqual,
  normalizePermissions,
  type EmployeeRow,
  type EmployeeMeta,
} from "../permissions-utils";
import type { PermissionCode } from "@/lib/permissions";

export function usePermissionsState(data: EmployeeRow[]) {
  const basePermissionsByUserRef = useRef<Map<number, Set<PermissionCode>>>(
    new Map()
  );
  const userMetaByIdRef = useRef<Map<number, EmployeeMeta>>(new Map());

  // Cache base permissions across pagination/search so unsaved changes persist
  const basePermissionsByUser = useMemo(() => {
    if (data.length === 0) return basePermissionsByUserRef.current;
    const merged = new Map(basePermissionsByUserRef.current);
    let changed = false;

    data.forEach((user) => {
      if (user.role !== "EMPLOYEE") return;
      const nextSet = new Set(normalizePermissions(user.permissions));
      const existing = merged.get(user.id);
      if (!existing || !arePermissionSetsEqual(existing, nextSet)) {
        merged.set(user.id, nextSet);
        changed = true;
      }
    });

    return changed ? merged : basePermissionsByUserRef.current;
  }, [data]);

  useEffect(() => {
    if (basePermissionsByUserRef.current !== basePermissionsByUser) {
      basePermissionsByUserRef.current = basePermissionsByUser;
    }
  }, [basePermissionsByUser]);

  const userMetaById = useMemo(() => {
    if (data.length === 0) return userMetaByIdRef.current;
    const merged = new Map(userMetaByIdRef.current);
    let changed = false;

    data.forEach((user) => {
      if (user.role !== "EMPLOYEE") return;
      const existing = merged.get(user.id);
      if (
        !existing ||
        existing.name !== user.name ||
        existing.email !== user.email
      ) {
        merged.set(user.id, { name: user.name, email: user.email });
        changed = true;
      }
    });

    return changed ? merged : userMetaByIdRef.current;
  }, [data]);

  useEffect(() => {
    if (userMetaByIdRef.current !== userMetaById) {
      userMetaByIdRef.current = userMetaById;
    }
  }, [userMetaById]);

  return {
    basePermissionsByUser,
    userMetaById,
  };
}
