import { db, Report } from "@/db/schema";
import { generateId } from "@/utils/generateId";
import { auditService } from "@/services/auditService";
import { exportService } from "@/services/exportService";

export type ReportType =
  | "lead_summary"
  | "branch_performance"
  | "revenue"
  | "staff_activity"
  | "conversion_analysis"
  | "custom";

export interface ReportConfig {
  type: ReportType;
  name: string;
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
  groupBy?: string;
}

class ReportService {
  async generateReport(
    config: ReportConfig,
    companyId: string,
    actorId: string,
    actorName: string
  ): Promise<Report> {
    const data = await this.buildReportData(config, companyId);

    const report: Report = {
      id: generateId(),
      companyId,
      name: config.name,
      type: config.type,
      data: { config, rows: data },
      generatedAt: Date.now(),
    };

    await db.reports.add(report);

    await auditService.log({
      companyId,
      actorId,
      actorName,
      action: "report.generated",
      target: "report",
      targetId: report.id,
      after: { name: report.name, type: report.type } as Record<string, unknown>,
    });

    return report;
  }

  private async buildReportData(
    config: ReportConfig,
    companyId: string
  ): Promise<Record<string, unknown>[]> {
    switch (config.type) {
      case "lead_summary": {
        const leads = await db.leads.where("companyId").equals(companyId).toArray();
        const statusGroups: Record<string, { count: number; totalValue: number }> = {};
        leads.forEach((l) => {
          if (!statusGroups[l.status]) statusGroups[l.status] = { count: 0, totalValue: 0 };
          statusGroups[l.status].count++;
          statusGroups[l.status].totalValue += l.value;
        });
        return Object.entries(statusGroups).map(([status, stats]) => ({
          status,
          count: stats.count,
          totalValue: stats.totalValue,
          avgValue: stats.count > 0 ? stats.totalValue / stats.count : 0,
        }));
      }

      case "branch_performance": {
        const branches = await db.branches.where("companyId").equals(companyId).toArray();
        return branches.map((b) => ({
          branchName: b.name,
          code: b.code,
          revenue: b.metrics.revenue,
          totalLeads: b.metrics.totalLeads,
          convertedLeads: b.metrics.convertedLeads,
          conversionRate: b.metrics.totalLeads > 0
            ? ((b.metrics.convertedLeads / b.metrics.totalLeads) * 100).toFixed(1)
            : "0",
          activeStaff: b.metrics.activeStaff,
          status: b.status,
        }));
      }

      case "revenue": {
        const snapshots = await db.analyticsSnapshots
          .where("companyId").equals(companyId).sortBy("date");
        return snapshots.map((s) => ({
          date: s.date,
          revenue: s.revenue,
          leadsCreated: s.leadsCreated,
          leadsConverted: s.leadsConverted,
          conversionRate: s.conversionRate.toFixed(1),
        }));
      }

      case "conversion_analysis": {
        const leads = await db.leads.where("companyId").equals(companyId).toArray();
        const sourceGroups: Record<string, { total: number; converted: number; totalValue: number }> = {};
        leads.forEach((l) => {
          if (!sourceGroups[l.source]) sourceGroups[l.source] = { total: 0, converted: 0, totalValue: 0 };
          sourceGroups[l.source].total++;
          if (l.status === "converted") sourceGroups[l.source].converted++;
          sourceGroups[l.source].totalValue += l.value;
        });
        return Object.entries(sourceGroups).map(([source, stats]) => ({
          source,
          totalLeads: stats.total,
          convertedLeads: stats.converted,
          conversionRate: stats.total > 0 ? ((stats.converted / stats.total) * 100).toFixed(1) : "0",
          totalValue: stats.totalValue,
          avgValue: stats.total > 0 ? (stats.totalValue / stats.total).toFixed(0) : "0",
        }));
      }

      default:
        return [];
    }
  }

  async getReports(companyId: string): Promise<Report[]> {
    return await db.reports
      .where("companyId").equals(companyId)
      .reverse().sortBy("generatedAt");
  }

  async deleteReport(id: string): Promise<void> {
    await db.reports.delete(id);
  }

  async exportReportCSV(report: Report): Promise<void> {
    const rows = (report.data as { rows: Record<string, unknown>[] }).rows || [];
    exportService.exportCSV(rows, report.name);
  }

  async exportReportJSON(report: Report): Promise<void> {
    exportService.exportJSON(report.data, report.name);
  }
}

export const reportService = new ReportService();















// // Add import:
// import { CustomReportBuilder } from "@/modules/reports/CustomReportBuilder";

// // Add tab button to the REPORT_TYPES section:
// // Add a "Custom Builder" tab toggle at the top of the page:
// const [activeTab, setActiveTab] = useState<"generate" | "custom" | "history">("generate");

// // Replace section rendering with tab-based view:
// /*
// Tab buttons:
//   <div className="flex gap-2 mb-6">
//     {[
//       { key: "generate", label: "Quick Generate" },
//       { key: "custom", label: "Custom Builder" },
//       { key: "history", label: "Report History" },
//     ].map(({ key, label }) => (
//       <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
//         className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
//         style={{
//           background: activeTab === key ? "var(--primary)" : "var(--bg-card)",
//           color: activeTab === key ? "white" : "var(--text-secondary)",
//         }}>
//         {label}
//       </button>
//     ))}
//   </div>

//   {activeTab === "generate" && <ReportTypeCards />}
//   {activeTab === "custom" && <CustomReportBuilder onReportGenerated={(r) => setReports(prev => [r, ...prev])} />}
//   {activeTab === "history" && <ReportHistoryTable />}
// */