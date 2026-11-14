"use client";

import React from "react";
import { History, Shield, Key, Smartphone, Globe, Lock } from "lucide-react";

export default function ActivityHistoryPage() {
  const activities = [
    { action: "Encrypted Vault Snapshot Created", module: "Vault Guardian", time: "1 hour ago", icon: Key },
    { action: "Android Keystore Verification Heartbeat", module: "Endpoint Guardian", time: "3 hours ago", icon: Smartphone },
    { action: "Authorized WebShield Assessment Completed", module: "WebShield", time: "1 day ago", icon: Globe },
    { action: "Master Passphrase Authenticated via Web Crypto", module: "Identity Guardian", time: "2 days ago", icon: Lock },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-cyber-border pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Security Activity History</h1>
        <p className="text-xs text-slate-400">Chronological telemetry stream of your account security actions</p>
      </div>

      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 divide-y divide-cyber-border/60">
        {activities.map((a, idx) => {
          const Icon = a.icon;
          return (
            <div key={idx} className="py-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-cyber-border text-emerald-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">{a.action}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{a.module}</div>
                </div>
              </div>
              <span className="text-slate-400 font-mono">{a.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
