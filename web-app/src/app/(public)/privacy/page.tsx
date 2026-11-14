import React from "react";
import { ShieldCheck, Lock, EyeOff, Server } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cyber-bg text-slate-100">
      <PublicHeader />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Zero-Knowledge Privacy Policy
            </h1>
            <p className="text-xs text-cyber-muted font-mono">LAST UPDATED: NOVEMBER 2026 • SIS COMPLIANCE TIER 1</p>
          </div>

          <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                1. Zero-Knowledge Vault Encryption
              </h2>
              <p>
                All personal credentials, notes, and sensitive entries stored in Module 05 (SIS Vault Guardian) are encrypted on the client device using AES-256-GCM. The encryption key is derived locally via PBKDF2 with 100,000 rounds. Ciphertext and initialization vectors only are transmitted to Supabase. Neither SIS administrators nor Supabase operators possess cryptographic access to decrypt user plaintexts.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="h-4 w-4 text-cyan-400" />
                2. Endpoint Telemetry & Consents
              </h2>
              <p>
                Module 03 (SIS Endpoint Guardian) only collects hardware identifiers, OS version, root status, and high-level permission overviews strictly when authorized by user consent. We never perform hidden surveillance, ambient recording, or background tracking without explicit foreground user permission.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-teal-400" />
                3. Data Minimization & Retention
              </h2>
              <p>
                Phishing scans and URL reputation queries are stripped of personal query fragments where practical. Audit logs are preserved in immutable PostgreSQL tables protected by Row Level Security for forensic compliance.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
