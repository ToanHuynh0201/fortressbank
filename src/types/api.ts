/**
 * Standardized API response types
 */

// Base response structure
export interface BaseResponse<T = any> {
  code: number;
  message?: string;
  data?: T;
}

// Success response
export interface SuccessResponse<T = any> extends BaseResponse<T> {
  success: true;
  data: T;
  pagination?: PaginationInfo;
}

// Error response
export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  status?: number;
  details?: Record<string, any>;
}

// Pagination info
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Union type for all responses
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// Type guard to check if response is successful
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is SuccessResponse<T> {
  return response.success === true;
}

// Type guard to check if response is an error
export function isErrorResponse(
  response: ApiResponse<any>
): response is ErrorResponse {
  return response.success === false;
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error categories for better handling
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

// Enhanced error info
export interface ErrorInfo {
  message: string;
  code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  recoverable: boolean;
  retryable: boolean;
  userMessage: string;
  technicalMessage?: string;
  timestamp: string;
  context?: Record<string, any>;
}
