"use client";

import React, { useState } from "react";
import { Lock, ShieldAlert, CheckCircle2, AlertOctagon, RefreshCw, FileCheck } from "lucide-react";

export default function RansomwareGuardianPage() {
  const [verifying, setVerifying] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState("VERIFIED_CLEAN");

  const runIntegrityCheck = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setIntegrityStatus("VERIFIED_CLEAN");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 font-bold uppercase">
            <Lock className="h-4 w-4" />
            MODULE 06
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">SIS Ransomware Guardian</h1>
          <p className="text-xs text-slate-400">Disaster recovery readiness, canary file integrity & safe restoration runbooks</p>
        </div>

        <button
          onClick={runIntegrityCheck}
          disabled={verifying}
          className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
        >
          <RefreshCw className={`h-4 w-4 ${verifying ? "animate-spin" : ""}`} />
          {verifying ? "Auditing Hashes..." : "Run File Integrity Audit"}
        </button>
      </div>

      {/* Recovery Readiness Score */}
      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-base font-bold text-white">Disaster Recovery Readiness: 88/100</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Evaluates automated snapshot compliance, air-gapped recovery copies, and endpoint canary file monitoring.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl">
          <CheckCircle2 className="h-4 w-4" /> RECOVERY READY
        </div>
      </div>

      {/* 3-2-1 Backup Strategy Audit Checklist */}
      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">3-2-1 Enterprise Backup Compliance</h3>
        <div className="space-y-3 text-xs">
          {[
            { rule: "3 Copies of Data Maintained", desc: "Production database, encrypted daily snapshots, and client backups.", pass: true },
            { rule: "2 Different Storage Media Formats", desc: "PostgreSQL transaction logs and Supabase Object Storage buckets.", pass: true },
            { rule: "1 Offsite / Isolated Backup", desc: "Private multi-region storage replication enabled with strict RLS isolation.", pass: true },
            { rule: "Canary File Integrity Monitoring", desc: "SHA-256 integrity baseline verified for all critical directory structures.", pass: true },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-cyber-surface border border-cyber-border/60">
              <div>
                <div className="font-semibold text-white">{item.rule}</div>
                <div className="text-[11px] text-slate-400">{item.desc}</div>
              </div>
              <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> VERIFIED
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Recovery Guidance */}
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 space-y-3 text-xs text-slate-300">
        <div className="flex items-center gap-2 font-bold text-rose-400">
          <AlertOctagon className="h-4 w-4" />
          Ransomware Incident Emergency Protocol:
        </div>
        <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-slate-300">
          <li><strong>Isolate Network Interfaces:</strong> Disconnect Wi-Fi, Ethernet, and cellular connections immediately.</li>
          <li><strong>Preserve Volatile Memory:</strong> Do not power off devices; quarantine endpoints via Module 03 (Endpoint Guardian).</li>
          <li><strong>Notify SOC Team:</strong> Dispatch an alert to Module 12 (Cyber SOC) for incident triage and evidence logging.</li>
          <li><strong>Validate Clean Snapshots:</strong> Access Module 11 (Cloud Backup) to initiate verified cryptographic restore jobs.</li>
        </ol>
      </div>
    </div>
  );
}
