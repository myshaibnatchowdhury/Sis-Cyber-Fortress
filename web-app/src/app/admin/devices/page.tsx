"use client";

import React, { useState } from "react";
import { Smartphone, Shield, CheckCircle2, AlertTriangle, RefreshCw, Trash2 } from "lucide-react";

export default function AdminDevicesPage() {
  const [fleet, setFleet] = useState([
    {
      id: "dev-1",
      user_email: "superadmin@sis-cyberfortress.internal",
      device_name: "Pixel 8 Pro (Root Defense)",
      device_model: "Google Pixel 8 Pro",
      os_version: "Android 14 (API 34)",
      is_rooted: false,
      biometrics_available: true,
      status: "active",
      last_sync: "2 mins ago",
    },
    {
      id: "dev-2",
      user_email: "secops.lead@enterprise.com",
      device_name: "Samsung Galaxy S24 Ultra",
      device_model: "SM-S928B",
      os_version: "Android 14 (API 34)",
      is_rooted: false,
      biometrics_available: true,
      status: "active",
      last_sync: "1 hour ago",
    },
  ]);

  const quarantineDevice = (id: string) => {
    setFleet((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: d.status === "quarantined" ? "active" : "quarantined" } : d))
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-cyber-border pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
          <Smartphone className="h-4 w-4" />
          SECTION 04
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Enterprise Device Management</h1>
        <p className="text-xs text-slate-400">Fleet telemetry, root compliance audit & device quarantine controls</p>
      </div>

      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-cyber-border text-slate-400 font-mono">
              <tr>
                <th className="pb-3">Device & User</th>
                <th className="pb-3">Hardware Model & OS</th>
                <th className="pb-3">Keystore Security</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Quarantine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/60">
              {fleet.map((d) => (
                <tr key={d.id} className="hover:bg-slate-900/40">
                  <td className="py-3">
                    <div className="font-semibold text-white">{d.device_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{d.user_email}</div>
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    <div>{d.device_model}</div>
                    <div className="text-[10px] text-slate-500">{d.os_version}</div>
                  </td>
                  <td className="py-3 font-mono">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> BIOMETRIC VERIFIED
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase font-bold ${
                        d.status === "quarantined"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => quarantineDevice(d.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        d.status === "quarantined"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {d.status === "quarantined" ? "Unquarantine" : "Quarantine Device"}
                    </button>
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
