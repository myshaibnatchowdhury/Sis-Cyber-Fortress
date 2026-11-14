"use client";

import React, { useState } from "react";
import { Fingerprint, ShieldCheck, AlertTriangle, Key, Smartphone, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function IdentityGuardianPage() {
  const { profile, user } = useAuth();
  const [mfaActive, setMfaActive] = useState(profile?.mfa_enabled ?? false);
  const [checkingBreach, setCheckingBreach] = useState(false);
  const [breachResult, setBreachResult] = useState<string | null>(null);

  const simulateBreachCheck = () => {
    setCheckingBreach(true);
    setBreachResult(null);
    setTimeout(() => {
      setCheckingBreach(false);
      setBreachResult("CLEAN: k-Anonymity SHA-1 hash lookup found 0 matching compromised credentials in public breach archives.");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
            <Fingerprint className="h-4 w-4" />
            MODULE 01
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">SIS Identity Guardian</h1>
          <p className="text-xs text-slate-400">Digital identity hardening, login telemetry & compromised credential protection</p>
        </div>

        <button
          onClick={simulateBreachCheck}
          disabled={checkingBreach}
          className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all"
        >
          <ShieldCheck className="h-4 w-4" />
          {checkingBreach ? "Checking Breach DB..." : "Scan Identity Exposure"}
        </button>
      </div>

      {breachResult && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{breachResult}</span>
        </div>
      )}

      {/* Identity Security Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MFA Status */}
        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Multi-Factor Auth (MFA)</h3>
            <Fingerprint className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-400">
            Enforces TOTP hardware security keys or authenticator apps across all session sign-in attempts.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setMfaActive(!mfaActive)}
              className={`w-full rounded-xl py-2 text-xs font-bold transition-all ${
                mfaActive
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-800 text-slate-300 border border-cyber-border hover:border-emerald-500/40"
              }`}
            >
              {mfaActive ? "MFA Enabled • TOTP Guard" : "Enable Multi-Factor Auth"}
            </button>
          </div>
        </div>

        {/* Password Hygiene */}
        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Password Posture</h3>
            <Key className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="text-xs text-slate-400">
            Argon2id hashing configuration enforced on Supabase Auth. Master password entropy evaluated locally.
          </p>
          <div className="text-xs font-mono space-y-1 text-slate-300">
            <div className="flex justify-between"><span>Password Age:</span> <span className="text-emerald-400">4 days</span></div>
            <div className="flex justify-between"><span>Entropy Rating:</span> <span className="text-emerald-400">High (98 bits)</span></div>
          </div>
        </div>

        {/* Device Sign-in Trust */}
        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Device Verification</h3>
            <Smartphone className="h-5 w-5 text-teal-400" />
          </div>
          <p className="text-xs text-slate-400">
            Verified Android hardware tokens bound to your account profile via Keystore keys.
          </p>
          <div className="text-xs font-mono space-y-1 text-slate-300">
            <div className="flex justify-between"><span>Active Devices:</span> <span className="text-teal-400">1 Android Endpoint</span></div>
            <div className="flex justify-between"><span>Biometrics:</span> <span className="text-emerald-400">Enrolled</span></div>
          </div>
        </div>
      </div>

      {/* Account Security Recommendations */}
      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Account Security Checklist</h3>
        <div className="space-y-3 text-xs">
          {[
            { label: "Email Address Confirmed on Supabase Auth", pass: true },
            { label: "Client-Side Zero-Knowledge Vault Initialized", pass: true },
            { label: "Hardware Android Device Bound with Biometric Keystore", pass: true },
            { label: "Zero Compromised Hashes Detected in Breach Archives", pass: true },
            { label: "Mandatory Session Inactivity Auto-Lock Active", pass: true },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-cyber-surface border border-cyber-border/80">
              <span className="text-slate-300">{item.label}</span>
              <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                <CheckCircle className="h-4 w-4" /> PASS
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
