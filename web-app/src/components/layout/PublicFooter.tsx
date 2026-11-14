import React from "react";
import Link from "next/link";
import { Shield, Lock, Terminal, Activity } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-cyber-border bg-cyber-bg text-cyber-muted text-xs">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              <span className="font-bold text-sm tracking-tight text-white">SIS CYBER FORTRESS</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Unified 12-in-1 enterprise cybersecurity ecosystem connecting Android endpoints, web clients, and zero-trust Supabase backends.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              SOC SYSTEM STATUS: ALL 12 MODULES OPERATIONAL
            </div>
          </div>

          {/* Core Modules Column */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Security Modules</h4>
            <ul className="space-y-2">
              <li><Link href="/portal/identity" className="hover:text-emerald-400 transition-colors">01. Identity Guardian</Link></li>
              <li><Link href="/portal/phishing" className="hover:text-emerald-400 transition-colors">02. Phishing Shield</Link></li>
              <li><Link href="/portal/endpoint" className="hover:text-emerald-400 transition-colors">03. Endpoint Guardian</Link></li>
              <li><Link href="/portal/network" className="hover:text-emerald-400 transition-colors">04. Network Sentinel</Link></li>
              <li><Link href="/portal/vault" className="hover:text-emerald-400 transition-colors">05. Vault Guardian</Link></li>
              <li><Link href="/portal/webshield" className="hover:text-emerald-400 transition-colors">07. WebShield (SSRF-Guard)</Link></li>
            </ul>
          </div>

          {/* Operations & Forensics */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Operations & SOC</h4>
            <ul className="space-y-2">
              <li><Link href="/portal/ransomware" className="hover:text-emerald-400 transition-colors">06. Ransomware Guardian</Link></li>
              <li><Link href="/portal/forensics" className="hover:text-emerald-400 transition-colors">08. Digital Forensics</Link></li>
              <li><Link href="/portal/access" className="hover:text-emerald-400 transition-colors">09. Access Guardian</Link></li>
              <li><Link href="/portal/threat-intelligence" className="hover:text-emerald-400 transition-colors">10. Threat Intelligence</Link></li>
              <li><Link href="/portal/backup" className="hover:text-emerald-400 transition-colors">11. Cloud Backup Guardian</Link></li>
              <li><Link href="/portal/soc" className="hover:text-emerald-400 transition-colors">12. Cyber SOC Command</Link></li>
            </ul>
          </div>

          {/* Governance & Compliance */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Governance & Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-emerald-400 transition-colors">Zero-Knowledge Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Enterprise Service</Link></li>
              <li><Link href="/awareness" className="hover:text-emerald-400 transition-colors">Phishing Awareness Simulator</Link></li>
              <li><Link href="/admin" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><Lock className="h-3 w-3" /> Super Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-cyber-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} SIS CYBER FORTRESS. All security protocols and intellectual property reserved.</p>
          <p className="flex items-center gap-2 mt-2 sm:mt-0 font-mono">
            <span>TLS 1.3</span>
            <span>•</span>
            <span>AES-256-GCM Zero-Knowledge</span>
            <span>•</span>
            <span>PostgreSQL RLS Protected</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
