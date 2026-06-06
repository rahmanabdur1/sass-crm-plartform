import { ID, Timestamp } from "./common.types";

export interface AnalyticsSnapshot {
  id: ID;
  companyId: ID;
  date: string; // YYYY-MM-DD
  revenue: number;
  leadsCreated: number;
  leadsConverted: number;
  activeLeads: number;
  conversionRate: number;
  createdAt: Timestamp;
}

export interface AIInsight {
  id: ID;
  companyId: ID;
  text: string;
  type: "revenue" | "lead" | "branch" | "staff";
  trend: "up" | "down" | "neutral";
  generatedAt: Timestamp;
}

export interface KPIData {
  label: string;
  value: number | string;
  change: number;
  changeType: "positive" | "negative" | "neutral";
  prefix?: string;
  suffix?: string;
  icon?: string;
}