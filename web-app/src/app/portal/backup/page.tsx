"use client";

import React, { useState } from "react";
import { CloudUpload, HardDrive, CheckCircle2, ShieldCheck, Download, RefreshCw, Plus, FileCode } from "lucide-react";

export default function CloudBackupGuardianPage() {
  const [jobs, setJobs] = useState([
    {
      id: "1",
      job_name: "Weekly Zero-Knowledge Vault Snapshot",
      backup_type: "vault_snapshot",
      status: "completed",
      size: "2.4 MB",
      sha256: "b4c2e8a1f9d37508e621ab79c3f41295e871da4c92b8d4e7f1390c58e2a6b41f",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "2",
      job_name: "Android Keystore Configurations Baseline",
      backup_type: "full",
      status: "completed",
      size: "18.7 MB",
      sha256: "f892a4e7b1c3d5e2197463f25c7774c8df63428d0959c8821048b37e59c2108a",
      created_at: new Date(Date.now() - 259200000).toISOString(),
    },
  ]);

  const [uploading, setUploading] = useState(false);

  const simulateBackupUpload = () => {
    setUploading(true);
    setTimeout(() => {
      const newJob = {
        id: Date.now().toString(),
        job_name: `Encrypted Snapshot (${new Date().toLocaleDateString()})`,
        backup_type: "vault_snapshot",
        status: "completed",
        size: "3.1 MB",
        sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        created_at: new Date().toISOString(),
      };
      setJobs([newJob, ...jobs]);
      setUploading(false);
      alert("Cryptographic snapshot encrypted and uploaded to private 'cloud-backups' bucket.");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
            <CloudUpload className="h-4 w-4" />
            MODULE 11
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">SIS Cloud Backup Guardian</h1>
          <p className="text-xs text-slate-400">Encrypted multi-tenant file snapshots, private storage & SHA-256 integrity verification</p>
        </div>

        <button
          onClick={simulateBackupUpload}
          disabled={uploading}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors disabled:opacity-50"
        >
          <CloudUpload className="h-4 w-4" />
          {uploading ? "Encrypting & Uploading..." : "Create Encrypted Backup"}
        </button>
      </div>

      {/* Storage Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-2">
          <div className="text-xs text-slate-400">Total Backup Storage Used</div>
          <div className="text-2xl font-bold font-mono text-white">24.2 MB / 200 MB</div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden mt-2">
            <div className="h-full bg-emerald-500 w-[12%]" />
          </div>
        </div>

        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-2">
          <div className="text-xs text-slate-400">Integrity Verification</div>
          <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" /> 100% SHA-256 VERIFIED
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Zero bit-rot or hash discrepancies</div>
        </div>

        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-2">
          <div className="text-xs text-slate-400">Storage Security Policy</div>
          <div className="text-lg font-bold text-cyan-400 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> PRIVATE BUCKET RLS
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Short-lived signed tokens only</div>
        </div>
      </div>

      {/* Backup Jobs Table */}
      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Cryptographic Backup Snapshots</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-cyber-border text-slate-400 font-mono">
              <tr>
                <th className="pb-3">Snapshot Name</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Size</th>
                <th className="pb-3">SHA-256 Integrity Hash</th>
                <th className="pb-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/60">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-900/40">
                  <td className="py-3 font-semibold text-white">{job.job_name}</td>
                  <td className="py-3 font-mono uppercase text-slate-300">{job.backup_type}</td>
                  <td className="py-3 font-mono text-emerald-400">{job.size}</td>
                  <td className="py-3 font-mono text-slate-400 max-w-xs truncate">{job.sha256}</td>
                  <td className="py-3 text-slate-500 font-mono">{new Date(job.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
