"use client";

import React, { useState } from "react";
import { LifeBuoy, AlertOctagon, CheckCircle2, ChevronRight, Clock, Plus, User } from "lucide-react";

const STATUS_PIPELINE = [
  "new",
  "under_review",
  "assigned",
  "investigating",
  "resolved",
  "closed",
];

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState([
    {
      id: "inc-1",
      number: "INC-2026-004",
      title: "Credential Harvesting Domain Intercepted",
      severity: "critical",
      status: "investigating",
      assigned_to: "SecOps Lead Officer",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "inc-2",
      number: "INC-2026-003",
      title: "Unverified Host Beaconing Probe",
      severity: "high",
      status: "assigned",
      assigned_to: "Forensics Specialist",
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "inc-3",
      number: "INC-2026-002",
      title: "Android Rogue Hotspot Connection Attempt",
      severity: "medium",
      status: "resolved",
      assigned_to: "Endpoint Administrator",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const advanceStatus = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const currentIndex = STATUS_PIPELINE.indexOf(inc.status);
          const nextIndex = Math.min(currentIndex + 1, STATUS_PIPELINE.length - 1);
          return { ...inc, status: STATUS_PIPELINE[nextIndex] };
        }
        return inc;
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-cyber-border pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
          <LifeBuoy className="h-4 w-4" />
          SECTION 07
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Incident Lifecycle Management</h1>
        <p className="text-xs text-slate-400">SOC workflow state machine: New → Under Review → Assigned → Investigating → Resolved → Closed</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {incidents.map((inc) => (
          <div key={inc.id} className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border/80 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-emerald-400">{inc.number}</span>
                <span
                  className={`rounded px-2.5 py-0.5 text-[10px] font-mono uppercase font-bold ${
                    inc.severity === "critical"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      : inc.severity === "high"
                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {inc.severity}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">STATE:</span>
                <span className="rounded bg-slate-900 border border-cyber-border px-3 py-1 font-bold text-cyan-400 uppercase">
                  {inc.status}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{inc.title}</h3>
              <p className="text-xs text-slate-400 mt-1">Assigned Investigator: {inc.assigned_to}</p>
            </div>

            {/* Pipeline progress visualization */}
            <div className="pt-2">
              <div className="grid grid-cols-6 gap-1 text-center font-mono text-[9px] uppercase">
                {STATUS_PIPELINE.map((st, idx) => {
                  const currentIdx = STATUS_PIPELINE.indexOf(inc.status);
                  const isDone = idx <= currentIdx;
                  return (
                    <div
                      key={st}
                      className={`p-1.5 rounded border transition-colors ${
                        isDone
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold"
                          : "bg-slate-900 text-slate-500 border-cyber-border/60"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-cyber-border/80">
              <span className="text-[11px] text-slate-500 font-mono">
                Opened: {new Date(inc.created_at).toLocaleDateString()}
              </span>
              {inc.status !== "closed" && (
                <button
                  onClick={() => advanceStatus(inc.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                >
                  Advance Lifecycle State <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
