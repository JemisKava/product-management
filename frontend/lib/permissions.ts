/**
 * Permission Utilities
 *
 * Constants and helper functions for permission management
 */

export const PERMISSIONS = {
  PRODUCT_VIEW: "PRODUCT_VIEW",
  PRODUCT_CREATE: "PRODUCT_CREATE",
  PRODUCT_EDIT: "PRODUCT_EDIT",
  PRODUCT_DELETE: "PRODUCT_DELETE",
  PRODUCT_BULK: "PRODUCT_BULK",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_LABELS: Record<PermissionCode, string> = {
  PRODUCT_VIEW: "View Products",
  PRODUCT_CREATE: "Create Products",
  PRODUCT_EDIT: "Edit Products",
  PRODUCT_DELETE: "Delete Products",
  PRODUCT_BULK: "Bulk Actions",
};

export const PERMISSION_DESCRIPTIONS: Record<PermissionCode, string> = {
  PRODUCT_VIEW: "Can view product list and details",
  PRODUCT_CREATE: "Can add new products",
  PRODUCT_EDIT: "Can modify existing products",
  PRODUCT_DELETE: "Can remove products",
  PRODUCT_BULK: "Can perform bulk delete and status updates",
};

export const ALL_PERMISSION_CODES = Object.values(PERMISSIONS);

/**
 * Check if user has a specific permission
 * @param userPermissions - Array of permission codes the user has
 * @param required - Permission code to check
 * @param isAdmin - Whether the user is an admin (admins have all permissions)
 * @returns true if user has the permission
 */
export function hasPermission(
  userPermissions: string[],
  required: PermissionCode,
  isAdmin: boolean = false
): boolean {
  if (isAdmin) return true;
  return userPermissions.includes(required);
}

/**
 * Get all permissions that a user has
 * @param userPermissions - Array of permission codes the user has
 * @param isAdmin - Whether the user is an admin
 * @returns Array of permission codes
 */
export function getUserPermissions(
  userPermissions: string[],
  isAdmin: boolean = false
): PermissionCode[] {
  if (isAdmin) return ALL_PERMISSION_CODES;
  return userPermissions.filter((p): p is PermissionCode =>
    ALL_PERMISSION_CODES.includes(p as PermissionCode)
  );
}
