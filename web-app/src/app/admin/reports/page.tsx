"use client";

import React from "react";
import { BarChart3, TrendingUp, ShieldCheck, Download, Calendar } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
            <BarChart3 className="h-4 w-4" />
            SECTION 14
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Reports & Analytics</h1>
          <p className="text-xs text-slate-400">Enterprise threat metrics, vulnerability trends & compliance reports</p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
        >
          <Download className="h-4 w-4" />
          Export Executive Briefing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-3">
          <div className="text-xs text-slate-400">Monthly Incident Resolution Rate</div>
          <div className="text-3xl font-bold font-mono text-emerald-400">94.8%</div>
          <div className="text-[11px] text-slate-500 font-mono">Average Mean Time to Detect (MTTD): 18 mins</div>
        </div>

        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-3">
          <div className="text-xs text-slate-400">Phishing Links Intercepted</div>
          <div className="text-3xl font-bold font-mono text-cyan-400">42 URLs</div>
          <div className="text-[11px] text-slate-500 font-mono">100% blocked before user interaction</div>
        </div>

        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-3">
          <div className="text-xs text-slate-400">Android Fleet Security Compliance</div>
          <div className="text-3xl font-bold font-mono text-teal-400">100%</div>
          <div className="text-[11px] text-slate-500 font-mono">Zero unpatched or rooted endpoints</div>
        </div>
      </div>
    </div>
  );
}
