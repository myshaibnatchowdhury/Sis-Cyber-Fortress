"use client";

import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  Flame,
  Radio,
  UserCheck,
  AlertOctagon,
  KeyRound,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface DeviceItem {
  id: string;
  user_id: string;
  device_identifier: string;
  device_name: string;
  device_model: string;
  os_type: string;
  os_version: string;
  app_version: string;
  is_rooted: boolean;
  biometrics_available: boolean;
  security_patch_level: string;
  last_sync_at: string;
  status: "active" | "lost" | "quarantined" | "revoked";
  profiles?: {
    email?: string;
    full_name?: string;
    is_suspended?: boolean;
  };
}

export default function AdminDevicesPage() {
  const { user } = useAuth();
  const [fleet, setFleet] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/device-control");
      const data = await res.json();
      if (data.devices) {
        setFleet(data.devices);
      }
    } catch (err) {
      console.error("Failed to fetch devices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleDeviceAction = async (deviceId: string, action: "stolen" | "quarantine" | "revoke" | "activate", reason?: string) => {
    setActionLoading(deviceId);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/device-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          device_id: deviceId,
          reason: reason || `Admin command executed: ${action}`,
          actor_email: user?.email || "superadmin@sis-cyberfortress.internal",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(data.message);
        // Refresh local list
        setFleet((prev) =>
          prev.map((d) => (d.id === deviceId ? { ...d, status: data.status } : d))
        );
      } else {
        alert("Action failed: " + data.error);
      }
    } catch (err: any) {
      alert("Error executing command: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = fleet.filter((d) => {
    if (filter === "all") return true;
    return d.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
            <Smartphone className="h-4 w-4" />
            SECTION 04 • ENTERPRISE FLEET
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Mobile Endpoint & Anti-Theft Command</h1>
          <p className="text-xs text-slate-400">
            Real-time telemetry, remote killswitch, stolen lockdown & MDM enforcement across registered Android devices
          </p>
        </div>

        <button
          onClick={fetchDevices}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-cyber-card border border-cyber-border px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          Sync Fleet
        </button>
      </div>

      {statusMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Fleet Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-cyber-border bg-cyber-card p-4">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Total Endpoints</div>
          <div className="text-2xl font-bold text-white mt-1">{fleet.length}</div>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="text-[10px] font-mono text-emerald-400 uppercase">Active & Compliant</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {fleet.filter((d) => d.status === "active").length}
          </div>
        </div>
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
          <div className="text-[10px] font-mono text-rose-400 uppercase">Stolen / Lost Flagged</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {fleet.filter((d) => d.status === "lost").length}
          </div>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="text-[10px] font-mono text-amber-400 uppercase">Quarantined / Locked</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {fleet.filter((d) => d.status === "quarantined" || d.status === "revoked").length}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex gap-2 border-b border-cyber-border/60 pb-3 overflow-x-auto text-xs font-mono">
        {["all", "active", "lost", "quarantined", "revoked"].map((statusKey) => (
          <button
            key={statusKey}
            onClick={() => setFilter(statusKey)}
            className={`rounded-lg px-3 py-1.5 uppercase font-semibold transition-colors ${
              filter === statusKey
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            {statusKey === "lost" ? "🚨 Stolen / Lost" : statusKey}
          </button>
        ))}
      </div>

      {/* Fleet Table */}
      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
            Loading registered enterprise devices...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <Smartphone className="h-8 w-8 text-slate-600 mx-auto" />
            <p>No registered mobile endpoints found matching this filter.</p>
            <p className="text-[11px] text-slate-500">
              When users sign in from the Android APK, their devices automatically register and appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-cyber-border text-slate-400 font-mono">
                <tr>
                  <th className="pb-3">Device & User Profile</th>
                  <th className="pb-3">Hardware & Platform</th>
                  <th className="pb-3">Integrity & Keystore</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Last Sync</th>
                  <th className="pb-3 text-right">Admin Anti-Theft Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/60">
                {filtered.map((d) => {
                  const isActionBusy = actionLoading === d.id;
                  return (
                    <tr key={d.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          {d.device_name}
                          {d.status === "lost" && (
                            <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-400 border border-rose-500/30">
                              STOLEN
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                          {d.profiles?.email || "Unassociated User"}
                        </div>
                        {d.profiles?.full_name && (
                          <div className="text-[10px] text-slate-400">{d.profiles.full_name}</div>
                        )}
                      </td>
                      <td className="py-3.5 font-mono text-slate-300">
                        <div>{d.device_model || "Android Phone"}</div>
                        <div className="text-[10px] text-slate-500">{d.os_version || "Android 14 (API 34)"}</div>
                      </td>
                      <td className="py-3.5">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono ${
                              d.is_rooted
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {d.is_rooted ? "⚠️ ROOT DETECTED" : "✓ NON-ROOTED"}
                          </span>
                          <div>
                            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              {d.biometrics_available ? "Biometric Ready" : "PIN Locked"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase font-bold ${
                            d.status === "lost"
                              ? "bg-rose-600/20 text-rose-300 border border-rose-500 animate-pulse"
                              : d.status === "quarantined"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              : d.status === "revoked"
                              ? "bg-slate-800 text-slate-400 border border-slate-700"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {d.status === "lost" ? "🚨 STOLEN" : d.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                        {new Date(d.last_sync_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        <div className="text-[10px] text-slate-500">
                          {new Date(d.last_sync_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* If stolen or quarantined, allow admin to reactivate */}
                          {d.status === "lost" || d.status === "quarantined" || d.status === "revoked" ? (
                            <button
                              onClick={() => handleDeviceAction(d.id, "activate")}
                              disabled={isActionBusy}
                              className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            >
                              {isActionBusy ? "..." : "Unlock & Restore"}
                            </button>
                          ) : (
                            <>
                              {/* Mark as Stolen */}
                              <button
                                onClick={() => {
                                  if (confirm(`CRITICAL: Mark ${d.device_name} as STOLEN? This immediately locks out the thief and freezes all profile credentials.`)) {
                                    handleDeviceAction(d.id, "stolen");
                                  }
                                }}
                                disabled={isActionBusy}
                                className="rounded-lg bg-rose-600/20 border border-rose-500/40 px-2.5 py-1 text-[11px] font-bold text-rose-300 hover:bg-rose-600/30 transition-colors"
                                title="Report device as stolen - immediately freezes mobile access"
                              >
                                {isActionBusy ? "..." : "🚨 Mark Stolen"}
                              </button>

                              {/* Remote Quarantine */}
                              <button
                                onClick={() => handleDeviceAction(d.id, "quarantine")}
                                disabled={isActionBusy}
                                className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[11px] font-bold text-amber-400 hover:bg-amber-500/20 transition-colors"
                                title="Remotely quarantine device"
                              >
                                {isActionBusy ? "..." : "Lockdown"}
                              </button>
                            </>
                          )}

                          {/* Remote Wipe */}
                          {d.status !== "revoked" && (
                            <button
                              onClick={() => {
                                if (confirm(`WARNING: Revoke & Remote Wipe ${d.device_name}? All local tokens, cached passwords, and vault ciphers will be erased from the phone.`)) {
                                  handleDeviceAction(d.id, "revoke");
                                }
                              }}
                              disabled={isActionBusy}
                              className="rounded-lg bg-slate-800 border border-cyber-border px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                              title="Remote Wipe and Revoke"
                            >
                              Wipe
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
