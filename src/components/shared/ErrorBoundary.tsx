"use client";
import React from "react";
import { RefreshCw } from "lucide-react";

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
          <div className="glass-card p-8 text-center max-w-md">
            <p className="text-4xl mb-4">💥</p>
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Something went wrong
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg mx-auto text-sm font-medium"
              style={{ background: "var(--primary)", color: "white" }}
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}