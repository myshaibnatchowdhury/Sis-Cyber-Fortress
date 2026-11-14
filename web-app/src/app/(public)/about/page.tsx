import React from "react";
import { Shield, Target, Award, Users, CheckCircle } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cyber-bg text-slate-100">
      <PublicHeader />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
              MISSION BRIEFING
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              About SIS CYBER FORTRESS
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Architected as a unified, uncompromising enterprise cybersecurity ecosystem designed to protect mobile endpoints, web surfaces, and sensitive cloud assets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-3">
              <Target className="h-8 w-8 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Zero-Trust By Design</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every request, endpoint heartbeat, and administrative mutation is cryptographically verified against strict Row Level Security (RLS) policies.
              </p>
            </div>
            <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-3">
              <Shield className="h-8 w-8 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Zero-Knowledge Vault</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vault secrets and notes are encrypted on client devices using hardware keystores and Web Crypto AES-256-GCM. Not even Super Admins can inspect user plaintexts.
              </p>
            </div>
            <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-3">
              <Award className="h-8 w-8 text-teal-400" />
              <h3 className="text-lg font-bold text-white">Full-Stack Convergence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A native Android Kotlin application and a Next.js portal share the exact same Supabase database, authentication system, and security logs.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
