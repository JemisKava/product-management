"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_PERMISSION_CODES, type PermissionCode } from "@/lib/permissions";

type EmployeeStatus = "active" | "inactive";

interface UsePermissionsFiltersProps {
  searchParam: string;
  statusParam: string;
  permissionsParam: string;
  nameParam: string;
  emailParam: string;
  permissionsFilterParam: string;
  setSearchParam: (value: string | null) => void;
  setNameParam: (value: string | null) => void;
  setEmailParam: (value: string | null) => void;
  setStatusParam: (value: string | null) => void;
  setPermissionsParam: (value: string | null) => void;
  setPermissionsFilterParam: (value: string | null) => void;
  setPage: (value: number) => void;
}

export function usePermissionsFilters({
  searchParam,
  statusParam,
  permissionsParam,
  nameParam,
  emailParam,
  permissionsFilterParam,
  setSearchParam,
  setNameParam,
  setEmailParam,
  setStatusParam,
  setPermissionsParam,
  setPermissionsFilterParam,
  setPage,
}: UsePermissionsFiltersProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState(searchParam);
  const [nameInput, setNameInput] = useState(nameParam);
  const [emailInput, setEmailInput] = useState(emailParam);

  // Sync inputs with URL params when not focused
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

  // Debounced search input updates
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

  // Parse filter values from URL params
  const statuses = useMemo(() => {
    if (!statusParam) return [];
    return statusParam
      .split(",")
      .map((status) => status.trim())
      .filter(
        (status): status is EmployeeStatus =>
          status === "active" || status === "inactive"
      );
  }, [statusParam]);

  const permissionCodes = useMemo(() => {
    if (!permissionsParam) return [];
    return permissionsParam
      .split(",")
      .map((code) => code.trim())
      .filter((code): code is PermissionCode =>
        ALL_PERMISSION_CODES.includes(code as PermissionCode)
      );
  }, [permissionsParam]);

  const permissionsFilterCodes = useMemo(() => {
    if (!permissionsFilterParam) return [];
    return permissionsFilterParam
      .split(",")
      .map((code) => code.trim())
      .filter((code): code is PermissionCode =>
        ALL_PERMISSION_CODES.includes(code as PermissionCode)
      );
  }, [permissionsFilterParam]);

  const isActiveFilter = useMemo(() => {
    const hasActive = statuses.includes("active");
    const hasInactive = statuses.includes("inactive");
    if (hasActive && !hasInactive) return true;
    if (!hasActive && hasInactive) return false;
    return undefined;
  }, [statuses]);

  // Filter handlers
  const handleNameSearchChange = (value: string) => {
    setNameInput(value);
  };

  const handleEmailSearchChange = (value: string) => {
    setEmailInput(value);
  };

  const handlePermissionsFilterChange = (codes: PermissionCode[]) => {
    setPermissionsFilterParam(codes.length > 0 ? codes.join(",") : null);
    setPage(1);
  };

  const handleClearTableFilters = () => {
    setNameInput("");
    setNameParam(null);
    setEmailInput("");
    setEmailParam(null);
    setPermissionsFilterParam(null);
    setPage(1);
  };

  const handleStatusToggle = (status: EmployeeStatus) => {
    const nextStatuses = statuses.includes(status)
      ? statuses.filter((item) => item !== status)
      : [...statuses, status];
    setStatusParam(nextStatuses.length > 0 ? nextStatuses.join(",") : null);
    setPage(1);
  };

  const handlePermissionToggle = (permission: PermissionCode) => {
    const nextPermissions = permissionCodes.includes(permission)
      ? permissionCodes.filter((item) => item !== permission)
      : [...permissionCodes, permission];
    setPermissionsParam(
      nextPermissions.length > 0 ? nextPermissions.join(",") : null
    );
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchParam(null);
    setStatusParam(null);
    setPermissionsParam(null);
    setPage(1);
  };

  return {
    searchInput,
    setSearchInput,
    nameInput,
    emailInput,
    searchInputRef,
    statuses,
    permissionCodes,
    permissionsFilterCodes,
    isActiveFilter,
    handleNameSearchChange,
    handleEmailSearchChange,
    handlePermissionsFilterChange,
    handleClearTableFilters,
    handleStatusToggle,
    handlePermissionToggle,
    handleClearFilters,
  };
}
