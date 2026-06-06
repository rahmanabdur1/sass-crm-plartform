import { ID, Timestamp, Currency, Language } from "./common.types";

export interface Company {
  id: ID;
  name: string;
  slug: string;
  logo?: string; // base64
  primaryColor?: string;
  timezone: string;
  currency: Currency;
  language: Language;
  dateFormat: string;
  isActive: boolean;
  plan: "starter" | "growth" | "enterprise";
  ownerId: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CompanySettings {
  companyId: ID;
  timezone: string;
  currency: Currency;
  language: Language;
  dateFormat: string;
  primaryColor: string;
  notificationsEnabled: boolean;
  auditLogEnabled: boolean;
}