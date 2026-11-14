"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Key,
  Globe,
  Smartphone,
  Wifi,
  Lock,
  FileCheck2,
  Search,
  Fingerprint,
  Radio,
  CloudUpload,
  AlertTriangle,
  LayoutDashboard,
  User,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
  History,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { label: "Overview", href: "/portal", icon: LayoutDashboard },
  { label: "01. Identity Guardian", href: "/portal/identity", icon: Fingerprint },
  { label: "02. Phishing Shield", href: "/portal/phishing", icon: Radio },
  { label: "03. Endpoint Guardian", href: "/portal/endpoint", icon: Smartphone },
  { label: "04. Network Sentinel", href: "/portal/network", icon: Wifi },
  { label: "05. Vault Guardian", href: "/portal/vault", icon: Key },
  { label: "06. Ransomware Guardian", href: "/portal/ransomware", icon: Lock },
  { label: "07. WebShield (SSRF-Guard)", href: "/portal/webshield", icon: Globe },
  { label: "08. Digital Forensics", href: "/portal/forensics", icon: Search },
  { label: "09. Access Guardian", href: "/portal/access", icon: Shield },
  { label: "10. Threat Intelligence", href: "/portal/threat-intelligence", icon: Radio },
  { label: "11. Cloud Backup", href: "/portal/backup", icon: CloudUpload },
  { label: "12. Cyber SOC / Alerts", href: "/portal/soc", icon: AlertTriangle },
];

const ACCOUNT_ITEMS = [
  { label: "My Devices", href: "/portal/devices", icon: Smartphone },
  { label: "Activity History", href: "/portal/activity", icon: History },
  { label: "Security & Privacy", href: "/portal/settings", icon: Settings },
  { label: "My Profile", href: "/portal/profile", icon: User },
];

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, profile, isSuperAdmin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Sidebar Header */}
      <div className="md:hidden flex items-center justify-between border-b border-cyber-border bg-cyber-surface px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-400" />
          <span className="font-bold text-sm tracking-tight text-white">SIS CYBER FORTRESS</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded p-1.5 text-slate-400 hover:bg-cyber-card hover:text-white"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 shrink-0 flex-col justify-between border-r border-cyber-border bg-cyber-surface p-4 transition-transform duration-200 md:flex ${
          sidebarOpen ? "flex" : "hidden md:flex"
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Brand header */}
          <Link href="/" className="flex items-center gap-2.5 px-2 pt-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <Shield className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block leading-tight">SIS FORTRESS</span>
              <span className="text-[10px] text-cyber-muted font-mono">USER SECURITY PORTAL</span>
            </div>
          </Link>

          {/* 12 Core Modules */}
          <div>
            <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Security Modules
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold"
                        : "text-slate-300 hover:bg-cyber-card hover:text-white"
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

          {/* Account & Hardware */}
          <div>
            <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Fleet & Settings
            </div>
            <nav className="space-y-1">
              {ACCOUNT_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "text-slate-300 hover:bg-cyber-card hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Footbar */}
        <div className="border-t border-cyber-border/80 pt-3 space-y-2">
          {isSuperAdmin && (
            <Link
              href="/admin"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30 transition-all"
            >
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              Super Admin Console
            </Link>
          )}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white truncate">
                {profile?.full_name || user?.email || "Security Analyst"}
              </p>
              <p className="text-[10px] text-cyber-muted truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="rounded p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 border-b border-cyber-border bg-cyber-bg/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-300">
              SECURITY SCORE:{" "}
              <span className="text-emerald-400 font-bold">{profile?.security_score ?? 85}/100</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/portal/notifications"
              className="relative p-1.5 text-slate-300 hover:text-white transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500" />
            </Link>
            <div className="rounded-full bg-slate-800 border border-cyber-border px-3 py-1 text-[11px] font-mono text-emerald-400">
              ROLE: {profile?.roles?.[0] || "standard_user"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
