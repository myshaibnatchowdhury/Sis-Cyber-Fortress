"use client";

import React from "react";
import { ScanLine, Globe, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function AdminScansPage() {
  const scans = [
    {
      id: "scan-1",
      target: "https://sis-cyberfortress.internal",
      score: 95,
      tls_valid: true,
      findings_count: 1,
      ssrf_status: "PASSED (Clean Egress)",
      timestamp: "1 hour ago",
    },
    {
      id: "scan-2",
      target: "https://api.enterprise-defense.com",
      score: 80,
      tls_valid: true,
      findings_count: 2,
      ssrf_status: "PASSED (Clean Egress)",
      timestamp: "4 hours ago",
    },
    {
      id: "scan-3",
      target: "http://169.254.169.254 (Simulated Attack)",
      score: 0,
      tls_valid: false,
      findings_count: 0,
      ssrf_status: "BLOCKED (Cloud Metadata)",
      timestamp: "1 day ago",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-cyber-border pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-bold uppercase">
          <ScanLine className="h-4 w-4" />
          SECTION 09
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Website Scan Management</h1>
        <p className="text-xs text-slate-400">Enterprise vulnerability assessment logs & SSRF enforcement telemetry</p>
      </div>

      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-cyber-border text-slate-400 font-mono">
              <tr>
                <th className="pb-3">Scanned Target URL</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">TLS</th>
                <th className="pb-3">SSRF Policy Check</th>
                <th className="pb-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/60">
              {scans.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/40">
                  <td className="py-3 font-semibold text-white font-mono max-w-sm truncate">{s.target}</td>
                  <td className="py-3 font-mono font-bold text-emerald-400">{s.score}/100</td>
                  <td className="py-3">
                    {s.tls_valid ? (
                      <span className="text-emerald-400 font-mono">TLS 1.3</span>
                    ) : (
                      <span className="text-rose-400 font-mono">NONE</span>
                    )}
                  </td>
                  <td className="py-3 font-mono">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        s.ssrf_status.startsWith("BLOCKED")
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {s.ssrf_status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 font-mono">{s.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
