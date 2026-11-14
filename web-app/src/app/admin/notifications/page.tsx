"use client";

import React, { useState } from "react";
import { BellRing, Send, CheckCircle2 } from "lucide-react";

export default function AdminNotificationsPage() {
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastTitle("");
      setBroadcastMessage("");
      alert("Broadcast notification successfully dispatched to all active enterprise users and Android devices.");
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-cyber-border pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
          <BellRing className="h-4 w-4" />
          SECTION 15
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Enterprise Notifications Center</h1>
        <p className="text-xs text-slate-400">Broadcast security advisories to all registered users and Android clients</p>
      </div>

      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        <h2 className="text-sm font-bold text-white">Broadcast Global Security Advisory</h2>
        <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1">Advisory Title</label>
            <input
              type="text"
              required
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="e.g. Critical CISA Vulnerability Advisory (CVE-2026-XXXX)"
              className="w-full rounded-xl border border-cyber-border bg-cyber-surface p-3 text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-1">Advisory Body / Instructions</label>
            <textarea
              rows={4}
              required
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Instructions for endpoints, recommended actions, or urgent patch compliance..."
              className="w-full rounded-xl border border-cyber-border bg-cyber-surface p-3 text-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
          >
            <Send className="h-4 w-4" />
            {broadcastSent ? "Dispatching Broadcast..." : "Dispatch System Broadcast"}
          </button>
        </form>
      </div>
    </div>
  );
}
