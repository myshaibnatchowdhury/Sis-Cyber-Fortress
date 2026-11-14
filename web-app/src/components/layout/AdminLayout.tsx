"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Users,
  KeyRound,
  Smartphone,
  Layers,
  AlertOctagon,
  LifeBuoy,
  Globe2,
  ScanLine,
  Flame,
  CloudCog,
  Briefcase,
  ScrollText,
  BarChart3,
  BellRing,
  Sliders,
  Database,
  HardDrive,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const ADMIN_SECTIONS = [
  {
    group: "Core Fleet",
    items: [
      { label: "1. Overview", href: "/admin", icon: LayoutDashboard },
      { label: "2. User Management", href: "/admin/users", icon: Users },
      { label: "3. Roles & RBAC", href: "/admin/roles", icon: KeyRound },
      { label: "4. Device Fleet", href: "/admin/devices", icon: Smartphone },
    ],
  },
  {
    group: "SOC & Security Operations",
    items: [
      { label: "5. 12 Modules Hub", href: "/admin/modules", icon: Layers },
      { label: "6. Security Alerts", href: "/admin/alerts", icon: AlertOctagon },
      { label: "7. Incident Triage", href: "/admin/incidents", icon: LifeBuoy },
      { label: "8. Asset Registry", href: "/admin/assets", icon: Globe2 },
      { label: "9. Website Scans", href: "/admin/scans", icon: ScanLine },
      { label: "10. Threat Intelligence", href: "/admin/threat-intel", icon: Flame },
    ],
  },
  {
    group: "Forensics & Governance",
    items: [
      { label: "11. Backup Audit", href: "/admin/backups", icon: CloudCog },
      { label: "12. Forensics Master", href: "/admin/forensics", icon: Briefcase },
      { label: "13. System Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
      { label: "14. Reports & BI", href: "/admin/reports", icon: BarChart3 },
      { label: "15. Notifications", href: "/admin/notifications", icon: BellRing },
    ],
  },
  {
    group: "Infrastructure & Telemetry",
    items: [
      { label: "16. System Settings", href: "/admin/settings", icon: Sliders },
      { label: "17. Supabase Status", href: "/admin/supabase", icon: Database },
      { label: "18. Storage Metrics", href: "/admin/storage", icon: HardDrive },
      { label: "19. System Health", href: "/admin/health", icon: HeartPulse },
    ],
  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isSuperAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between border-b border-cyber-border bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-emerald-400" />
          <span className="font-bold text-sm text-white">SUPER ADMIN CONSOLE</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded p-1 text-slate-400 hover:text-white"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-72 shrink-0 flex-col justify-between border-r border-cyber-border bg-slate-950 p-4 transition-transform md:flex ${
          mobileOpen ? "flex" : "hidden md:flex"
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Header */}
          <div className="flex items-center justify-between px-2 pt-2 border-b border-cyber-border/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40">
                <ShieldAlert className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block leading-tight">SUPER ADMIN</span>
                <span className="text-[10px] text-emerald-400 font-mono tracking-wider">ROOT ACCESS AUTHORIZED</span>
              </div>
            </div>
            <Link
              href="/portal"
              title="Switch to User Portal"
              className="text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          {/* Navigation Groups */}
          {ADMIN_SECTIONS.map((sec) => (
            <div key={sec.group}>
              <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {sec.group}
              </div>
              <nav className="space-y-0.5">
                {sec.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold"
                          : "text-slate-300 hover:bg-slate-900 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="h-3.5 w-3.5 text-emerald-400" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-cyber-border/80 pt-3 flex items-center justify-between px-2">
          <div className="overflow-hidden">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
            <span className="text-xs font-medium text-white truncate">{user?.email || "Super Admin"}</span>
          </div>
          <button
            onClick={() => logout()}
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded transition-colors"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Admin Topbar */}
        <header className="sticky top-0 z-30 border-b border-cyber-border bg-slate-950/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              SUPABASE DB: ONLINE • RLS ENFORCED • ZERO-TRUST
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/portal"
              className="rounded-lg bg-cyber-card border border-cyber-border px-3 py-1 text-xs text-slate-300 hover:text-white hover:border-emerald-500/40 transition-colors"
            >
              Exit to User Portal
            </Link>
            <div className="rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 text-[10px] font-mono font-bold">
              SUPER_ADMIN
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
