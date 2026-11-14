"use client";

import React, { useState } from "react";
import { HeartPulse, CheckCircle2, RefreshCw, Cpu, Activity, Clock } from "lucide-react";

export default function AdminHealthPage() {
  const [refreshing, setRefreshing] = useState(false);

  const refreshTelemetry = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
            <HeartPulse className="h-4 w-4" />
            SECTION 19
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">System Health & Telemetry</h1>
          <p className="text-xs text-slate-400">Real-time health probes, Edge Function latencies & uptime monitors</p>
        </div>

        <button
          onClick={refreshTelemetry}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Polling Diagnostics..." : "Poll Health Telemetry"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Database Engine Uptime</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">99.98%</div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Zero unplanned outages
          </div>
        </div>

        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Edge Function Cold Start</span>
            <Cpu className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">48ms</div>
          <div className="text-[11px] text-slate-400 font-mono">Deno runtime V8 isolates</div>
        </div>

        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Global Response Time</span>
            <Clock className="h-4 w-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">22ms avg</div>
          <div className="text-[11px] text-slate-400 font-mono">Edge CDN cached assets</div>
        </div>
      </div>
    </div>
  );
}
