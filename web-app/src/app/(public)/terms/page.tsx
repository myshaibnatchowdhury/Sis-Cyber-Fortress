import React from "react";
import { ShieldAlert, FileText, CheckCircle } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cyber-bg text-slate-100">
      <PublicHeader />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Terms & Conditions of Service
            </h1>
            <p className="text-xs text-cyber-muted font-mono">EFFECTIVE: ENTERPRISE ECOSYSTEM DEPLOYMENT</p>
          </div>

          <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-emerald-400" />
                1. Authorized Assessment Scope
              </h2>
              <p>
                Module 07 (SIS WebShield) must only be used against domain names and web properties that you own, operate, or possess explicit written authorization to assess. You agree not to launch scanning workflows against third-party systems without legitimate authority.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                2. Acceptable Use Policy
              </h2>
              <p>
                SIS CYBER FORTRESS is engineered exclusively for defensive protection, threat intelligence, and disaster readiness. Attempting to defeat access controls, spoof identities, or bypass security restrictions is strictly prohibited under our acceptable use standard.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
