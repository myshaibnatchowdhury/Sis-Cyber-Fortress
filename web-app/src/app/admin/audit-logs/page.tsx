"use client";

import React, { useState } from "react";
import { ScrollText, Search, Shield, Filter, Download } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([
    {
      id: "log-1",
      actor_email: "superadmin@sis-cyberfortress.internal",
      action: "SUPER_ADMIN_ASSIGNED",
      entity_type: "public.user_roles",
      entity_id: "00000000-0000-0000-0000-000000000001",
      ip_address: "103.114.98.24",
      details: { first_bootstrap: true, target_email: "superadmin@sis-cyberfortress.internal" },
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "log-2",
      actor_email: "superadmin@sis-cyberfortress.internal",
      action: "ROLE_ASSIGNED",
      entity_type: "public.user_roles",
      entity_id: "00000000-0000-0000-0000-000000000002",
      ip_address: "103.114.98.24",
      details: { assigned_role: "security_admin" },
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "log-3",
      actor_email: "analyst@enterprise.com",
      action: "USER_REGISTERED",
      entity_type: "auth.users",
      entity_id: "00000000-0000-0000-0000-000000000003",
      ip_address: "182.48.80.12",
      details: { registration_method: "supabase_auth" },
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const [search, setSearch] = useState("");

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.actor_email && l.actor_email.toLowerCase().includes(search.toLowerCase())) ||
      l.entity_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
            <ScrollText className="h-4 w-4" />
            SECTION 13
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">System Audit Logs</h1>
          <p className="text-xs text-slate-400">Immutable forensic audit trail of all administrative and privileged events</p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl bg-cyber-card border border-cyber-border px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <Download className="h-4 w-4 text-emerald-400" />
          Export Audit Trail
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by action (e.g. ROLE_ASSIGNED), actor email, or entity..."
          className="w-full rounded-xl border border-cyber-border bg-cyber-card px-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-cyber-border text-slate-400 font-mono">
              <tr>
                <th className="pb-3">Action</th>
                <th className="pb-3">Actor Email</th>
                <th className="pb-3">Target Entity</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3">Details</th>
                <th className="pb-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/60">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 font-mono">
                  <td className="py-3 font-bold text-emerald-400">{log.action}</td>
                  <td className="py-3 text-slate-300">{log.actor_email}</td>
                  <td className="py-3 text-cyan-400">{log.entity_type}</td>
                  <td className="py-3 text-slate-400">{log.ip_address}</td>
                  <td className="py-3 text-slate-400 max-w-xs truncate">{JSON.stringify(log.details)}</td>
                  <td className="py-3 text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
