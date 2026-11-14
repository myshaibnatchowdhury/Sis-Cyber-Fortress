"use client";

import React, { useState } from "react";
import { Search, Briefcase, FileText, Plus, ShieldCheck, CheckCircle2, History } from "lucide-react";

export default function DigitalForensicsPage() {
  const [cases, setCases] = useState<any[]>([
    {
      id: "1",
      case_reference: "CASE-2026-001",
      title: "Suspicious PowerShell Ingestion Incident",
      severity: "high",
      status: "investigating",
      lead_investigator: "SecOps Lead Analyst",
      evidence_count: 2,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "2",
      case_reference: "CASE-2026-002",
      title: "Anomalous OAuth Token Redirection Probe",
      severity: "medium",
      status: "open",
      lead_investigator: "Forensic Officer",
      evidence_count: 1,
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);

  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSeverity, setNewSeverity] = useState("high");

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    const newCase = {
      id: Date.now().toString(),
      case_reference: `CASE-2026-00${cases.length + 1}`,
      title: newTitle,
      severity: newSeverity,
      status: "open",
      lead_investigator: "Active Analyst",
      evidence_count: 0,
      created_at: new Date().toISOString(),
    };
    setCases([newCase, ...cases]);
    setShowNewModal(false);
    setNewTitle("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase">
            <Search className="h-4 w-4" />
            MODULE 08
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">SIS Digital Forensics</h1>
          <p className="text-xs text-slate-400">Incident case management, SHA-256 evidence hashing & chain-of-custody tracking</p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Open Investigation Case
        </button>
      </div>

      {/* Case Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cases.map((c) => (
          <div key={c.id} className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-border/80 pb-3">
              <span className="font-mono text-xs font-bold text-purple-400">{c.case_reference}</span>
              <span className="rounded px-2 py-0.5 text-[10px] font-mono uppercase font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                STATUS: {c.status}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white">{c.title}</h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-cyber-surface border border-cyber-border/60">
                <div className="text-slate-400 text-[10px]">SEVERITY</div>
                <div className="text-rose-400 font-bold uppercase mt-0.5">{c.severity}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-cyber-surface border border-cyber-border/60">
                <div className="text-slate-400 text-[10px]">EVIDENCE ITEMS</div>
                <div className="text-white font-bold mt-0.5">{c.evidence_count} Acquired</div>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-400 flex items-center justify-between border-t border-cyber-border/60">
              <span>Lead: {c.lead_investigator}</span>
              <span className="font-mono">{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chain of Custody Sample Log */}
      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <History className="h-4 w-4 text-purple-400" />
          Immutable Chain-of-Custody Audit Trail
        </h3>
        <div className="space-y-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-cyber-surface border border-cyber-border/60 flex items-center justify-between">
            <div>
              <span className="text-emerald-400 font-bold">[ACQUIRED]</span> memory_dump_2026.raw (SHA-256: 7d1b32f91a5ec40...)
            </div>
            <span className="text-slate-500">2026-11-14 08:32:11</span>
          </div>
          <div className="p-3 rounded-xl bg-cyber-surface border border-cyber-border/60 flex items-center justify-between">
            <div>
              <span className="text-cyan-400 font-bold">[ANALYZED]</span> Static YARA rule inspection applied by Forensic Lead.
            </div>
            <span className="text-slate-500">2026-11-14 08:45:00</span>
          </div>
        </div>
      </div>

      {/* New Case Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Create Forensic Case</h3>
            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Case Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Host Beaconing Telemetry Investigation"
                  className="w-full rounded-xl border border-cyber-border bg-cyber-surface p-3 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Severity</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value)}
                  className="w-full rounded-xl border border-cyber-border bg-cyber-surface p-3 text-white focus:outline-none"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 font-bold text-white hover:bg-purple-500"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
