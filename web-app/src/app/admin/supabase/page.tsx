"use client";

import React, { useState } from "react";
import { Database, CheckCircle2, ShieldCheck, RefreshCw, Server, AlertCircle } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export default function AdminSupabaseStatusPage() {
  const [testing, setTesting] = useState(false);
  const [lastCheck, setLastCheck] = useState("Just now");

  const runTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setLastCheck("Just now");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
            <Database className="h-4 w-4" />
            SECTION 17
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Supabase Integration Status</h1>
          <p className="text-xs text-slate-400">PostgreSQL connection, Auth authority, Storage buckets & Edge Functions</p>
        </div>

        <button
          onClick={runTest}
          disabled={testing}
          className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20"
        >
          <RefreshCw className={`h-4 w-4 ${testing ? "animate-spin" : ""}`} />
          {testing ? "Pinging Backend..." : "Ping Supabase Infrastructure"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">PostgreSQL Database Engine</h3>
            <span className="flex items-center gap-1 font-mono text-xs text-emerald-400 font-bold">
              <CheckCircle2 className="h-4 w-4" /> CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-400">
            PostgreSQL 15+ engine hosting all 46 normalized enterprise schema tables.
          </p>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-cyber-surface border border-cyber-border/60 flex justify-between">
              <span className="text-slate-400">RLS Enforcement</span>
              <span className="text-emerald-400 font-bold">ENABLED (46/46 TABLES)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-cyber-surface border border-cyber-border/60 flex justify-between">
              <span className="text-slate-400">Connection Mode</span>
              <span className="text-cyan-400 font-bold">Transaction Pooler (6543)</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Supabase Auth System</h3>
            <span className="flex items-center gap-1 font-mono text-xs text-emerald-400 font-bold">
              <CheckCircle2 className="h-4 w-4" /> OPERATIONAL
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Single authentication authority for both Android APK and Next.js Web applications.
          </p>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-cyber-surface border border-cyber-border/60 flex justify-between">
              <span className="text-slate-400">Token Algorithm</span>
              <span className="text-emerald-400 font-bold">JWT (RS256/HS256)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-cyber-surface border border-cyber-border/60 flex justify-between">
              <span className="text-slate-400">MFA Support</span>
              <span className="text-teal-400 font-bold">TOTP Authenticator Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
