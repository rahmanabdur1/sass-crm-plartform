import { db } from "@/db/schema";
import { Branch } from "@/types/branch.types";
import { generateId } from "@/utils/generateId";
import { auditService } from "./auditService";

class BranchService {
  async getBranches(companyId: string): Promise<Branch[]> {
    return await db.branches
      .where("companyId").equals(companyId)
      .sortBy("createdAt");
  }

  async getBranch(id: string): Promise<Branch | undefined> {
    return await db.branches.get(id);
  }

  async createBranch(
    data: Omit<Branch, "id" | "createdAt" | "updatedAt">,
    actorId: string,
    actorName: string
  ): Promise<Branch> {
    const branch: Branch = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.branches.add(branch);
    await auditService.log({
      companyId: data.companyId,
      actorId,
      actorName,
      action: "branch.created",
      target: "branch",
      targetId: branch.id,
      after: branch as unknown as Record<string, unknown>,
    });
    return branch;
  }

  async updateBranch(
    id: string,
    partial: Partial<Branch>,
    actorId: string,
    actorName: string,
    companyId: string
  ): Promise<void> {
    const before = await db.branches.get(id);
    await db.branches.update(id, { ...partial, updatedAt: Date.now() });
    await auditService.log({
      companyId,
      actorId,
      actorName,
      action: "branch.updated",
      target: "branch",
      targetId: id,
      before: before as unknown as Record<string, unknown>,
      after: partial as Record<string, unknown>,
    });
  }

  async deleteBranch(
    id: string,
    actorId: string,
    actorName: string,
    companyId: string
  ): Promise<void> {
    const before = await db.branches.get(id);
    await db.branches.delete(id);
    await auditService.log({
      companyId,
      actorId,
      actorName,
      action: "branch.deleted",
      target: "branch",
      targetId: id,
      before: before as unknown as Record<string, unknown>,
    });
  }

  async getBranchStats(companyId: string) {
    const branches = await this.getBranches(companyId);
    return {
      total: branches.length,
      active: branches.filter((b) => b.status === "active").length,
      totalRevenue: branches.reduce((s, b) => s + b.metrics.revenue, 0),
      totalLeads: branches.reduce((s, b) => s + b.metrics.totalLeads, 0),
    };
  }
}

export const branchService = new BranchService();