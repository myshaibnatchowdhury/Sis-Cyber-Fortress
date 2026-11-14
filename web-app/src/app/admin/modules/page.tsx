"use client";

import React from "react";
import Link from "next/link";
import {
  Layers,
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
  CheckCircle2,
} from "lucide-react";

const MODULES_ADMIN = [
  { id: "01", name: "Identity Guardian", table: "profiles, identity_security_events", icon: Fingerprint, path: "/portal/identity" },
  { id: "02", name: "Phishing Shield", table: "phishing_scans, url_reputation_cache", icon: Radio, path: "/portal/phishing" },
  { id: "03", name: "Endpoint Guardian", table: "registered_devices, endpoint_inventory", icon: Smartphone, path: "/portal/endpoint" },
  { id: "04", name: "Network Sentinel", table: "network_security_checks, network_risk_events", icon: Wifi, path: "/portal/network" },
  { id: "05", name: "Vault Guardian", table: "encrypted_vault_items (Zero-Knowledge AES-GCM)", icon: Key, path: "/portal/vault" },
  { id: "06", name: "Ransomware Guardian", table: "recovery_readiness_checks, file_integrity_events", icon: Lock, path: "/portal/ransomware" },
  { id: "07", name: "WebShield", table: "authorized_assets, website_scans (SSRF Guard)", icon: Globe, path: "/portal/webshield" },
  { id: "08", name: "Digital Forensics", table: "forensic_cases, forensic_evidence, custody_logs", icon: FileSearch, path: "/portal/forensics" },
  { id: "09", name: "Access Guardian", table: "user_sessions_metadata, access_security_events", icon: Shield, path: "/portal/access" },
  { id: "10", name: "Threat Intelligence", table: "threat_sources, threat_indicators, threat_tags", icon: Flame, path: "/portal/threat-intelligence" },
  { id: "11", name: "Cloud Backup", table: "backup_jobs, backup_files, restore_jobs", icon: CloudCheck, path: "/portal/backup" },
  { id: "12", name: "Cyber SOC", table: "security_alerts, security_incidents, incident_events", icon: AlertTriangle, path: "/portal/soc" },
];

export default function AdminModulesHubPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-cyber-border pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
          <Layers className="h-4 w-4" />
          SECTION 05
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">12 Security Modules Hub</h1>
        <p className="text-xs text-slate-400">PostgreSQL database tables, RLS isolation & module telemetry matrix</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODULES_ADMIN.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.id} className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> ACTIVE
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500">MODULE {m.id}</span>
                <h3 className="text-base font-bold text-white">{m.name}</h3>
              </div>

              <div className="rounded-lg bg-cyber-surface border border-cyber-border/60 p-2.5 font-mono text-[11px] text-slate-300">
                <span className="text-slate-500 block text-[9px]">SCHEMA TABLES:</span>
                {m.table}
              </div>

              <div className="pt-2 border-t border-cyber-border/80">
                <Link href={m.path} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                  Inspect Module Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
