"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ProductFilterStatus } from "@/components/products/product-filters";

interface UseProductsFiltersProps {
  searchQuery: string;
  priceMin: number | null;
  priceMax: number | null;
  stockMin: number | null;
  stockMax: number | null;
  statusValues: string[];
  setSearchQuery: (value: string | null) => void;
  setPriceMin: (value: number | null) => void;
  setPriceMax: (value: number | null) => void;
  setStockMin: (value: number | null) => void;
  setStockMax: (value: number | null) => void;
  setPage: (value: number) => void;
}

export function useProductsFilters({
  searchQuery,
  priceMin,
  priceMax,
  stockMin,
  stockMax,
  statusValues,
  setSearchQuery,
  setPriceMin,
  setPriceMax,
  setStockMin,
  setStockMax,
  setPage,
}: UseProductsFiltersProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [priceMinInput, setPriceMinInput] = useState<number | null>(
    priceMin ?? null
  );
  const [priceMaxInput, setPriceMaxInput] = useState<number | null>(
    priceMax ?? null
  );
  const [stockMinInput, setStockMinInput] = useState<number | null>(
    stockMin ?? null
  );
  const [stockMaxInput, setStockMaxInput] = useState<number | null>(
    stockMax ?? null
  );

  // Sync inputs with URL params
  useEffect(() => {
    if (!searchInputRef.current?.matches(":focus")) {
      setSearchInput(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    setPriceMinInput(priceMin ?? null);
  }, [priceMin]);

  useEffect(() => {
    setPriceMaxInput(priceMax ?? null);
  }, [priceMax]);

  useEffect(() => {
    setStockMinInput(stockMin ?? null);
  }, [stockMin]);

  useEffect(() => {
    setStockMaxInput(stockMax ?? null);
  }, [stockMax]);

  // Debounced search input updates
  useEffect(() => {
    const handle = setTimeout(() => {
      const nextValue = searchInput.trim();
      if (nextValue === searchQuery) {
        return;
      }
      setSearchQuery(nextValue.length > 0 ? nextValue : null);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput, searchQuery, setSearchQuery, setPage]);

  useEffect(() => {
    if (priceMinInput === (priceMin ?? null)) return;
    const handle = setTimeout(() => {
      setPriceMin(priceMinInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [priceMin, priceMinInput, setPage, setPriceMin]);

  useEffect(() => {
    if (priceMaxInput === (priceMax ?? null)) return;
    const handle = setTimeout(() => {
      setPriceMax(priceMaxInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [priceMax, priceMaxInput, setPage, setPriceMax]);

  useEffect(() => {
    if (stockMinInput === (stockMin ?? null)) return;
    const handle = setTimeout(() => {
      setStockMin(stockMinInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [setPage, setStockMin, stockMin, stockMinInput]);

  useEffect(() => {
    if (stockMaxInput === (stockMax ?? null)) return;
    const handle = setTimeout(() => {
      setStockMax(stockMaxInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [setPage, setStockMax, stockMax, stockMaxInput]);

  const statuses = useMemo<ProductFilterStatus[]>(
    () =>
      statusValues.filter(
        (status): status is ProductFilterStatus =>
          status === "STOCK_IN" || status === "STOCK_OUT"
      ),
    [statusValues]
  );

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchQuery(null);
    setPriceMinInput(null);
    setPriceMaxInput(null);
    setStockMinInput(null);
    setStockMaxInput(null);
    setPriceMin(null);
    setPriceMax(null);
    setStockMin(null);
    setStockMax(null);
    setPage(1);
  };

  return {
    searchInput,
    setSearchInput,
    priceMinInput,
    setPriceMinInput,
    priceMaxInput,
    setPriceMaxInput,
    stockMinInput,
    setStockMinInput,
    stockMaxInput,
    setStockMaxInput,
    searchInputRef,
    statuses,
    handleClearFilters,
  };
}
