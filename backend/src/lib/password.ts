/**
 * Password Utilities
 * Handles password hashing and verification using bcrypt.
 */

import bcrypt from "bcryptjs";

// Number of salt rounds for bcrypt
const SALT_ROUNDS = 12;

/**
 * Hash a plain text password
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password to check
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Check if a string is a valid bcrypt hash
 */
export function isValidHash(hash: string): boolean {
  // bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 characters
  return /^\$2[aby]\$\d{2}\$.{53}$/.test(hash);
}
