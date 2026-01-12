import { ALL_PERMISSION_CODES, type PermissionCode } from "@/lib/permissions";

export type EmployeeRow = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  permissions: string[];
};

export type EmployeeMeta = {
  name: string;
  email: string;
};

export type PermissionActionTone = "view" | "create" | "edit" | "delete" | "bulk";

export const PERMISSION_PREVIEW_META: Record<
  PermissionCode,
  { resource: string; action: string; tone: PermissionActionTone }
> = {
  PRODUCT_VIEW: { resource: "Products", action: "View", tone: "view" },
  PRODUCT_CREATE: { resource: "Products", action: "Create", tone: "create" },
  PRODUCT_EDIT: { resource: "Products", action: "Edit", tone: "edit" },
  PRODUCT_DELETE: { resource: "Products", action: "Delete", tone: "delete" },
  PRODUCT_BULK: { resource: "Products", action: "Bulk", tone: "bulk" },
};

export const arePermissionSetsEqual = (
  left: Set<PermissionCode>,
  right: Set<PermissionCode>
): boolean => {
  if (left.size !== right.size) return false;
  for (const value of left) {
    if (!right.has(value)) return false;
  }
  return true;
};

export const normalizePermissions = (
  permissions: string[]
): PermissionCode[] =>
  permissions.filter((permission): permission is PermissionCode =>
    ALL_PERMISSION_CODES.includes(permission as PermissionCode)
  );

export const getPreviewResources = (
  items: Array<{
    added: PermissionCode[];
    removed: PermissionCode[];
  }>
): string[] => {
  const resources = new Set<string>();
  items.forEach((item) => {
    item.added.forEach((permission) => {
      resources.add(PERMISSION_PREVIEW_META[permission].resource);
    });
    item.removed.forEach((permission) => {
      resources.add(PERMISSION_PREVIEW_META[permission].resource);
    });
  });
  return Array.from(resources);
};
