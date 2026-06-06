export type ID = string;

export type Timestamp = number;

export type Status = "active" | "inactive" | "pending" | "archived";

export type SortDirection = "asc" | "desc";

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  city?: string;
  region?: string;
  country?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type Theme = "dark" | "light";
export type Language = "en" | "bn";
export type Currency = "BDT" | "USD" | "EUR";