import { redirect } from "next/navigation";
export default function RootPage() {
  redirect("/dashboard");
}





// // In src/app/(dashboard)/dashboard/page.tsx
// // Add import:
// import { QuickActionsPanel } from "@/modules/dashboard/QuickActionsPanel";

// // Replace bottom row:
// <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//   {/* Recent Activity - take 2 cols */}
//   <div className="lg:col-span-2">
//     {/* existing activity card */}
//   </div>
//   {/* Quick Actions - 1 col */}
//   <QuickActionsPanel />
// </div>