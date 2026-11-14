"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield, Lock, Menu, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isSuperAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyber-border/80 bg-cyber-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/40 group-hover:border-emerald-400 transition-colors">
            <Shield className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 rounded-xl bg-emerald-500/10 blur group-hover:bg-emerald-500/20 transition-all" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              SIS CYBER FORTRESS
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                12-in-1
              </span>
            </span>
            <span className="text-[11px] font-medium text-cyber-muted">Enterprise Defense Ecosystem</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/modules" className="hover:text-emerald-400 transition-colors">
            12 Modules
          </Link>
          <Link href="/features" className="hover:text-emerald-400 transition-colors">
            Architecture
          </Link>
          <Link href="/awareness" className="hover:text-emerald-400 transition-colors">
            Awareness Hub
          </Link>
          <Link href="/about" className="hover:text-emerald-400 transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-emerald-400 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Auth CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/portal"
                className="flex items-center gap-2 rounded-lg bg-cyber-card px-3.5 py-2 text-xs font-semibold text-white border border-cyber-border hover:border-emerald-500/50 hover:bg-slate-800 transition-all"
              >
                User Portal
              </Link>
              {isSuperAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/30"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Super Admin
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-all shadow-md shadow-emerald-950"
              >
                Deploy Fortress
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-lg p-2 text-slate-400 hover:bg-cyber-card hover:text-white"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-cyber-border bg-cyber-bg/95 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/modules"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-emerald-400"
          >
            12 Security Modules
          </Link>
          <Link
            href="/features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-emerald-400"
          >
            Architecture
          </Link>
          <Link
            href="/awareness"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-emerald-400"
          >
            Awareness Hub
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-emerald-400"
          >
            About SIS Cyber Fortress
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-emerald-400"
          >
            Contact Security Ops
          </Link>
          <div className="pt-3 border-t border-cyber-border flex flex-col gap-2">
            <Link
              href="/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center rounded-lg bg-cyber-card py-2 text-sm font-semibold text-white border border-cyber-border"
            >
              Enter User Portal
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white"
            >
              Super Admin Console
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
