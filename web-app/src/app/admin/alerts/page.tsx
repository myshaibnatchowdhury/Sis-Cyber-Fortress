"use client";

import React, { useState } from "react";
import { AlertOctagon, CheckCircle2, Shield, Filter } from "lucide-react";

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState([
    {
      id: "alr-1",
      reference: "ALR-2026-X99",
      title: "Phishing Link Quarantined by Engine",
      module: "phishing_shield",
      severity: "high",
      status: "unresolved",
      timestamp: "10 mins ago",
    },
    {
      id: "alr-2",
      reference: "ALR-2026-X98",
      title: "Missing Content-Security-Policy on External Asset",
      module: "webshield",
      severity: "medium",
      status: "unresolved",
      timestamp: "1 hour ago",
    },
    {
      id: "alr-3",
      reference: "ALR-2026-X97",
      title: "High-Entropy Subdomain Identified",
      module: "threat_intel",
      severity: "critical",
      status: "resolved",
      timestamp: "3 hours ago",
    },
  ]);

  const resolve = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "resolved" } : a))
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-cyber-border pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-rose-400 font-bold uppercase">
          <AlertOctagon className="h-4 w-4" />
          SECTION 06
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Global Security Alerts</h1>
        <p className="text-xs text-slate-400">Triaged security events dispatched from all 12 modules</p>
      </div>

      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-cyber-border text-slate-400 font-mono">
              <tr>
                <th className="pb-3">Alert Reference</th>
                <th className="pb-3">Title & Source</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/60">
              {alerts.map((a) => (
                <tr key={a.id} className="hover:bg-slate-900/40">
                  <td className="py-3 font-mono font-bold text-slate-300">{a.reference}</td>
                  <td className="py-3">
                    <div className="font-semibold text-white">{a.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">{a.module} • {a.timestamp}</div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase font-bold ${
                        a.severity === "critical"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : a.severity === "high"
                          ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {a.severity}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase font-bold ${
                        a.status === "resolved"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border border-cyber-border"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {a.status !== "resolved" && (
                      <button
                        onClick={() => resolve(a.id)}
                        className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"
                      >
                        Resolve Alert
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
