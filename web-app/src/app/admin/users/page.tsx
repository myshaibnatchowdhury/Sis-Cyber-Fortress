"use client";

import React, { useState } from "react";
import { Users, Search, Shield, Ban, CheckCircle, RefreshCw, Key } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([
    {
      id: "u-1",
      email: "superadmin@sis-cyberfortress.internal",
      full_name: "Super Administrator",
      roles: ["super_admin", "security_admin"],
      security_score: 95,
      is_suspended: false,
      created_at: new Date(Date.now() - 864000000).toISOString(),
    },
    {
      id: "u-2",
      email: "secops.lead@enterprise.com",
      full_name: "SecOps Lead Officer",
      roles: ["security_admin"],
      security_score: 90,
      is_suspended: false,
      created_at: new Date(Date.now() - 432000000).toISOString(),
    },
    {
      id: "u-3",
      email: "analyst@enterprise.com",
      full_name: "Tier 1 SOC Analyst",
      roles: ["standard_user"],
      security_score: 82,
      is_suspended: false,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const [search, setSearch] = useState("");

  const toggleSuspension = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, is_suspended: !u.is_suspended } : u))
    );
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
            <Users className="h-4 w-4" />
            SECTION 02
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">User Management</h1>
          <p className="text-xs text-slate-400">Manage enterprise user accounts, security scores & account suspension</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by user email or name..."
          className="w-full rounded-xl border border-cyber-border bg-cyber-card px-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-cyber-border text-slate-400 font-mono">
              <tr>
                <th className="pb-3">User & Email</th>
                <th className="pb-3">Roles</th>
                <th className="pb-3">Security Score</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/60">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40">
                  <td className="py-3">
                    <div className="font-semibold text-white">{u.full_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <span key={r} className="rounded bg-slate-900 border border-cyber-border px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 font-mono font-bold text-emerald-400">{u.security_score}/100</td>
                  <td className="py-3">
                    {u.is_suspended ? (
                      <span className="rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 text-[10px] font-mono">
                        SUSPENDED
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono">
                        ACTIVE
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => toggleSuspension(u.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        u.is_suspended
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                      }`}
                    >
                      {u.is_suspended ? "Unsuspend Account" : "Suspend Account"}
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
