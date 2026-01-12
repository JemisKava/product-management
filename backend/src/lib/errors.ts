/**
 * Custom Error Classes
 *
 * Standardized error handling across the application.
 * All errors extend AppError for consistent error responses.
 */

// ============================================
// ERROR CODES
// ============================================

export const ErrorCode = {
  // Authentication
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_TOKEN: "INVALID_TOKEN",

  // Authorization
  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",

  // Resources
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",

  // Server
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

// ============================================
// BASE ERROR CLASS
// ============================================

export class AppError extends Error {
  public readonly code: ErrorCodeType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    code: ErrorCodeType,
    statusCode: number = 500,
    details?: unknown
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true; // Operational errors are expected and handled
    this.details = details;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    const errorObj: {
      code: string;
      message: string;
      details?: unknown;
    } = {
      code: this.code,
      message: this.message,
    };

    if (this.details !== undefined && this.details !== null) {
      errorObj.details = this.details;
    }

    return {
      success: false,
      error: errorObj,
    };
  }
}

// ============================================
// SPECIFIC ERROR CLASSES
// ============================================

// Authentication Errors (401)
export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, ErrorCode.UNAUTHORIZED, 401);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message = "Invalid email or password") {
    super(message, ErrorCode.INVALID_CREDENTIALS, 401);
  }
}

export class TokenExpiredError extends AppError {
  constructor(message = "Token has expired") {
    super(message, ErrorCode.TOKEN_EXPIRED, 401);
  }
}

export class InvalidTokenError extends AppError {
  constructor(message = "Invalid token") {
    super(message, ErrorCode.INVALID_TOKEN, 401);
  }
}

// Authorization Errors (403)
export class ForbiddenError extends AppError {
  constructor(message = "You don't have permission to perform this action") {
    super(message, ErrorCode.FORBIDDEN, 403);
  }
}

export class InsufficientPermissionsError extends AppError {
  constructor(permission?: string) {
    const message = permission
      ? `Missing required permission: ${permission}`
      : "Insufficient permissions";
    super(message, ErrorCode.INSUFFICIENT_PERMISSIONS, 403);
  }
}

// Validation Errors (400)
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, details);
  }
}

export class InvalidInputError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.INVALID_INPUT, 400, details);
  }
}

// Resource Errors (404, 409)
export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, ErrorCode.NOT_FOUND, 404);
  }
}

export class AlreadyExistsError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} already exists`, ErrorCode.ALREADY_EXISTS, 409);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.CONFLICT, 409);
  }
}

// Server Errors (500, 503)
export class InternalError extends AppError {
  constructor(message = "Internal server error") {
    super(message, ErrorCode.INTERNAL_ERROR, 500);
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed") {
    super(message, ErrorCode.DATABASE_ERROR, 500);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service temporarily unavailable") {
    super(message, ErrorCode.SERVICE_UNAVAILABLE, 503);
  }
}

// ============================================
// ERROR HELPERS
// ============================================

/**
 * Check if an error is an operational AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Wrap unknown errors in AppError
 */
export function wrapError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalError(error.message);
  }

  return new InternalError("An unexpected error occurred");
}
