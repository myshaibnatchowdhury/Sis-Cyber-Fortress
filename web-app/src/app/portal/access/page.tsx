"use client";

import React, { useState } from "react";
import { Shield, Smartphone, Globe, LogOut, CheckCircle2, AlertTriangle, Key } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AccessGuardianPage() {
  const { profile, roles, logout } = useAuth();
  const [sessions, setSessions] = useState([
    {
      id: "sess-1",
      device: "Next.js Web Browser (Chrome on Windows 11)",
      ip: "103.114.98.24",
      location: "Dhaka, Bangladesh",
      lastActive: "Active Now",
      isCurrent: true,
    },
    {
      id: "sess-2",
      device: "Android Jetpack Compose (Pixel 8 Pro)",
      ip: "103.114.98.24",
      location: "Dhaka, Bangladesh",
      lastActive: "15 minutes ago",
      isCurrent: false,
    },
  ]);

  const revokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-bold uppercase">
            <Shield className="h-4 w-4" />
            MODULE 09
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">SIS Access Guardian</h1>
          <p className="text-xs text-slate-400">Session lifecycle control, remote token revocation & privilege verification</p>
        </div>

        <button
          onClick={() => logout()}
          className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
        >
          <LogOut className="h-4 w-4" />
          Terminate All Sessions
        </button>
      </div>

      {/* Role & Privileges Overview */}
      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="h-4 w-4 text-sky-400" />
          Verified Server-Side RBAC Roles
        </h3>
        <div className="flex flex-wrap gap-2 text-xs">
          {roles.map((r) => (
            <span
              key={r}
              className="rounded-lg bg-sky-500/10 border border-sky-500/30 px-3 py-1 font-mono font-bold text-sky-300 uppercase"
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Active Concurrent Sessions</h3>
        <div className="divide-y divide-cyber-border/60">
          {sessions.map((sess) => (
            <div key={sess.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-cyber-border text-slate-300">
                  {sess.device.includes("Android") ? <Smartphone className="h-5 w-5 text-emerald-400" /> : <Globe className="h-5 w-5 text-sky-400" />}
                </div>
                <div className="space-y-0.5">
                  <div className="font-semibold text-white flex items-center gap-2">
                    {sess.device}
                    {sess.isCurrent && (
                      <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-mono">
                        THIS CLIENT
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    IP: {sess.ip} • {sess.location} • {sess.lastActive}
                  </div>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  onClick={() => revokeSession(sess.id)}
                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-500/20"
                >
                  Revoke Token
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
