export interface ProductFilter {
  name?: string;
  categoryIds?: number[];
  statuses?: ('STOCK_IN' | 'STOCK_OUT')[];
  priceMin?: number;
  priceMax?: number;
  stockMin?: number;
  stockMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
}
