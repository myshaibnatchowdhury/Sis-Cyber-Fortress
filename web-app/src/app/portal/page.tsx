"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  Smartphone,
  Key,
  Globe,
  Radio,
  Fingerprint,
  Wifi,
  Lock,
  Search,
  Flame,
  CloudUpload,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function PortalOverviewPage() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    deviceCount: 1,
    vaultItemCount: 3,
    alertCount: 2,
    scanCount: 5,
  });
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function loadOverview() {
      if (!isSupabaseConfigured || !user) {
        // Fallback demo records
        setRecentAlerts([
          {
            id: "1",
            title: "Phishing Attempt Intercepted",
            severity: "high",
            source_module: "phishing_shield",
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "2",
            title: "New Android Device Registered",
            severity: "info",
            source_module: "endpoint_guardian",
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
        ]);
        return;
      }

      try {
        const [
          { count: devCount },
          { count: vCount },
          { count: aCount },
          { count: sCount },
          { data: alerts },
        ] = await Promise.all([
          supabase.from("registered_devices").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("encrypted_vault_items").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("security_alerts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("phishing_scans").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("security_alerts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
        ]);

        setStats({
          deviceCount: devCount ?? 1,
          vaultItemCount: vCount ?? 0,
          alertCount: aCount ?? 0,
          scanCount: sCount ?? 0,
        });

        if (alerts && alerts.length > 0) {
          setRecentAlerts(alerts);
        }
      } catch (err) {
        console.error("Error loading portal overview:", err);
      }
    }

    loadOverview();
  }, [user]);

  const securityScore = profile?.security_score ?? 85;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyber-border bg-gradient-to-r from-cyber-surface via-cyber-card to-cyber-surface p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              FORTRESS DEFENSE ACTIVE
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {profile?.full_name || "Security Officer"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              All 12 security modules are synchronized with your shared Supabase backend. Review your posture and active telemetry below.
            </p>
          </div>

          {/* Security Score Widget */}
          <div className="shrink-0 flex items-center gap-4 rounded-xl border border-cyber-border bg-slate-900/80 p-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono font-bold text-lg">
              {securityScore}
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-slate-400">Overall Posture</div>
              <div className="text-sm font-bold text-white">
                {securityScore >= 90 ? "Hardened" : securityScore >= 75 ? "Protected" : "At Risk"}
              </div>
              <div className="text-[11px] text-emerald-400">Top 5% Enterprise Tier</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Registered Devices</span>
            <Smartphone className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{stats.deviceCount}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Android Keystore Active
          </div>
        </div>

        <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Encrypted Vault Items</span>
            <Key className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{stats.vaultItemCount}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Zero-Knowledge AES-GCM
          </div>
        </div>

        <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Security Alerts</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{stats.alertCount}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Triaged in Cyber SOC
          </div>
        </div>

        <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Scans Run</span>
            <Globe className="h-4 w-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{stats.scanCount}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" /> SSRF-Shield Protected
          </div>
        </div>
      </div>

      {/* 12 Modules Quick Launcher */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            12-in-1 Module Command Deck
          </h2>
          <span className="text-xs text-cyber-muted font-mono">ALL MODULES ONLINE</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { id: "01", name: "Identity", path: "/portal/identity", icon: Fingerprint, color: "text-emerald-400" },
            { id: "02", name: "Phishing", path: "/portal/phishing", icon: Radio, color: "text-cyan-400" },
            { id: "03", name: "Endpoint", path: "/portal/endpoint", icon: Smartphone, color: "text-blue-400" },
            { id: "04", name: "Network", path: "/portal/network", icon: Wifi, color: "text-teal-400" },
            { id: "05", name: "Vault", path: "/portal/vault", icon: Key, color: "text-amber-400" },
            { id: "06", name: "Ransomware", path: "/portal/ransomware", icon: Lock, color: "text-rose-400" },
            { id: "07", name: "WebShield", path: "/portal/webshield", icon: Globe, color: "text-indigo-400" },
            { id: "08", name: "Forensics", path: "/portal/forensics", icon: Search, color: "text-purple-400" },
            { id: "09", name: "Access", path: "/portal/access", icon: ShieldCheck, color: "text-sky-400" },
            { id: "10", name: "Threat Intel", path: "/portal/threat-intelligence", icon: Flame, color: "text-orange-400" },
            { id: "11", name: "Cloud Backup", path: "/portal/backup", icon: CloudUpload, color: "text-emerald-400" },
            { id: "12", name: "Cyber SOC", path: "/portal/soc", icon: AlertTriangle, color: "text-red-400" },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.id}
                href={m.path}
                className="group rounded-xl border border-cyber-border bg-cyber-card p-3.5 transition-all hover:bg-slate-900 hover:border-emerald-500/40 text-center flex flex-col items-center justify-center gap-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-cyber-border group-hover:border-emerald-500/50">
                  <Icon className={`h-5 w-5 ${m.color}`} />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-500">M-{m.id}</div>
                  <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    {m.name}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Alerts Feed */}
      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-cyber-border/80 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Live SOC Alerts Feed</h3>
          </div>
          <Link href="/portal/soc" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
            View All in SOC <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-cyber-border/60">
          {recentAlerts.map((alt) => (
            <div key={alt.id} className="py-3 flex items-center justify-between text-xs">
              <div className="space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      alt.severity === "critical"
                        ? "bg-rose-500"
                        : alt.severity === "high"
                        ? "bg-orange-500"
                        : "bg-emerald-400"
                    }`}
                  />
                  {alt.title}
                </div>
                <div className="text-[11px] text-cyber-muted font-mono">
                  SOURCE: {alt.source_module.toUpperCase()} • {new Date(alt.created_at).toLocaleTimeString()}
                </div>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase font-bold ${
                  alt.severity === "critical"
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    : alt.severity === "high"
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {alt.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
