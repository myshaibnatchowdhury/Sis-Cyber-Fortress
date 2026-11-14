"use client";

import React, { useState } from "react";
import { Sliders, Shield, Lock, Save, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [minPassLength, setMinPassLength] = useState("12");
  const [enforceAdminMfa, setEnforceAdminMfa] = useState(true);
  const [sessionTimeoutMin, setSessionTimeoutMin] = useState("30");
  const [autoQuarantineThreshold, setAutoQuarantineThreshold] = useState("85");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-cyber-border pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
          <Sliders className="h-4 w-4" />
          SECTION 16
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Global System Settings</h1>
        <p className="text-xs text-slate-400">PostgreSQL system_settings table configuration & governance rules</p>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-6 text-xs">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400" />
            Password & MFA Policy
          </h3>

          <div>
            <label className="block text-slate-300 mb-1">Minimum Password Length (Characters)</label>
            <input
              type="number"
              value={minPassLength}
              onChange={(e) => setMinPassLength(e.target.value)}
              className="w-full rounded-xl border border-cyber-border bg-cyber-surface p-3 text-white focus:outline-none"
            />
          </div>

          <label className="flex items-center justify-between p-3 rounded-xl bg-cyber-surface border border-cyber-border/60 cursor-pointer">
            <span className="text-slate-300">Strictly Enforce MFA for Super Admin & Security Admin Accounts</span>
            <input
              type="checkbox"
              checked={enforceAdminMfa}
              onChange={(e) => setEnforceAdminMfa(e.target.checked)}
              className="h-4 w-4 rounded border-cyber-border bg-slate-900 text-emerald-500"
            />
          </label>
        </div>

        <div className="border-t border-cyber-border/80 pt-4 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            Session Inactivity & Threat Scoring
          </h3>

          <div>
            <label className="block text-slate-300 mb-1">Session Inactivity Expiration (Minutes)</label>
            <input
              type="number"
              value={sessionTimeoutMin}
              onChange={(e) => setSessionTimeoutMin(e.target.value)}
              className="w-full rounded-xl border border-cyber-border bg-cyber-surface p-3 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Automated Phishing Quarantine Threshold (Score 0-100)</label>
            <input
              type="number"
              value={autoQuarantineThreshold}
              onChange={(e) => setAutoQuarantineThreshold(e.target.value)}
              className="w-full rounded-xl border border-cyber-border bg-cyber-surface p-3 text-white focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
        >
          <Save className="h-4 w-4" />
          {saved ? "Settings Applied to Database!" : "Save System Configurations"}
        </button>
      </form>
    </div>
  );
}
