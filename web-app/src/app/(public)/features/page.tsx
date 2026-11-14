import React from "react";
import { Shield, Smartphone, Globe, Database, Server, Lock, Cpu, Radio, Key } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cyber-bg text-slate-100">
      <PublicHeader />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Platform Architecture & Pillars
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Explore the engineering foundation of SIS CYBER FORTRESS across client runtimes, Edge Functions, and database boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Smartphone className="h-6 w-6 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Native Android APK (Kotlin)</h3>
              </div>
              <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                <li>Built with Jetpack Compose & Material 3 design</li>
                <li>Hardware-backed encryption via AndroidKeyStore</li>
                <li>BiometricPrompt integration with local PIN fallback</li>
                <li>WorkManager periodic security telemetry workers</li>
                <li>Clean offline-first session handling</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Next.js Web Portal & Super Admin</h3>
              </div>
              <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                <li>App Router architecture with TypeScript & Tailwind CSS</li>
                <li>Zero-Knowledge Web Crypto API (SubtleCrypto) client-side vault</li>
                <li>Super Admin Dashboard with 19 dedicated control sections</li>
                <li>Real-time telemetry and database connection testing</li>
                <li>Printable audit reports and scan exports</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Database className="h-6 w-6 text-teal-400" />
                <h3 className="text-base font-bold text-white">Shared Supabase PostgreSQL</h3>
              </div>
              <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                <li>46 normalized PostgreSQL tables with strict constraints</li>
                <li>Row Level Security (RLS) policies on every single table</li>
                <li>Security Definer helper functions preventing privilege escalation</li>
                <li>Private storage buckets with cryptographic access policies</li>
                <li>Automatic profile and vault provisioning triggers</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Server className="h-6 w-6 text-amber-400" />
                <h3 className="text-base font-bold text-white">Privileged Edge Functions (Deno)</h3>
              </div>
              <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                <li>Phishing URL inspection with heuristic entropy analysis</li>
                <li>WebShield scanner with strict CIDR SSRF prevention</li>
                <li>Super Admin user management with independent server checks</li>
                <li>SOC incident workflow state machine</li>
                <li>Live threat feed synchronization engine</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
