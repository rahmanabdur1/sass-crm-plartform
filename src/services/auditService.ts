import { db, AuditLog } from "../db/schema";
import { generateId } from "../utils/generateId";
import { SIMULATED_IP } from "../utils/constants";

interface LogParams {
  companyId: string;
  actorId: string;
  actorName: string;
  action: string;
  target: string;
  targetId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

class AuditService {
  async log(params: LogParams): Promise<void> {
    const log: AuditLog = {
      id: generateId(),
      ip: SIMULATED_IP + Math.floor(Math.random() * 255),
      timestamp: Date.now(),
      ...params,
    };
    await db.auditLogs.add(log);
  }

  async getLogs(companyId: string, limit = 50): Promise<AuditLog[]> {
    return await db.auditLogs
      .where("companyId")
      .equals(companyId)
      .reverse()
      .limit(limit)
      .sortBy("timestamp");
  }

  async getLogsByActor(companyId: string, actorId: string): Promise<AuditLog[]> {
    return await db.auditLogs
      .where({ companyId, actorId })
      .reverse()
      .sortBy("timestamp");
  }
}

export const auditService = new AuditService();