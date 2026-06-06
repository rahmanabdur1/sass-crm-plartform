import Link from "next/link";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold font-mono mb-4"
          style={{ color: "var(--primary)", opacity: 0.3 }}>404</div>
        <AlertTriangle size={40} style={{ color: "var(--warning)", margin: "0 auto 16px" }} />
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Page Not Found</h1>
        <p className="mb-6" style={{ color: "var(--text-muted)" }}>
          The page you're looking for doesn't exist or you don't have access.
        </p>
        <Link href="/dashboard">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl mx-auto font-medium"
            style={{ background: "var(--primary)", color: "white" }}>
            <Home size={16} /> Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}