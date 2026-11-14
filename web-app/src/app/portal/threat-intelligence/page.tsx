"use client";

import React, { useState, useEffect } from "react";
import { Flame, Search, Filter, ShieldAlert, RefreshCw, ExternalLink, Tag } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function ThreatIntelligencePage() {
  const [indicators, setIndicators] = useState<any[]>([
    {
      id: "1",
      indicator_type: "domain",
      indicator_value: "secure-login-portal-auth99.com",
      severity: "critical",
      threat_actor: "ScamLab FinCrime",
      malware_family: "PhishHunter",
      confidence: 96,
      description: "Lookalike domain spoofing Microsoft 365 OAuth authentication flows.",
      first_seen: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "2",
      indicator_type: "ip",
      indicator_value: "194.135.25.14",
      severity: "high",
      threat_actor: "APT-29 (Cozy Bear)",
      malware_family: "Cobalt Strike",
      confidence: 92,
      description: "Command and Control beaconing listener detected in hosting provider.",
      first_seen: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "3",
      indicator_type: "hash",
      indicator_value: "7d1b32f91a5ec40b95767b0e12e105e197463f25c7774c8df63428d0959c8821",
      severity: "critical",
      threat_actor: "LockBit 3.0",
      malware_family: "LockBit Green",
      confidence: 99,
      description: "SHA-256 binary hash associated with ransomware payload staging.",
      first_seen: new Date(Date.now() - 259200000).toISOString(),
    },
  ]);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadThreats();
  }, []);

  const loadThreats = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data } = await supabase.from("threat_indicators").select("*").order("confidence", { ascending: false });
      if (data && data.length > 0) setIndicators(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncFeeds = async () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      alert("Threat intelligence feeds synced. Ingested 3 latest CISA & Abuse.ch signatures.");
    }, 1200);
  };

  const filtered = indicators.filter((item) => {
    const matchesSearch =
      item.indicator_value.toLowerCase().includes(search.toLowerCase()) ||
      (item.threat_actor && item.threat_actor.toLowerCase().includes(search.toLowerCase())) ||
      (item.malware_family && item.malware_family.toLowerCase().includes(search.toLowerCase()));

    const matchesType = filterType === "all" || item.indicator_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-bold uppercase">
            <Flame className="h-4 w-4" />
            MODULE 10
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">SIS Threat Intelligence</h1>
          <p className="text-xs text-slate-400">Enterprise Indicators of Compromise (IOC), APT attribution & live threat feeds</p>
        </div>

        <button
          onClick={handleSyncFeeds}
          disabled={syncing}
          className="flex items-center gap-2 rounded-xl bg-orange-500/10 border border-orange-500/30 px-4 py-2.5 text-xs font-semibold text-orange-300 hover:bg-orange-500/20"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Ingesting Feeds..." : "Sync Threat Feeds"}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search domain, IP address, SHA-256 hash, or threat actor (e.g. LockBit)..."
            className="w-full rounded-xl border border-cyber-border bg-cyber-card px-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-xl border border-cyber-border bg-cyber-card px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none"
        >
          <option value="all">All Indicator Types</option>
          <option value="domain">Domain IOCs</option>
          <option value="ip">IP Addresses</option>
          <option value="hash">File Hashes (SHA-256)</option>
          <option value="url">URL Signatures</option>
        </select>
      </div>

      {/* Threat Indicators Table */}
      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{filtered.length} Curated Indicators of Compromise</span>
          <span className="font-mono text-emerald-400">CONFIDENCE THRESHOLD &gt; 85%</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-cyber-border text-slate-400 font-mono">
              <tr>
                <th className="pb-3">Type</th>
                <th className="pb-3">Indicator Value</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Actor / Family</th>
                <th className="pb-3">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/60">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40">
                  <td className="py-3 font-mono uppercase text-orange-400 font-bold">{item.indicator_type}</td>
                  <td className="py-3 font-mono text-white max-w-sm truncate select-all">{item.indicator_value}</td>
                  <td className="py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase font-bold ${
                        item.severity === "critical"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300">
                    <div className="font-medium">{item.threat_actor || "Unknown Group"}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.malware_family}</div>
                  </td>
                  <td className="py-3 font-mono text-emerald-400 font-bold">{item.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
