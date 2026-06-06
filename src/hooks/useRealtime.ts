"use client";
import { useEffect, useRef, useCallback } from "react";
import { useNotificationStore } from "../store/notificationStore";
import { notificationService } from "../services/notificationService";
import { useAuthStore } from "../store/authStore";
// import { generateId } from "@/utils/generateId";

const NOTIFICATION_TEMPLATES = [
  { title: "New Lead Assigned", message: "A new lead has been assigned to your team.", type: "crm" as const },
  { title: "Lead Converted!", message: "A lead has successfully converted to a customer.", type: "crm" as const },
  { title: "Branch Update", message: "Dhaka branch performance report is ready.", type: "branch" as const },
  { title: "Weekly Report Ready", message: "Your weekly analytics report has been generated.", type: "report" as const },
  { title: "System Alert", message: "System is running optimally.", type: "system" as const },
];

export function useRealtime() {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const intervalRef = useRef<NodeJS.Timeout>();

  const simulateNotification = useCallback(async () => {
    if (!user) return;
    const template = NOTIFICATION_TEMPLATES[Math.floor(Math.random() * NOTIFICATION_TEMPLATES.length)];

    const notification = await notificationService.createNotification({
      ...template,
      companyId: user.companyId,
      userId: user.id,
      read: false,
      link: template.type === "crm" ? "/crm" : "/dashboard",
    });

    addNotification(notification);
  }, [user, addNotification]);

  useEffect(() => {
    if (!user) return;

    // Simulate notification every 3-5 minutes (demo: every 30s)
    const delay = 30000 + Math.random() * 30000;
    intervalRef.current = setInterval(simulateNotification, delay);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, simulateNotification]);

  return { simulateNotification };
}

// EventEmitter for pseudo-websocket
type EventListener<T = unknown> = (data: T) => void;

class RealtimeEventEmitter {
  private listeners: Map<string, EventListener[]> = new Map();

  on<T>(event: string, cb: EventListener<T>): void {
    const existing = this.listeners.get(event) || [];
    this.listeners.set(event, [...existing, cb as EventListener]);
  }

  off<T>(event: string, cb: EventListener<T>): void {
    const existing = this.listeners.get(event) || [];
    this.listeners.set(event, existing.filter((l) => l !== cb));
  }

  emit<T>(event: string, data: T): void {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach((l) => l(data));
  }
}

export const realtimeEmitter = new RealtimeEventEmitter();