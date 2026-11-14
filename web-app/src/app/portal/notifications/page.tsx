"use client";

import React from "react";
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function NotificationsPage() {
  const notifications = [
    {
      title: "Welcome to SIS Cyber Fortress",
      message: "Your zero-trust cybersecurity ecosystem is active. Review your Identity and Endpoint security status.",
      type: "info",
      time: "Recent",
    },
    {
      title: "Automated Threat Intel Feed Synced",
      message: "3 new high-confidence CISA/Abuse.ch indicators ingested into Threat Intelligence module.",
      type: "success",
      time: "2 hours ago",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-cyber-border pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Security Notifications</h1>
        <p className="text-xs text-slate-400">System alerts and threat intelligence notifications</p>
      </div>

      <div className="space-y-3">
        {notifications.map((n, idx) => (
          <div key={idx} className="rounded-2xl border border-cyber-border bg-cyber-card p-5 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-emerald-400" />
                {n.title}
              </span>
              <span className="text-slate-500 font-mono text-[11px]">{n.time}</span>
            </div>
            <p className="text-slate-400 pl-6 leading-relaxed">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
