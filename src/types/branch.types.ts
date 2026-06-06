import { ID, Timestamp, GeoLocation, Status } from "./common.types";

export interface Branch {
  id: ID;
  companyId: ID;
  name: string;
  code: string;
  location: GeoLocation & { address: string };
  managerId?: ID;
  staffIds: ID[];
  status: Status;
  openedAt: Timestamp;
  metrics: BranchMetrics;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BranchMetrics {
  totalLeads: number;
  convertedLeads: number;
  revenue: number;
  activeStaff: number;
  conversionRate?: number;
}