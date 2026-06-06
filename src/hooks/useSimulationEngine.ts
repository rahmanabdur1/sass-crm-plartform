"use client";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCompanyStore } from "@/store/companyStore";
import { useCRMStore } from "@/store/crmStore";
import { useNotificationStore } from "@/store/notificationStore";
import { notificationService } from "@/services/notificationService";
import { db } from "@/db/schema";
import { generateId } from "@/utils/generateId";
import { realtimeEmitter } from "./useRealtime";

function getActivityMultiplier(): number {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0=Sun, 6=Sat

  if (day === 0 || day === 6) return 0.3; // weekend
  if (hour < 8 || hour >= 20) return 0.2; // off hours
  if (hour >= 9 && hour <= 17) return 1.0; // business hours
  return 0.5;
}

const ACTIVITY_EVENTS = [
  (leadName: string) => `Lead "${leadName}" moved to Contacted stage`,
  (leadName: string) => `New follow-up scheduled for "${leadName}"`,
  () => "Branch analytics snapshot updated",
  () => "Weekly report auto-generated",
  (leadName: string) => `Lead "${leadName}" score improved to ${Math.floor(Math.random() * 30) + 70}/100`,
  () => "New referral lead created from website",
];

const NOTIFICATION_TEMPLATES = [
  { title: "🎯 Lead Converted!", message: "A referral lead just converted to customer.", type: "crm" as const },
  { title: "📊 Weekly Report Ready", message: "Your weekly performance report has been generated.", type: "report" as const },
  { title: "🏢 Branch Milestone", message: "Dhaka branch reached 50 converted leads!", type: "branch" as const },
  { title: "⚠️ Low Conversion Alert", message: "Cold call conversion rate dropped below 10%.", type: "system" as const },
  { title: "👤 New Team Member", message: "A new staff member joined your company.", type: "system" as const },
];

export function useSimulationEngine() {
  const { user } = useAuthStore();
  const { activeCompany } = useCompanyStore();
  const { leads, updateLead } = useCRMStore();
  const { addNotification } = useNotificationStore();

  const intervalsRef = useRef<NodeJS.Timeout[]>([]);

  function clearAll() {
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
  }

  useEffect(() => {
    if (!user || !activeCompany) return;

    // — KPI Delta (15s) —
    const kpiInterval = setInterval(() => {
      const multiplier = getActivityMultiplier();
      const delta = (Math.random() * 0.05 - 0.02) * multiplier;
      realtimeEmitter.emit("kpi:update", { delta, companyId: activeCompany.id });
    }, 15000);

    // — Activity Feed (30s) —
    const activityInterval = setInterval(() => {
      const multiplier = getActivityMultiplier();
      if (Math.random() > multiplier) return;

      const randomLead = leads[Math.floor(Math.random() * leads.length)];
      const template = ACTIVITY_EVENTS[Math.floor(Math.random() * ACTIVITY_EVENTS.length)];
      const event = {
        id: generateId(),
        text: template(randomLead?.name || "Unknown Lead"),
        time: Date.now(),
        companyId: activeCompany.id,
      };
      realtimeEmitter.emit("activity:new", event);
    }, 30000);

    // — Lead Auto-Progress (60s) —
    const leadProgressInterval = setInterval(async () => {
      const multiplier = getActivityMultiplier();
      if (Math.random() > multiplier * 0.3) return;

      const progressableLeads = leads.filter(
        (l) => l.status === "new" || l.status === "contacted" || l.status === "qualified"
      );
      if (progressableLeads.length === 0) return;

      const lead = progressableLeads[Math.floor(Math.random() * progressableLeads.length)];
      const stageMap: Record<string, string> = {
        new: "contacted",
        contacted: "qualified",
        qualified: "negotiation",
      };
      const nextStatus = stageMap[lead.status];
      if (!nextStatus) return;

      updateLead(lead.id, { status: nextStatus as typeof lead.status });
      await db.leads.update(lead.id, { status: nextStatus as typeof lead.status, updatedAt: Date.now() });

      realtimeEmitter.emit("lead:progress", { leadId: lead.id, from: lead.status, to: nextStatus });
    }, 60000);

    // — Notification Generator (random 30-90s) —
    function scheduleNextNotification() {
      const delay = 30000 + Math.random() * 60000;
      const t = setTimeout(async () => {
        const multiplier = getActivityMultiplier();
        if (Math.random() < multiplier * 0.6) {
          const template = NOTIFICATION_TEMPLATES[Math.floor(Math.random() * NOTIFICATION_TEMPLATES.length)];
          const notification = await notificationService.createNotification({
            ...template,
            companyId: activeCompany.id,
            userId: user.id,
            read: false,
            link: template.type === "crm" ? "/crm" : template.type === "report" ? "/reports" : "/dashboard",
          });
          addNotification(notification);
          realtimeEmitter.emit("notification:new", notification);
        }
        scheduleNextNotification();
      }, delay);
      intervalsRef.current.push(t);
    }
    scheduleNextNotification();

    // — Analytics Snapshot Increment (45s) —
    const analyticsInterval = setInterval(async () => {
      const multiplier = getActivityMultiplier();
      const today = new Date().toISOString().slice(0, 10);
      const snapshot = await db.analyticsSnapshots
        .where({ companyId: activeCompany.id, date: today })
        .first();

      if (snapshot) {
        const revenueIncrease = Math.floor(Math.random() * 5000 * multiplier);
        await db.analyticsSnapshots.update(snapshot.id, {
          revenue: snapshot.revenue + revenueIncrease,
        });
        realtimeEmitter.emit("analytics:update", {
          companyId: activeCompany.id,
          delta: revenueIncrease,
        });
      }
    }, 45000);

    intervalsRef.current.push(kpiInterval, activityInterval, leadProgressInterval, analyticsInterval);

    return () => clearAll();
  }, [user, activeCompany, leads, updateLead, addNotification]);
}