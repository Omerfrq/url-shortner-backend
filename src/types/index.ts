// Custom type definitions for the application

export interface ShortUrlResponse {
  id: string;
  shortcode: string;
  originalUrl: string;
  shortUrl: string;
  clicks?: number;
  deviceId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginationResponse {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: any[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination?: PaginationResponse;
  message?: string;
}