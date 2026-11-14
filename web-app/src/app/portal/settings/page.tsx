"use client";

import React, { useState } from "react";
import { Settings, Shield, Lock, Bell, CheckCircle2 } from "lucide-react";

export default function SecuritySettingsPage() {
  const [telemetry, setTelemetry] = useState(true);
  const [phishingAlerts, setPhishingAlerts] = useState(true);
  const [autoLockMin, setAutoLockMin] = useState("5");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-cyber-border pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Security & Privacy Settings</h1>
        <p className="text-xs text-slate-400">Consent controls, session auto-lock & notification preferences</p>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-6 text-xs">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400" />
            Vault Auto-Lock Interval
          </h3>
          <select
            value={autoLockMin}
            onChange={(e) => setAutoLockMin(e.target.value)}
            className="w-full rounded-xl border border-cyber-border bg-cyber-surface p-3 text-white focus:outline-none"
          >
            <option value="1">1 Minute (Maximum Paranoia)</option>
            <option value="5">5 Minutes (Recommended)</option>
            <option value="15">15 Minutes</option>
            <option value="30">30 Minutes</option>
          </select>
        </div>

        <div className="border-t border-cyber-border/80 pt-4 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            Privacy Consents & Telemetry
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-cyber-surface border border-cyber-border/60 cursor-pointer">
              <span className="text-slate-300">Allow Hardware Endpoint Telemetry to Supabase</span>
              <input
                type="checkbox"
                checked={telemetry}
                onChange={(e) => setTelemetry(e.target.checked)}
                className="h-4 w-4 rounded border-cyber-border bg-slate-900 text-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-cyber-surface border border-cyber-border/60 cursor-pointer">
              <span className="text-slate-300">High-Risk Phishing In-App Push Alerts</span>
              <input
                type="checkbox"
                checked={phishingAlerts}
                onChange={(e) => setPhishingAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-cyber-border bg-slate-900 text-emerald-500"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
        >
          {saved ? "Settings Saved!" : "Save Preferences"}
        </button>
      </form>
    </div>
  );
}
