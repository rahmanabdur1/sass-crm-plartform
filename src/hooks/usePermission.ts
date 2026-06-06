import { useAuthStore } from "../store/authStore";
import { Permission } from "../types/auth.types";
import { hasPermission, hasAnyPermission, canAccessRoute } from "../utils/roleGuard";

export function usePermission() {
  const { user } = useAuthStore();

  const can = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.permissions, permission);
  };

  const canAny = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAnyPermission(user.permissions, permissions);
  };

  const canAccess = (pathname: string): boolean => {
    if (!user) return false;
    return canAccessRoute(user.role, pathname);
  };

  const isRole = (role: string): boolean => {
    return user?.role === role;
  };

  const isPlatformAdmin = (): boolean => user?.role === "platform_admin";
  const isOwner = (): boolean => user?.role === "owner" || isPlatformAdmin();
  const isManager = (): boolean =>
    user?.role === "manager" || isOwner();

  return { can, canAny, canAccess, isRole, isPlatformAdmin, isOwner, isManager };
}