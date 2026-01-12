"use client";

import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

export function usePermissionsQueryState() {
  const [searchParam, setSearchParam] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );
  const [statusParam, setStatusParam] = useQueryState(
    "status",
    parseAsString.withDefault("")
  );
  const [permissionsParam, setPermissionsParam] = useQueryState(
    "permissions",
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
  const [permissionsFilterParam, setPermissionsFilterParam] = useQueryState(
    "permissionsFilter",
    parseAsString.withDefault("")
  );

  return {
    searchParam,
    setSearchParam,
    statusParam,
    setStatusParam,
    permissionsParam,
    setPermissionsParam,
    page,
    setPage,
    pageSize,
    setPageSize,
    nameParam,
    setNameParam,
    emailParam,
    setEmailParam,
    permissionsFilterParam,
    setPermissionsFilterParam,
  };
}
