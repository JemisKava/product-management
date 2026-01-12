"use client";

import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

export function useUsersQueryState() {
  const [searchParam, setSearchParam] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );
  const [rolesParam, setRolesParam] = useQueryState(
    "roles",
    parseAsString.withDefault("")
  );
  const [statusParam, setStatusParam] = useQueryState(
    "status",
    parseAsString.withDefault("")
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10)
  );
  const [nameParam, setNameParam] = useQueryState(
    "name",
    parseAsString.withDefault("")
  );
  const [emailParam, setEmailParam] = useQueryState(
    "email",
    parseAsString.withDefault("")
  );
  const [statusFilterParam, setStatusFilterParam] = useQueryState(
    "statusFilter",
    parseAsString.withDefault("all")
  );
  const [permissionCodesParam, setPermissionCodesParam] = useQueryState(
    "permissions",
    parseAsString.withDefault("")
  );
  const [viewUserId, setViewUserId] = useQueryState("view", parseAsInteger);

  return {
    searchParam,
    setSearchParam,
    rolesParam,
    setRolesParam,
    statusParam,
    setStatusParam,
    page,
    setPage,
    pageSize,
    setPageSize,
    nameParam,
    setNameParam,
    emailParam,
    setEmailParam,
    statusFilterParam,
    setStatusFilterParam,
    permissionCodesParam,
    setPermissionCodesParam,
    viewUserId,
    setViewUserId,
  };
}
