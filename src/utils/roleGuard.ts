import { UserRole, Permission } from "../types/auth.types";

export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  "/admin-platform": ["platform_admin"],
  "/dashboard": ["platform_admin", "owner", "manager", "staff"],
  "/crm": ["platform_admin", "owner", "manager", "staff"],
  "/analytics": ["platform_admin", "owner", "manager"],
  "/reports": ["platform_admin", "owner", "manager"],
  "/settings": ["platform_admin", "owner"],
  "/branches": ["platform_admin", "owner", "manager"],
  "/gis-map": ["platform_admin", "owner", "manager", "staff"],
  "/audit-log": ["platform_admin", "owner"],
};

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find((r) =>
    pathname.startsWith(r)
  );
  if (!matchedRoute) return true;
  return ROUTE_PERMISSIONS[matchedRoute].includes(role);
}

export function hasPermission(
  permissions: Permission[],
  required: Permission
): boolean {
  return permissions.includes(required);
}

export function hasAnyPermission(
  permissions: Permission[],
  required: Permission[]
): boolean {
  return required.some((p) => permissions.includes(p));
}