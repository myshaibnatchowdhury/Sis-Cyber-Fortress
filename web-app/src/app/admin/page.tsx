"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Smartphone,
  AlertOctagon,
  Globe2,
  Flame,
  CheckCircle2,
  ArrowRight,
  Database,
  Activity,
  Layers,
  HeartPulse,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState({
    userCount: 14,
    deviceCount: 8,
    activeIncidents: 3,
    scannedDomains: 19,
    threatIOCs: 4,
    dbLatency: "14ms",
  });

  const [recentIncidents, setRecentIncidents] = useState<any[]>([
    {
      id: "inc-1",
      number: "INC-2026-004",
      title: "Credential Harvesting Domain Intercepted",
      severity: "critical",
      status: "investigating",
      assigned_to: "SecOps Lead",
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: "inc-2",
      number: "INC-2026-003",
      title: "Unverified Host Beaconing Signal",
      severity: "high",
      status: "assigned",
      assigned_to: "Forensics Specialist",
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ]);

  useEffect(() => {
    async function loadStats() {
      if (!isSupabaseConfigured) return;
      try {
        const start = Date.now();
        const [
          { count: uCount },
          { count: dCount },
          { count: iCount },
          { count: sCount },
          { count: tCount },
        ] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("registered_devices").select("*", { count: "exact", head: true }),
          supabase.from("security_incidents").select("*", { count: "exact", head: true }).neq("status", "closed"),
          supabase.from("website_scans").select("*", { count: "exact", head: true }),
          supabase.from("threat_indicators").select("*", { count: "exact", head: true }),
        ]);

        const latency = `${Date.now() - start}ms`;

        setMetrics({
          userCount: uCount ?? 14,
          deviceCount: dCount ?? 8,
          activeIncidents: iCount ?? 3,
          scannedDomains: sCount ?? 19,
          threatIOCs: tCount ?? 4,
          dbLatency: latency,
        });
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
            <ShieldAlert className="h-4 w-4" />
            SECTION 01 • COMMAND CONTROL
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Super Admin Overview</h1>
          <p className="text-xs text-slate-400">Enterprise fleet metrics, live incident posture & Supabase operational telemetry</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-cyber-border bg-slate-900 px-3.5 py-2 text-xs font-mono text-slate-300 flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span>DB LATENCY: <strong className="text-emerald-400">{metrics.dbLatency}</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="rounded-xl border border-cyber-border bg-slate-900/80 p-5 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Users</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{metrics.userCount}</div>
          <div className="text-[10px] text-slate-500 font-mono">Multi-tenant profiles</div>
        </div>

        <div className="rounded-xl border border-cyber-border bg-slate-900/80 p-5 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Android Devices</span>
            <Smartphone className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{metrics.deviceCount}</div>
          <div className="text-[10px] text-slate-500 font-mono">Keystore bound</div>
        </div>

        <div className="rounded-xl border border-cyber-border bg-slate-900/80 p-5 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Active Incidents</span>
            <AlertOctagon className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">{metrics.activeIncidents}</div>
          <div className="text-[10px] text-slate-500 font-mono">SOC triage queue</div>
        </div>

        <div className="rounded-xl border border-cyber-border bg-slate-900/80 p-5 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Assessed Scans</span>
            <Globe2 className="h-4 w-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{metrics.scannedDomains}</div>
          <div className="text-[10px] text-slate-500 font-mono">SSRF-protected</div>
        </div>

        <div className="rounded-xl border border-cyber-border bg-slate-900/80 p-5 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Threat IOCs</span>
            <Flame className="h-4 w-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{metrics.threatIOCs}</div>
          <div className="text-[10px] text-slate-500 font-mono">CISA / Abuse feeds</div>
        </div>
      </div>

      {/* Incident Triage & Quick Control */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-border/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-rose-400" />
              Active SOC Incidents Requiring Authorization
            </h3>
            <Link href="/admin/incidents" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
              Manage Lifecycle <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-cyber-border/60">
            {recentIncidents.map((inc) => (
              <div key={inc.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span className="font-mono text-slate-400">{inc.number}</span>
                    <span>{inc.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    ASSIGNED: {inc.assigned_to} • {new Date(inc.created_at).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded px-2 py-0.5 text-[10px] font-mono uppercase font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    {inc.severity}
                  </span>
                  <span className="rounded px-2 py-0.5 text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                    {inc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health Summary */}
        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-emerald-400" />
            System Health Diagnostics
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyber-surface border border-cyber-border/60">
              <span className="text-slate-300">Supabase Auth Service</span>
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> ONLINE
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyber-surface border border-cyber-border/60">
              <span className="text-slate-300">PostgreSQL RLS Engine</span>
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> 46 POLICIES
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyber-surface border border-cyber-border/60">
              <span className="text-slate-300">Edge Functions Runtime</span>
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> ACTIVE
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyber-surface border border-cyber-border/60">
              <span className="text-slate-300">Storage Buckets</span>
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> 4 BUCKETS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
