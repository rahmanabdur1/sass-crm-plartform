import Link from "next/link";
import { ShieldOff } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <div className="text-center max-w-md">
        <ShieldOff size={48} style={{ color: "var(--danger)", margin: "0 auto 16px" }} />
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Access Denied</h1>
        <p className="mb-6" style={{ color: "var(--text-muted)" }}>
          You don't have permission to access this page. Contact your administrator.
        </p>
        <Link href="/dashboard">
          <button className="px-6 py-3 rounded-xl font-medium"
            style={{ background: "var(--primary)", color: "white" }}>
            Return to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}