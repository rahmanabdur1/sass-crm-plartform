import { v4 as uuid } from "uuid";
import { db } from "../../db/schema";
import { User, ROLE_PERMISSIONS } from "../../types/auth.types";
import { Company } from "../../types/company.types";
import { Lead } from "../../types/crm.types";
import { Branch } from "../../types/branch.types";
import { AnalyticsSnapshot } from "../../types/analytics.types";
import { hashPassword } from "../../utils/crypto";
import { format, subDays } from "date-fns";

const BD_CITIES = [
  { city: "Dhaka", region: "Dhaka Division", lat: 23.8103, lng: 90.4125 },
  { city: "Chittagong", region: "Chattogram Division", lat: 22.3569, lng: 91.7832 },
  { city: "Sylhet", region: "Sylhet Division", lat: 24.8949, lng: 91.8687 },
  { city: "Rajshahi", region: "Rajshahi Division", lat: 24.3745, lng: 88.6042 },
  { city: "Khulna", region: "Khulna Division", lat: 22.8456, lng: 89.5403 },
];

const LEAD_NAMES = [
  "Rahim Uddin", "Karim Hassan", "Farida Begum", "Nusrat Jahan",
  "Arif Islam", "Shakila Akter", "Masud Rana", "Rupa Khatun",
  "Jahangir Alam", "Sonia Ahmed", "Tanvir Hossain", "Mitu Roy",
];

export async function seedDatabase(): Promise<void> {
  const existing = await db.companies.count();
  if (existing > 0) return; // already seeded

  // --- Company A ---
  const companyAId = uuid();
  const companyA: Company = {
    id: companyAId,
    name: "Apex Solutions BD",
    slug: "apex-solutions",
    primaryColor: "#6366F1",
    timezone: "Asia/Dhaka",
    currency: "BDT",
    language: "en",
    dateFormat: "DD/MM/YYYY",
    isActive: true,
    plan: "growth",
    ownerId: "",
    createdAt: Date.now() - 86400000 * 90,
    updatedAt: Date.now(),
  };

  // --- Company B ---
  const companyBId = uuid();
  const companyB: Company = {
    id: companyBId,
    name: "NextGen Ventures",
    slug: "nextgen-ventures",
    primaryColor: "#22C55E",
    timezone: "Asia/Dhaka",
    currency: "USD",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    isActive: true,
    plan: "enterprise",
    ownerId: "",
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now(),
  };

  // --- Platform Admin ---
  const platformAdminId = uuid();
  const platformAdmin: User = {
    id: platformAdminId,
    companyId: companyAId,
    name: "Platform Admin",
    email: "admin@platform.com",
    passwordHash: await hashPassword("admin123"),
    role: "platform_admin",
    permissions: ROLE_PERMISSIONS["platform_admin"],
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    onboarded: true,
  };

  // --- Company A Owner ---
  const ownerAId = uuid();
  const ownerA: User = {
    id: ownerAId,
    companyId: companyAId,
    name: "Ahmed Hossain",
    email: "owner@apex.com",
    passwordHash: await hashPassword("owner123"),
    role: "owner",
    permissions: ROLE_PERMISSIONS["owner"],
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    onboarded: true,
  };

  // --- Company A Manager ---
  const managerAId = uuid();
  const managerA: User = {
    id: managerAId,
    companyId: companyAId,
    name: "Rakib Hasan",
    email: "manager@apex.com",
    passwordHash: await hashPassword("manager123"),
    role: "manager",
    permissions: ROLE_PERMISSIONS["manager"],
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    onboarded: true,
  };

  // --- Staff ---
  const staffAId = uuid();
  const staffA: User = {
    id: staffAId,
    companyId: companyAId,
    name: "Sadia Islam",
    email: "staff@apex.com",
    passwordHash: await hashPassword("staff123"),
    role: "staff",
    permissions: ROLE_PERMISSIONS["staff"],
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    onboarded: true,
  };

  companyA.ownerId = ownerAId;
  companyB.ownerId = uuid();

  // --- Branches ---
  const branches: Branch[] = BD_CITIES.map((city, i) => ({
    id: uuid(),
    companyId: companyAId,
    name: `${city.city} Branch`,
    code: `APX-${city.city.toUpperCase().slice(0, 3)}`,
    location: { ...city, address: `${city.city} Main Office, Bangladesh` },
    managerId: i === 0 ? managerAId : uuid(),
    staffIds: [staffAId],
    status: i < 3 ? "active" : i === 3 ? "pending" : "inactive",
    openedAt: Date.now() - 86400000 * (90 - i * 10),
    metrics: {
      totalLeads: 20 + i * 8,
      convertedLeads: 8 + i * 3,
      revenue: (150000 + i * 50000),
      activeStaff: 3 + i,
    },
    createdAt: Date.now() - 86400000 * (90 - i * 10),
    updatedAt: Date.now(),
  }));

  // --- Leads ---
  const statuses: Lead["status"][] = ["new", "contacted", "qualified", "negotiation", "converted", "lost"];
  const sources: Lead["source"][] = ["web", "referral", "cold_call", "social", "event", "other"];

  const leads: Lead[] = Array.from({ length: 60 }).map((_, i) => {
    const cityData = BD_CITIES[i % BD_CITIES.length];
    return {
      id: uuid(),
      companyId: companyAId,
      name: LEAD_NAMES[i % LEAD_NAMES.length],
      email: `lead${i + 1}@email.com`,
      phone: `+8801${String(700000000 + i)}`,
      source: sources[i % sources.length],
      status: statuses[i % statuses.length],
      assignedTo: i % 3 === 0 ? managerAId : staffAId,
      branchId: branches[i % branches.length].id,
      value: Math.floor(Math.random() * 500000) + 50000,
      notes: `Follow up needed for lead ${i + 1}`,
      tags: i % 2 === 0 ? ["hot", "enterprise"] : ["warm"],
      location: {
        lat: cityData.lat + (Math.random() - 0.5) * 0.1,
        lng: cityData.lng + (Math.random() - 0.5) * 0.1,
        city: cityData.city,
        region: cityData.region,
      },
      score: Math.floor(Math.random() * 100),
      activities: [],
      createdAt: Date.now() - 86400000 * Math.floor(Math.random() * 60),
      updatedAt: Date.now(),
    };
  });

  // --- Analytics Snapshots (last 30 days) ---
  const snapshots: AnalyticsSnapshot[] = Array.from({ length: 30 }).map((_, i) => {
    const date = subDays(new Date(), 29 - i);
    const revenue = 50000 + i * 3000 + Math.random() * 10000;
    const leadsCreated = 3 + Math.floor(Math.random() * 5);
    const leadsConverted = Math.floor(leadsCreated * 0.3 + Math.random());
    return {
      id: uuid(),
      companyId: companyAId,
      date: format(date, "yyyy-MM-dd"),
      revenue,
      leadsCreated,
      leadsConverted,
      activeLeads: 20 + i,
      conversionRate: (leadsConverted / leadsCreated) * 100,
      createdAt: date.getTime(),
    };
  });

  // --- Bulk insert ---
  await db.transaction("rw", [db.companies, db.users, db.branches, db.leads, db.analyticsSnapshots], async () => {
    await db.companies.bulkAdd([companyA, companyB]);
    await db.users.bulkAdd([platformAdmin, ownerA, managerA, staffA]);
    await db.branches.bulkAdd(branches);
    await db.leads.bulkAdd(leads);
    await db.analyticsSnapshots.bulkAdd(snapshots);
  });

  console.log("✅ Database seeded successfully");
}