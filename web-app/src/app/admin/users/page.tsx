"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Shield, Ban, CheckCircle, RefreshCw, Key, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  security_score: number;
  is_suspended: boolean;
  created_at: string;
  roles?: string[];
}

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        // Fetch profiles and user roles
        const { data: profilesData, error } = await supabase
          .from("profiles")
          .select(`
            id,
            email,
            full_name,
            security_score,
            is_suspended,
            created_at,
            user_roles (
              roles (
                name
              )
            )
          `)
          .order("created_at", { ascending: false });

        if (!error && profilesData) {
          const mapped = profilesData.map((p: any) => ({
            id: p.id,
            email: p.email || "No email",
            full_name: p.full_name || "Enterprise Member",
            security_score: p.security_score || 85,
            is_suspended: Boolean(p.is_suspended),
            created_at: p.created_at,
            roles: p.user_roles?.map((ur: any) => ur.roles?.name).filter(Boolean) || ["standard_user"],
          }));
          setUsers(mapped);
          setLoading(false);
          return;
        }
      }

      // Fallback if offline or empty
      setUsers([
        {
          id: currentAdmin?.id || "00000000-0000-0000-0000-000000000001",
          email: currentAdmin?.email || "superadmin@sis-cyberfortress.internal",
          full_name: "Super Administrator",
          roles: ["super_admin", "security_admin"],
          security_score: 98,
          is_suspended: false,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentAdmin]);

  const toggleSuspension = async (targetUser: UserProfile) => {
    setActionLoading(targetUser.id);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/device-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_suspension",
          user_id: targetUser.id,
          actor_email: currentAdmin?.email || "superadmin@sis-cyberfortress.internal",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(data.message);
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, is_suspended: data.is_suspended } : u))
        );
      } else {
        alert("Action failed: " + data.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
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
            SECTION 02 • USER ACCESS CONTROL
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Enterprise User Management</h1>
          <p className="text-xs text-slate-400">
            Control user profiles, RBAC authorization, security ratings & remote profile freeze (anti-theft)
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-cyber-card border border-cyber-border px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          Refresh Users
        </button>
      </div>

      {statusMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

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
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
            Synchronizing database users...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <Users className="h-8 w-8 text-slate-600 mx-auto" />
            <p>No user profiles found matching your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-cyber-border text-slate-400 font-mono">
                <tr>
                  <th className="pb-3">User & Email</th>
                  <th className="pb-3">Assigned Roles</th>
                  <th className="pb-3">Security Score</th>
                  <th className="pb-3">Account Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/60">
                {filtered.map((u) => {
                  const isBusy = actionLoading === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5">
                        <div className="font-semibold text-white">{u.full_name}</div>
                        <div className="text-[11px] text-cyan-400 font-mono">{u.email}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Registered: {new Date(u.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {u.roles && u.roles.length > 0 ? (
                            u.roles.map((r) => (
                              <span
                                key={r}
                                className="rounded bg-slate-900 border border-cyber-border px-2 py-0.5 text-[10px] font-mono text-emerald-400 uppercase font-bold"
                              >
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="rounded bg-slate-900 border border-cyber-border px-2 py-0.5 text-[10px] font-mono text-slate-400">
                              standard_user
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 font-mono">
                        <span className="text-emerald-400 font-bold">{u.security_score}/100</span>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase font-bold ${
                            u.is_suspended
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {u.is_suspended ? "🔒 FROZEN / SUSPENDED" : "Active"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                u.is_suspended
                                  ? `Unfreeze account for ${u.email}?`
                                  : `CRITICAL: Freeze account for ${u.email}? All mobile and web access will be blocked immediately.`
                              )
                            ) {
                              toggleSuspension(u);
                            }
                          }}
                          disabled={isBusy}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                            u.is_suspended
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                          }`}
                        >
                          {isBusy ? "Processing..." : u.is_suspended ? "Unfreeze Account" : "Freeze Account (Stolen Phone)"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
