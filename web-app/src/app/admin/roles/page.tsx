"use client";

import React, { useState } from "react";
import { KeyRound, Shield, CheckCircle2, UserCheck, Plus, Trash2 } from "lucide-react";

export default function AdminRolesPage() {
  const [rolesList, setRolesList] = useState([
    {
      name: "super_admin",
      description: "Supreme administrator with full system, role, user, and module management authorization",
      usersCount: 1,
      permissions: ["All 24 Permissions Included"],
    },
    {
      name: "security_admin",
      description: "Security Operations team member authorized for alerts, incidents, forensics, assets, and threat feeds",
      usersCount: 2,
      permissions: ["soc.alerts.view", "soc.incidents.manage", "forensics.manage", "webshield.scan", "threat_intel.manage"],
    },
    {
      name: "module_admin",
      description: "Specialized administrator authorized to manage designated security modules only",
      usersCount: 1,
      permissions: ["phishing.scan", "phishing.manage_reports", "webshield.scan"],
    },
    {
      name: "auditor",
      description: "Independent compliance officer with strictly read-only access to audit logs, reports, and evidence",
      usersCount: 1,
      permissions: ["admin.audit.view", "identity.view", "endpoint.audit_all", "soc.alerts.view"],
    },
    {
      name: "standard_user",
      description: "Authorized enterprise member with personal device, vault, and security scanning access",
      usersCount: 9,
      permissions: ["vault.use", "endpoint.register", "phishing.scan", "network.check", "backup.execute"],
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-cyber-border pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
          <KeyRound className="h-4 w-4" />
          SECTION 03
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Role & Permission Management</h1>
        <p className="text-xs text-slate-400">Server-side RBAC configuration, permission matrices & privilege guardrails</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rolesList.map((r) => (
          <div key={r.name} className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-border/80 pb-3">
              <span className="font-mono text-sm font-bold text-emerald-400 uppercase">{r.name}</span>
              <span className="rounded bg-slate-900 border border-cyber-border px-2.5 py-0.5 text-[10px] font-mono text-slate-300">
                {r.usersCount} Assigned Users
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{r.description}</p>

            <div className="space-y-1.5 pt-2">
              <div className="text-[11px] font-semibold text-slate-300">Granted Permissions:</div>
              <div className="flex flex-wrap gap-1.5">
                {r.permissions.map((p) => (
                  <span key={p} className="rounded bg-cyber-surface border border-cyber-border/60 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
