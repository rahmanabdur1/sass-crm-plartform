import { db } from "../db/schema";
import { Lead, LeadActivity } from "../types/crm.types";
import { generateId } from "../utils/generateId";
import { auditService } from "./auditService";

class CRMService {
  async getLeads(companyId: string): Promise<Lead[]> {
    return await db.leads
      .where("companyId")
      .equals(companyId)
      .reverse()
      .sortBy("createdAt");
  }

  async createLead(
    data: Omit<Lead, "id" | "createdAt" | "updatedAt" | "activities">,
    actorId: string,
    actorName: string
  ): Promise<Lead> {
    const lead: Lead = {
      ...data,
      id: generateId(),
      activities: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.leads.add(lead);

    await auditService.log({
      companyId: data.companyId,
      actorId,
      actorName,
      action: "lead.created",
      target: "lead",
      targetId: lead.id,
      after: lead as unknown as Record<string, unknown>,
    });

    return lead;
  }

  async updateLead(
    id: string,
    partial: Partial<Lead>,
    actorId: string,
    actorName: string,
    companyId: string
  ): Promise<void> {
    const before = await db.leads.get(id);
    await db.leads.update(id, { ...partial, updatedAt: Date.now() });

    await auditService.log({
      companyId,
      actorId,
      actorName,
      action: "lead.updated",
      target: "lead",
      targetId: id,
      before: before as unknown as Record<string, unknown>,
      after: partial as Record<string, unknown>,
    });
  }

  async deleteLead(id: string, actorId: string, actorName: string, companyId: string): Promise<void> {
    const lead = await db.leads.get(id);
    await db.leads.delete(id);

    await auditService.log({
      companyId,
      actorId,
      actorName,
      action: "lead.deleted",
      target: "lead",
      targetId: id,
      before: lead as unknown as Record<string, unknown>,
    });
  }

  async addActivity(activity: Omit<LeadActivity, "id" | "createdAt">): Promise<LeadActivity> {
    const full: LeadActivity = {
      ...activity,
      id: generateId(),
      createdAt: Date.now(),
    };
    await db.leadActivities.add(full);

    const lead = await db.leads.get(activity.leadId);
    if (lead) {
      await db.leads.update(activity.leadId, {
        activities: [...lead.activities, full],
        updatedAt: Date.now(),
      });
    }
    return full;
  }

  async updateLeadStatus(
    id: string,
    status: Lead["status"],
    actorId: string,
    actorName: string,
    companyId: string
  ): Promise<void> {
    await this.updateLead(id, { status }, actorId, actorName, companyId);
  }
}

export const crmService = new CRMService();