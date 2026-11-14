"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  Smartphone,
  Lock,
  Globe,
  Radio,
  FileSearch,
  Key,
  Flame,
  CloudCheck,
  AlertTriangle,
  Fingerprint,
  Wifi,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Database,
  Cpu,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

const MODULES_LIST = [
  {
    num: "01",
    name: "Identity Guardian",
    desc: "Digital identity hardening, login activity telemetry, MFA enforcement, and k-anonymity credential breach alerts.",
    icon: Fingerprint,
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
  },
  {
    num: "02",
    name: "Phishing Shield",
    desc: "Heuristic URL analyzer detecting homoglyphs, brand spoofing, IP hosts, and reputation database lookups.",
    icon: Radio,
    color: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/30",
  },
  {
    num: "03",
    name: "Endpoint Guardian",
    desc: "Native Android hardware telemetry, root detection, permission audits, and remote device enrollment.",
    icon: Smartphone,
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/30",
  },
  {
    num: "04",
    name: "Network Sentinel",
    desc: "Wi-Fi encryption auditing, rogue hotspot alerts, DNS leak checks, and network security risk history.",
    icon: Wifi,
    color: "from-teal-500/20 to-teal-500/5",
    border: "border-teal-500/30",
  },
  {
    num: "05",
    name: "Vault Guardian",
    desc: "Client-side AES-256-GCM zero-knowledge encryption. Plaintext is never transmitted to Supabase or visible to admins.",
    icon: Key,
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/30",
  },
  {
    num: "06",
    name: "Ransomware Guardian",
    desc: "Disaster recovery readiness evaluation, file integrity monitoring indicators, and emergency recovery runbooks.",
    icon: Lock,
    color: "from-rose-500/20 to-rose-500/5",
    border: "border-rose-500/30",
  },
  {
    num: "07",
    name: "WebShield (SSRF-Guard)",
    desc: "Authorized web vulnerability scanner with strict SSRF defenses blocking loopback, link-local, and cloud metadata.",
    icon: Globe,
    color: "from-indigo-500/20 to-indigo-500/5",
    border: "border-indigo-500/30",
  },
  {
    num: "08",
    name: "Digital Forensics",
    desc: "Incident case management, SHA-256 evidence hashing, restricted storage, and immutable chain-of-custody tracking.",
    icon: FileSearch,
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30",
  },
  {
    num: "09",
    name: "Access Guardian",
    desc: "Active session management, remote token revocation, geo-IP access alerts, and least-privilege RBAC.",
    icon: Shield,
    color: "from-sky-500/20 to-sky-500/5",
    border: "border-sky-500/30",
  },
  {
    num: "10",
    name: "Threat Intelligence",
    desc: "Enterprise IOC repository for domains, IPs, hashes, and URLs with APT attribution and automated feed synchronization.",
    icon: Flame,
    color: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/30",
  },
  {
    num: "11",
    name: "Cloud Backup Guardian",
    desc: "Encrypted snapshot workflows to private storage buckets with automated SHA-256 integrity verification.",
    icon: CloudCheck,
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
  },
  {
    num: "12",
    name: "Cyber SOC Command",
    desc: "Unified security operations center with incident status lifecycle triage: New -> Assigned -> Investigating -> Resolved.",
    icon: AlertTriangle,
    color: "from-red-500/20 to-red-500/5",
    border: "border-red-500/30",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-cyber-bg text-slate-100">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32 cyber-grid-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              ONE UNIFIED PLATFORM • ANDROID APK + NEXT.JS + SUPABASE
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
              SIS CYBER FORTRESS
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 mt-2">
                12-in-1 Enterprise Cybersecurity Ecosystem
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Engineered for organizations that demand total visibility. Uniting native Android endpoint telemetry,
              real-time phishing analysis, client-side zero-knowledge encryption, and a 24/7 Cyber SOC on a single,
              zero-trust PostgreSQL backend.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
              >
                Deploy Cyber Fortress
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/portal"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-cyber-card border border-cyber-border px-6 py-3.5 text-sm font-semibold text-white hover:border-emerald-500/40 hover:bg-slate-900 transition-all"
              >
                Open User Portal
              </Link>
              <Link
                href="/admin"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-emerald-500/30 px-6 py-3.5 text-sm font-semibold text-emerald-300 hover:bg-slate-800 transition-all"
              >
                <Lock className="h-4 w-4 text-emerald-400" />
                Super Admin
              </Link>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-cyber-border bg-cyber-surface/80 p-5 text-center">
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">12</div>
              <div className="text-xs text-cyber-muted mt-1">Integrated Modules</div>
            </div>
            <div className="rounded-2xl border border-cyber-border bg-cyber-surface/80 p-5 text-center">
              <div className="text-3xl font-extrabold text-cyan-400 font-mono">256-Bit</div>
              <div className="text-xs text-cyber-muted mt-1">Zero-Knowledge AES-GCM</div>
            </div>
            <div className="rounded-2xl border border-cyber-border bg-cyber-surface/80 p-5 text-center">
              <div className="text-3xl font-extrabold text-teal-400 font-mono">100%</div>
              <div className="text-xs text-cyber-muted mt-1">PostgreSQL RLS Enforced</div>
            </div>
            <div className="rounded-2xl border border-cyber-border bg-cyber-surface/80 p-5 text-center">
              <div className="text-3xl font-extrabold text-amber-400 font-mono">SSRF</div>
              <div className="text-xs text-cyber-muted mt-1">Strict CIDR Blockers</div>
            </div>
          </div>
        </div>
      </section>

      {/* 12 Core Modules Grid */}
      <section className="py-20 border-t border-cyber-border bg-cyber-surface/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              DEFENSE ARCHITECTURE
            </h2>
            <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              12 Enterprise Security Disciplines
            </h3>
            <p className="text-slate-400 text-sm">
              Each module operates autonomously or synchronizes automatically into the centralized Cyber SOC.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES_LIST.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.num}
                  className={`group relative rounded-2xl border ${m.border} bg-cyber-card/90 p-6 transition-all hover:bg-slate-900/90 hover:scale-[1.01] flex flex-col justify-between`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${m.color} border border-white/10`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs font-mono font-bold text-cyber-muted">
                        MODULE {m.num}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {m.name}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                  <div className="pt-5 mt-4 border-t border-cyber-border/60 flex items-center justify-between text-xs font-semibold text-emerald-400">
                    <span>Inspect Module</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* System Architecture Diagram */}
      <section className="py-20 border-t border-cyber-border bg-cyber-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              UNIFIED DATAFLOW
            </h2>
            <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Shared Supabase Ecosystem Architecture
            </h3>
            <p className="text-slate-400 text-sm">
              Both the native Kotlin Android app and the Next.js web portal connect to the exact same PostgreSQL database.
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl border border-cyber-border bg-cyber-card p-8 font-mono text-xs text-slate-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center items-center">
              {/* Android Client */}
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 space-y-2">
                <Smartphone className="h-8 w-8 text-emerald-400 mx-auto" />
                <div className="font-bold text-white text-sm">ANDROID APP</div>
                <div className="text-[11px] text-slate-400">Kotlin + Jetpack Compose</div>
                <div className="text-[10px] text-emerald-300 bg-emerald-950/60 rounded px-2 py-0.5">
                  Keystore • WorkManager • APK
                </div>
              </div>

              {/* Central Supabase */}
              <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-6 space-y-3">
                <Database className="h-10 w-10 text-cyan-400 mx-auto animate-pulse" />
                <div className="font-bold text-white text-base">SUPABASE CLOUD</div>
                <div className="text-[11px] text-slate-300">Single Source of Truth</div>
                <div className="text-[10px] text-slate-400 space-y-1">
                  <div>• Auth (MFA, JWT, RBAC)</div>
                  <div>• PostgreSQL 15+ with RLS</div>
                  <div>• Private Encrypted Storage</div>
                  <div>• Deno Edge Functions</div>
                </div>
              </div>

              {/* Web Portal */}
              <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-5 space-y-2">
                <Globe className="h-8 w-8 text-blue-400 mx-auto" />
                <div className="font-bold text-white text-sm">WEB APPLICATION</div>
                <div className="text-[11px] text-slate-400">Next.js + TypeScript + Tailwind</div>
                <div className="text-[10px] text-blue-300 bg-blue-950/60 rounded px-2 py-0.5">
                  User Portal • Super Admin Console
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 border-t border-cyber-border bg-gradient-to-b from-cyber-surface to-cyber-bg">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-6">
          <Shield className="h-12 w-12 text-emerald-400 mx-auto" />
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Fortify Your Enterprise?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Deploy the 12-in-1 ecosystem today. Install the Android debug APK onto your devices and access the Super Admin Dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
            >
              Create Master Account
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto rounded-xl bg-cyber-card border border-cyber-border px-6 py-3 text-sm font-semibold text-white hover:bg-slate-900 transition-colors"
            >
              Sign In to Console
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
