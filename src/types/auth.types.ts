import { ID, Timestamp } from "./common.types";

export type UserRole = "platform_admin" | "owner" | "manager" | "staff";

export type Permission =
  | "crm.read" | "crm.write" | "crm.delete"
  | "analytics.read" | "analytics.export"
  | "branches.read" | "branches.write" | "branches.delete"
  | "reports.read" | "reports.generate" | "reports.export"
  | "settings.read" | "settings.write"
  | "users.read" | "users.write" | "users.delete"
  | "audit.read"
  | "admin.access";

export interface User {
  id: ID;
  companyId: ID;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  permissions: Permission[];
  avatar?: string; // base64
  isActive: boolean;
  lastLoginAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  onboarded: boolean;
}

export interface AuthToken {
  userId: ID;
  email: string;
  role: UserRole;
  companyId: ID;
  permissions: Permission[];
  exp: Timestamp;
  iat: Timestamp;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  platform_admin: [
    "admin.access", "crm.read", "crm.write", "crm.delete",
    "analytics.read", "analytics.export", "branches.read",
    "branches.write", "branches.delete", "reports.read",
    "reports.generate", "reports.export", "settings.read",
    "settings.write", "users.read", "users.write", "users.delete",
    "audit.read"
  ],
  owner: [
    "crm.read", "crm.write", "crm.delete",
    "analytics.read", "analytics.export",
    "branches.read", "branches.write", "branches.delete",
    "reports.read", "reports.generate", "reports.export",
    "settings.read", "settings.write",
    "users.read", "users.write", "users.delete",
    "audit.read"
  ],
  manager: [
    "crm.read", "crm.write",
    "analytics.read",
    "branches.read", "branches.write",
    "reports.read", "reports.generate",
    "settings.read",
    "users.read"
  ],
  staff: [
    "crm.read", "crm.write",
    "branches.read",
    "reports.read"
  ],
};