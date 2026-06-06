import Dexie, { Table } from "dexie";
import { User } from "../types/auth.types";
import { Company } from "../types/company.types";
import { Lead, LeadActivity } from "../types/crm.types";
import { Branch } from "../types/branch.types";
import { AnalyticsSnapshot } from "../types/analytics.types";

export interface Notification {
  id: string;
  companyId: string;
  userId: string;
  type: "system" | "crm" | "branch" | "report" | "reminder";
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: number;
}

export interface AuditLog {
  id: string;
  companyId: string;
  actorId: string;
  actorName: string;
  action: string;
  target: string;
  targetId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ip: string;
  timestamp: number;
}

export interface Report {
  id: string;
  companyId: string;
  name: string;
  type: string;
  data: Record<string, unknown>;
  format?: string;
  generatedAt: number;
}

export class SaaSDatabase extends Dexie {
  users!: Table<User>;
  companies!: Table<Company>;
  leads!: Table<Lead>;
  leadActivities!: Table<LeadActivity>;
  branches!: Table<Branch>;
  analyticsSnapshots!: Table<AnalyticsSnapshot>;
  notifications!: Table<Notification>;
  auditLogs!: Table<AuditLog>;
  reports!: Table<Report>;

  constructor() {
    super("SaaSCRMPlatform");

    this.version(1).stores({
      users: "id, companyId, email, role, isActive",
      companies: "id, slug, ownerId, isActive",
      leads: "id, companyId, status, assignedTo, branchId, source, createdAt",
      leadActivities: "id, leadId, actorId, type, createdAt",
      branches: "id, companyId, code, managerId, status",
      analyticsSnapshots: "id, companyId, date",
      notifications: "id, companyId, userId, read, createdAt",
      auditLogs: "id, companyId, actorId, action, timestamp",
      reports: "id, companyId, type, generatedAt",
    });
  }
}

export const db = new SaaSDatabase();