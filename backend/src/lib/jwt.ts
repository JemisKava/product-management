/**
 * JWT Utilities
 *
 * Handles JWT token generation and verification.
 * - Access Token: Short-lived (15m), contains user data
 * - Refresh Token: Long-lived (7d), contains only user ID
 */

import jwt from "jsonwebtoken";
import { env } from "../config/env.ts";

// ============================================
// TYPES
// ============================================

export interface AccessTokenPayload {
  userId: number;
  email: string;
  name: string;
  role: "ADMIN" | "EMPLOYEE";
  permissions: string[];
}

export interface RefreshTokenPayload {
  userId: number;
  tokenVersion?: number; // For token rotation
}

export interface DecodedAccessToken extends AccessTokenPayload {
  iat: number;
  exp: number;
}

export interface DecodedRefreshToken extends RefreshTokenPayload {
  iat: number;
  exp: number;
}

// ============================================
// ACCESS TOKEN
// ============================================

/**
 * Generate an access token (short-lived)
 * Contains user info for quick authorization without DB lookup
 */
export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  } as jwt.SignOptions);
}

/**
 * Verify and decode an access token
 * @throws JsonWebTokenError if token is invalid
 * @throws TokenExpiredError if token is expired
 */
export function verifyAccessToken(token: string): DecodedAccessToken {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as DecodedAccessToken;
}

/**
 * Decode access token without verification (for debugging)
 */
export function decodeAccessToken(token: string): DecodedAccessToken | null {
  return jwt.decode(token) as DecodedAccessToken | null;
}

// ============================================
// REFRESH TOKEN
// ============================================

/**
 * Generate a refresh token (long-lived)
 * Only contains user ID - actual validation done against database
 */
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
  } as jwt.SignOptions);
}

/**
 * Verify and decode a refresh token
 * @throws JsonWebTokenError if token is invalid
 * @throws TokenExpiredError if token is expired
 */
export function verifyRefreshToken(token: string): DecodedRefreshToken {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as DecodedRefreshToken;
}

// ============================================
// HELPERS
// ============================================

/**
 * Parse expiry string (e.g., "15m", "7d") to milliseconds
 */
export function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid expiry format: ${expiry}`);
  }

  const value = parseInt(match[1]!, 10);
  const unit = match[2]!;

  const multipliers: Record<string, number> = {
    s: 1000, // seconds
    m: 60 * 1000, // minutes
    h: 60 * 60 * 1000, // hours
    d: 24 * 60 * 60 * 1000, // days
  };

  return value * (multipliers[unit] ?? 0);
}

/**
 * Get expiry date from duration string
 */
export function getExpiryDate(duration: string): Date {
  return new Date(Date.now() + parseExpiry(duration));
}

/**
 * Check if a token error is due to expiration
 */
export function isTokenExpiredError(error: unknown): boolean {
  return error instanceof jwt.TokenExpiredError;
}

/**
 * Check if a token error is due to invalid token
 */
export function isInvalidTokenError(error: unknown): boolean {
  return error instanceof jwt.JsonWebTokenError;
}
