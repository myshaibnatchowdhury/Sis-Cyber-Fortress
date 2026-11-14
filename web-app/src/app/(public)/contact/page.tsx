"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, Send, ShieldCheck, CheckCircle2 } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-cyber-bg text-slate-100">
      <PublicHeader />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-cyber-border bg-cyber-card p-8 shadow-2xl">
            <div className="text-center space-y-2 mb-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Contact Security Ops</h1>
              <p className="text-xs text-cyber-muted">Direct dispatch to SIS Fortress security engineers</p>
            </div>

            {submitted ? (
              <div className="text-center space-y-3 py-6">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Transmission Received</h3>
                <p className="text-xs text-slate-400">
                  Your security inquiry has been encrypted and dispatched to the SOC incident triage queue.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Your Enterprise Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@organization.com"
                    className="w-full rounded-lg border border-cyber-border bg-cyber-surface px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Security Inquiry / Incident Report</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your security assessment request or incident context..."
                    className="w-full rounded-lg border border-cyber-border bg-cyber-surface px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  Dispatch Message to SOC
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
