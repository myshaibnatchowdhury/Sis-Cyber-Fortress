"use client";

import React, { useState } from "react";
import { Globe2, ShieldCheck, CheckCircle2, Plus, Trash2 } from "lucide-react";

export default function AdminAssetRegistryPage() {
  const [assets, setAssets] = useState([
    {
      id: "ast-1",
      domain: "sis-cyberfortress.internal",
      method: "dns_txt",
      verified: true,
      last_assessed: "2 days ago",
    },
    {
      id: "ast-2",
      domain: "api.enterprise-defense.com",
      method: "manual_admin_verify",
      verified: true,
      last_assessed: "4 days ago",
    },
    {
      id: "ast-3",
      domain: "staging.portal-defense.net",
      method: "dns_txt",
      verified: false,
      last_assessed: "Never",
    },
  ]);

  const [newDomain, setNewDomain] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;
    setAssets([
      ...assets,
      {
        id: `ast-${Date.now()}`,
        domain: newDomain,
        method: "dns_txt",
        verified: true,
        last_assessed: "Just now",
      },
    ]);
    setNewDomain("");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-cyber-border pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-teal-400 font-bold uppercase">
          <Globe2 className="h-4 w-4" />
          SECTION 08
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Authorized Asset Registry</h1>
        <p className="text-xs text-slate-400">Enterprise domain whitelist & ownership verification for WebShield scans</p>
      </div>

      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        <h2 className="text-sm font-bold text-white">Enroll Authorized Target Domain</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            required
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="domain.com (e.g. cloud.enterprise.com)"
            className="flex-1 rounded-xl border border-cyber-border bg-cyber-surface px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-teal-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-teal-400"
          >
            Register Asset
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Enrolled Enterprise Assets</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-cyber-border text-slate-400 font-mono">
              <tr>
                <th className="pb-3">Domain Name</th>
                <th className="pb-3">Verification Method</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Last Assessed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/60">
              {assets.map((a) => (
                <tr key={a.id} className="hover:bg-slate-900/40">
                  <td className="py-3 font-semibold text-white font-mono">{a.domain}</td>
                  <td className="py-3 font-mono text-slate-400 uppercase">{a.method}</td>
                  <td className="py-3">
                    {a.verified ? (
                      <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono flex items-center gap-1 w-max">
                        <CheckCircle2 className="h-3 w-3" /> VERIFIED OWNER
                      </span>
                    ) : (
                      <span className="rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono">
                        PENDING DNS TXT
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-slate-400 font-mono">{a.last_assessed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
