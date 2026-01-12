"use client";

import {
  parseAsArrayOf,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";

export function useProductsQueryState() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10)
  );
  const [searchQuery, setSearchQuery] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );
  const [categoryIds, setCategoryIds] = useQueryState(
    "categories",
    parseAsArrayOf(parseAsInteger).withDefault([])
  );
  const [statusValues, setStatusValues] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [priceMin, setPriceMin] = useQueryState("priceMin", parseAsFloat);
  const [priceMax, setPriceMax] = useQueryState("priceMax", parseAsFloat);
  const [stockMin, setStockMin] = useQueryState("stockMin", parseAsInteger);
  const [stockMax, setStockMax] = useQueryState("stockMax", parseAsInteger);
  const [modalState, setModalState] = useQueryState("modal", parseAsString);
  const [modalProductId, setModalProductId] = useQueryState(
    "productId",
    parseAsInteger
  );

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    categoryIds,
    setCategoryIds,
    statusValues,
    setStatusValues,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    stockMin,
    setStockMin,
    stockMax,
    setStockMax,
    modalState,
    setModalState,
    modalProductId,
    setModalProductId,
  };
}
