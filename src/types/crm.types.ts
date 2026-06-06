import { ID, Timestamp, GeoLocation } from "./common.types";

export type LeadSource = "web" | "referral" | "cold_call" | "social" | "event" | "other";
export type LeadStatus = "new" | "contacted" | "qualified" | "negotiation" | "converted" | "lost";

export interface Lead {
  id: ID;
  companyId: ID;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  assignedTo?: ID;
  branchId?: ID;
  value: number;
  notes?: string;
  tags: string[];
  location?: GeoLocation;
  score?: number; // 0-100
  activities: LeadActivity[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LeadActivity {
  id: ID;
  leadId: ID;
  actorId: ID;
  type: "note" | "call" | "email" | "meeting" | "status_change";
  description: string;
  createdAt: Timestamp;
}

export type LeadsByStatus = Record<LeadStatus, Lead[]>;