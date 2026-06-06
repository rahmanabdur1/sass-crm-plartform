"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import { Eye, EyeOff, Zap, ArrowRight, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  { label: "Platform Admin", email: "admin@platform.com", password: "admin123", color: "#EF4444" },
  { label: "Owner", email: "owner@apex.com", password: "owner123", color: "#6366F1" },
  { label: "Manager", email: "manager@apex.com", password: "manager123", color: "#F59E0B" },
  { label: "Staff", email: "staff@apex.com", password: "staff123", color: "#22C55E" },
];

export default function LoginPage() {
  const { login, isLoading, initialize } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    initialize();
  }, [initialize]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      await login(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const fillDemo = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "var(--bg-secondary)" }}>
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(var(--border-default) 1px, transparent 1px), linear-gradient(90deg, var(--border-default) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow */}
        <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--primary)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--primary)" }}>
              <Zap size={20} color="white" />
            </div>
            <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              SaaS CRM Pro
            </span>
          </div>

          <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ color: "var(--text-primary)" }}>
            Enterprise CRM
            <span style={{ color: "var(--primary)" }}> Built</span>
            <br />for Bangladesh
          </h1>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Multi-company CRM with GIS mapping, real-time analytics,
            and AI-powered insights — all in one platform.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: "Active Companies", value: "2+" },
            { label: "Leads Tracked", value: "60+" },
            { label: "Branches", value: "5+" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 text-center">
              <div className="text-2xl font-bold font-mono" style={{ color: "var(--primary)" }}>
                {stat.value}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mx-auto"
        >
          <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Welcome back
          </h2>
          <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
            Sign in to your account to continue
          </p>

          {/* Demo Accounts */}
          <div className="mb-6">
            <p className="text-xs mb-3 font-medium" style={{ color: "var(--text-muted)" }}>
              DEMO ACCOUNTS — CLICK TO FILL
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.label}
                  onClick={() => fillDemo(acc.email, acc.password)}
                  className="text-left px-3 py-2 rounded-lg text-xs transition-all hover:opacity-80"
                  style={{
                    background: `${acc.color}15`,
                    border: `1px solid ${acc.color}30`,
                    color: acc.color,
                  }}
                >
                  <div className="font-semibold">{acc.label}</div>
                  <div className="opacity-70">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-4 py-3 rounded-lg text-sm transition-all outline-none"
                style={{
                  background: "var(--bg-elevated)",
                  border: `1px solid ${errors.email ? "var(--danger)" : "var(--border-default)"}`,
                  color: "var(--text-primary)",
                }}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 rounded-lg text-sm transition-all outline-none pr-12"
                  style={{
                    background: "var(--bg-elevated)",
                    border: `1px solid ${errors.password ? "var(--danger)" : "var(--border-default)"}`,
                    color: "var(--text-primary)",
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg text-sm"
                style={{ background: "var(--danger)15", color: "var(--danger)", border: "1px solid var(--danger)30" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--primary)", color: "white" }}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}