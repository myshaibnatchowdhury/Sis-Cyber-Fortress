import React from "react";
import Link from "next/link";
import {
  Fingerprint,
  Radio,
  Smartphone,
  Wifi,
  Key,
  Lock,
  Globe,
  FileSearch,
  Shield,
  Flame,
  CloudCheck,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

const MODULES = [
  {
    id: "01",
    name: "SIS Identity Guardian",
    desc: "Digital identity hardening, login activity telemetry, MFA enforcement, and breach notification warning interface.",
    icon: Fingerprint,
    path: "/portal/identity",
  },
  {
    id: "02",
    name: "SIS Phishing Shield",
    desc: "Heuristic URL analyzer detecting homoglyphs, brand spoofing, IP hosts, and reputation database lookups.",
    icon: Radio,
    path: "/portal/phishing",
  },
  {
    id: "03",
    name: "SIS Endpoint Guardian",
    desc: "Native Android hardware telemetry, root detection, permission audits, and remote device enrollment.",
    icon: Smartphone,
    path: "/portal/endpoint",
  },
  {
    id: "04",
    name: "SIS Network Sentinel",
    desc: "Wi-Fi encryption auditing, rogue hotspot alerts, DNS leak checks, and network security risk history.",
    icon: Wifi,
    path: "/portal/network",
  },
  {
    id: "05",
    name: "SIS Vault Guardian",
    desc: "Client-side AES-256-GCM zero-knowledge encryption. Plaintext is never transmitted to Supabase or visible to admins.",
    icon: Key,
    path: "/portal/vault",
  },
  {
    id: "06",
    name: "SIS Ransomware Guardian",
    desc: "Disaster recovery readiness evaluation, file integrity monitoring indicators, and emergency recovery runbooks.",
    icon: Lock,
    path: "/portal/ransomware",
  },
  {
    id: "07",
    name: "SIS WebShield",
    desc: "Authorized web vulnerability scanner with strict SSRF defenses blocking loopback, link-local, and cloud metadata.",
    icon: Globe,
    path: "/portal/webshield",
  },
  {
    id: "08",
    name: "SIS Digital Forensics",
    desc: "Incident case management, SHA-256 evidence hashing, restricted storage, and immutable chain-of-custody tracking.",
    icon: FileSearch,
    path: "/portal/forensics",
  },
  {
    id: "09",
    name: "SIS Access Guardian",
    desc: "Active session management, remote token revocation, geo-IP access alerts, and least-privilege RBAC.",
    icon: Shield,
    path: "/portal/access",
  },
  {
    id: "10",
    name: "SIS Threat Intelligence",
    desc: "Enterprise IOC repository for domains, IPs, hashes, and URLs with APT attribution and automated feed synchronization.",
    icon: Flame,
    path: "/portal/threat-intelligence",
  },
  {
    id: "11",
    name: "SIS Cloud Backup Guardian",
    desc: "Encrypted snapshot workflows to private storage buckets with automated SHA-256 integrity verification.",
    icon: CloudCheck,
    path: "/portal/backup",
  },
  {
    id: "12",
    name: "SIS Cyber SOC",
    desc: "Unified security operations center with incident status lifecycle triage: New -> Assigned -> Investigating -> Resolved.",
    icon: AlertTriangle,
    path: "/portal/soc",
  },
];

export default function ModulesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cyber-bg text-slate-100">
      <PublicHeader />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              12 Security Disciplines
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Every module is fully implemented with real database schemas, API contracts, and user portal workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.id}
                  className="rounded-2xl border border-cyber-border bg-cyber-card p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-mono font-bold text-cyber-muted">MODULE {m.id}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{m.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                  </div>
                  <div className="pt-5 mt-4 border-t border-cyber-border/80">
                    <Link
                      href={m.path}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                    >
                      Open Module Console
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
