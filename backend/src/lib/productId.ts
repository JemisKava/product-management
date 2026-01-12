/**
 * Product ID Generator
 *
 * Generates unique product IDs in the format: PRD001, PRD002, etc.
 * Auto-increments based on the last product in the database.
 */

import { prisma } from "../config/database.ts";

// Prefix for all product IDs
const PRODUCT_ID_PREFIX = "PRD";

// Minimum padding for the numeric part
const MIN_PADDING = 3;

/**
 * Generate the next product ID
 * Format: PRD001, PRD002, ..., PRD999, PRD1000
 *
 * @returns Next available product ID
 */
export async function generateProductId(): Promise<string> {
  // Get the last product ordered by id (auto-increment)
  const lastProduct = await prisma.product.findFirst({
    orderBy: { id: "desc" },
    select: { id: true, productId: true },
  });

  // Calculate next number
  const nextNum = lastProduct ? lastProduct.id + 1 : 1;

  // Determine padding (at least 3 digits, but can grow)
  const numStr = String(nextNum);
  const paddedNum = numStr.length < MIN_PADDING
    ? numStr.padStart(MIN_PADDING, "0")
    : numStr;

  return `${PRODUCT_ID_PREFIX}${paddedNum}`;
}

/**
 * Validate a product ID format
 * @param productId - Product ID to validate
 * @returns True if valid format
 */
export function isValidProductId(productId: string): boolean {
  // Match PRD followed by at least 3 digits
  return /^PRD\d{3,}$/.test(productId);
}

/**
 * Extract the numeric part from a product ID
 * @param productId - Product ID (e.g., "PRD001")
 * @returns Numeric value (e.g., 1)
 */
export function extractProductNumber(productId: string): number | null {
  const match = productId.match(/^PRD(\d+)$/);
  return match ? parseInt(match[1]!, 10) : null;
}
