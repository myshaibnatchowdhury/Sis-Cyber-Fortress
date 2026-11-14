"use client";

import React from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isSecurityAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center text-xs font-mono text-emerald-400">
        VERIFYING SUPER ADMIN ACCESS TOKEN...
      </div>
    );
  }

  if (!isSecurityAdmin) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-rose-500/30 bg-cyber-card p-8 text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold text-white">Access Denied: Super Admin Only</h1>
          <p className="text-xs text-slate-400">
            Your authenticated account does not possess Super Admin or Security Admin credentials.
          </p>
          <div className="pt-2">
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to User Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
