"use client";

import React, { useState } from "react";
import { AlertTriangle, ShieldCheck, CheckCircle2, Filter, Bell, Clock, RefreshCw } from "lucide-react";

export default function CyberSOCPage() {
  const [alerts, setAlerts] = useState([
    {
      id: "alr-1",
      alert_reference: "ALR-2026-X99",
      title: "Phishing Link Submission Quarantined",
      description: "User scanned homoglyph domain impersonating banking credentials. URL blocked.",
      severity: "high",
      source_module: "phishing_shield",
      is_resolved: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "alr-2",
      alert_reference: "ALR-2026-X98",
      title: "Android Endpoint Heartbeat Synchronized",
      description: "Pixel 8 Pro completed periodic background integrity check. 0 root indicators.",
      severity: "info",
      source_module: "endpoint_guardian",
      is_resolved: true,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "alr-3",
      alert_reference: "ALR-2026-X97",
      title: "WebShield Header Policy Gap Detected",
      description: "Assessed web property is missing Content-Security-Policy (CSP) headers.",
      severity: "medium",
      source_module: "webshield",
      is_resolved: false,
      created_at: new Date(Date.now() - 14400000).toISOString(),
    },
  ]);

  const [filterSeverity, setFilterSeverity] = useState("all");

  const resolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_resolved: true } : a))
    );
  };

  const filtered = alerts.filter(
    (a) => filterSeverity === "all" || a.severity === filterSeverity
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-bold uppercase">
            <AlertTriangle className="h-4 w-4" />
            MODULE 12
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">SIS Cyber SOC Command</h1>
          <p className="text-xs text-slate-400">Unified 24/7 incident queue, severity prioritization & alert lifecycle</p>
        </div>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="rounded-xl border border-cyber-border bg-cyber-card px-4 py-2 text-xs text-slate-300 focus:outline-none"
        >
          <option value="all">All Alert Severities</option>
          <option value="critical">Critical Only</option>
          <option value="high">High Only</option>
          <option value="medium">Medium Only</option>
          <option value="info">Info Only</option>
        </select>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-4">
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-2xl border p-6 transition-all ${
              alert.is_resolved
                ? "border-cyber-border bg-cyber-card/60 opacity-70"
                : "border-cyber-border bg-cyber-card shadow-lg"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">{alert.alert_reference}</span>
                <span className="rounded bg-slate-900 border border-cyber-border px-2 py-0.5 text-[10px] font-mono uppercase text-slate-400">
                  {alert.source_module}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded px-2.5 py-0.5 text-[10px] font-mono uppercase font-bold ${
                    alert.severity === "critical"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      : alert.severity === "high"
                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                      : alert.severity === "medium"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {alert.severity}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(alert.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="pt-3 space-y-1">
              <h3 className="text-sm font-bold text-white">{alert.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{alert.description}</p>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                <span>Status: {alert.is_resolved ? "Resolved & Closed" : "Open • Awaiting Triage"}</span>
              </div>
              {!alert.is_resolved && (
                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 font-bold text-emerald-400 hover:bg-emerald-500/20"
                >
                  Acknowledge & Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
