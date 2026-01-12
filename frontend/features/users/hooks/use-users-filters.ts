"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UserRole, UserStatus } from "@/components/users/users-table";

interface UseUsersFiltersProps {
  searchParam: string;
  rolesParam: string;
  statusParam: string;
  nameParam: string;
  emailParam: string;
  statusFilterParam: string;
  permissionCodesParam: string;
  setSearchParam: (value: string | null) => void;
  setNameParam: (value: string | null) => void;
  setEmailParam: (value: string | null) => void;
  setStatusFilterParam: (value: string) => void;
  setPermissionCodesParam: (value: string | null) => void;
  setPage: (value: number) => void;
}

export function useUsersFilters({
  searchParam,
  rolesParam,
  statusParam,
  nameParam,
  emailParam,
  statusFilterParam,
  permissionCodesParam,
  setSearchParam,
  setNameParam,
  setEmailParam,
  setStatusFilterParam,
  setPermissionCodesParam,
  setPage,
}: UseUsersFiltersProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState(searchParam);
  const [nameInput, setNameInput] = useState(nameParam);
  const [emailInput, setEmailInput] = useState(emailParam);

  useEffect(() => {
    if (!searchInputRef.current?.matches(":focus")) {
      setSearchInput(searchParam);
    }
  }, [searchParam]);

  useEffect(() => {
    setNameInput(nameParam);
  }, [nameParam]);

  useEffect(() => {
    setEmailInput(emailParam);
  }, [emailParam]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const nextValue = searchInput.trim();
      if (nextValue === searchParam) {
        return;
      }
      setSearchParam(nextValue.length > 0 ? nextValue : null);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput, searchParam, setSearchParam, setPage]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const nextValue = nameInput.trim();
      if (nextValue === nameParam) {
        return;
      }
      setNameParam(nextValue.length > 0 ? nextValue : null);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [nameInput, nameParam, setNameParam, setPage]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const nextValue = emailInput.trim();
      if (nextValue === emailParam) {
        return;
      }
      setEmailParam(nextValue.length > 0 ? nextValue : null);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [emailInput, emailParam, setEmailParam, setPage]);

  const roles = useMemo(() => {
    if (!rolesParam) return [];
    return rolesParam
      .split(",")
      .map((role) => role.trim())
      .filter(
        (role): role is UserRole => role === "ADMIN" || role === "EMPLOYEE"
      );
  }, [rolesParam]);

  const statuses = useMemo(() => {
    if (!statusParam) return [];
    return statusParam
      .split(",")
      .map((status) => status.trim())
      .filter(
        (status): status is UserStatus =>
          status === "active" || status === "inactive"
      );
  }, [statusParam]);

  const permissionCodes = useMemo(() => {
    if (!permissionCodesParam) return [];
    return permissionCodesParam
      .split(",")
      .map((code) => code.trim())
      .filter((code) => code.length > 0);
  }, [permissionCodesParam]);

  const statusFilterValue = useMemo(() => {
    const normalized = statusFilterParam.toLowerCase();
    if (normalized === "active" || normalized === "inactive") {
      return normalized as "active" | "inactive";
    }
    return "all" as const;
  }, [statusFilterParam]);

  const isActiveFilter = useMemo(() => {
    const hasActive = statuses.includes("active");
    const hasInactive = statuses.includes("inactive");
    if (hasActive && !hasInactive) return true;
    if (!hasActive && hasInactive) return false;
    return undefined;
  }, [statuses]);

  const handleNameSearchChange = useCallback((value: string) => {
    setNameInput(value);
  }, []);

  const handleEmailSearchChange = useCallback((value: string) => {
    setEmailInput(value);
  }, []);

  const handleStatusFilterChange = useCallback((value: "all" | "active" | "inactive") => {
    setStatusFilterParam(value);
    setPage(1);
  }, [setStatusFilterParam, setPage]);

  const handlePermissionCodesChange = useCallback((codes: string[]) => {
    setPermissionCodesParam(codes.length > 0 ? codes.join(",") : null);
    setPage(1);
  }, [setPermissionCodesParam, setPage]);

  const handleClearTableFilters = useCallback(() => {
    setNameInput("");
    setNameParam(null);
    setEmailInput("");
    setEmailParam(null);
    setStatusFilterParam("all");
    setPermissionCodesParam(null);
    setPage(1);
  }, [setNameParam, setEmailParam, setStatusFilterParam, setPermissionCodesParam, setPage]);

  const handleRoleToggle = useCallback((role: UserRole) => {
    const nextRoles = roles.includes(role)
      ? roles.filter((item) => item !== role)
      : [...roles, role];
    // This will be handled by the parent component
    return nextRoles;
  }, [roles]);

  const handleStatusToggle = useCallback((status: UserStatus) => {
    const nextStatuses = statuses.includes(status)
      ? statuses.filter((item) => item !== status)
      : [...statuses, status];
    // This will be handled by the parent component
    return nextStatuses;
  }, [statuses]);

  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    setSearchParam(null);
    setPage(1);
  }, [setSearchParam, setPage]);

  return {
    searchInput,
    setSearchInput,
    searchInputRef,
    nameInput,
    emailInput,
    roles,
    statuses,
    permissionCodes,
    statusFilterValue,
    isActiveFilter,
    handleNameSearchChange,
    handleEmailSearchChange,
    handleStatusFilterChange,
    handlePermissionCodesChange,
    handleClearTableFilters,
    handleRoleToggle,
    handleStatusToggle,
    handleClearFilters,
  };
}
