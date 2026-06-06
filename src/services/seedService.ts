import { db } from "@/db/schema";
import { seedDatabase } from "@/db/seeds/seedData";

class SeedService {
  async isSeeded(): Promise<boolean> {
    const count = await db.companies.count();
    return count > 0;
  }

  async reseed(): Promise<void> {
    // Clear all tables
    await db.transaction("rw", [
      db.companies, db.users, db.leads, db.leadActivities,
      db.branches, db.analyticsSnapshots, db.notifications,
      db.auditLogs, db.reports
    ], async () => {
      await Promise.all([
        db.companies.clear(),
        db.users.clear(),
        db.leads.clear(),
        db.leadActivities.clear(),
        db.branches.clear(),
        db.analyticsSnapshots.clear(),
        db.notifications.clear(),
        db.auditLogs.clear(),
        db.reports.clear(),
      ]);
    });
    await seedDatabase();
  }

  async clearAll(): Promise<void> {
    await db.transaction("rw", [
      db.leads, db.leadActivities, db.branches,
      db.analyticsSnapshots, db.notifications, db.auditLogs, db.reports
    ], async () => {
      await Promise.all([
        db.leads.clear(),
        db.leadActivities.clear(),
        db.analyticsSnapshots.clear(),
        db.notifications.clear(),
        db.auditLogs.clear(),
        db.reports.clear(),
      ]);
    });
  }

  async getStorageInfo(): Promise<{ totalRecords: number; breakdown: Record<string, number> }> {
    const [companies, users, leads, branches, snapshots, notifications, auditLogs, reports] =
      await Promise.all([
        db.companies.count(),
        db.users.count(),
        db.leads.count(),
        db.branches.count(),
        db.analyticsSnapshots.count(),
        db.notifications.count(),
        db.auditLogs.count(),
        db.reports.count(),
      ]);

    const breakdown = { companies, users, leads, branches, snapshots, notifications, auditLogs, reports };
    const totalRecords = Object.values(breakdown).reduce((s, v) => s + v, 0);
    return { totalRecords, breakdown };
  }
}

export const seedService = new SeedService();