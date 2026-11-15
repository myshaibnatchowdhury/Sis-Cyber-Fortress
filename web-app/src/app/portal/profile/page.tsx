"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Smartphone, Key, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function MyProfilePage() {
  const { profile, user, roles } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || "");
  const [saved, setSaved] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
    if (profile?.phone_number) setPhoneNumber(profile.phone_number);
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      if (isSupabaseConfigured && user) {
        await supabase
          .from("profiles")
          .update({
            full_name: fullName,
            phone_number: phoneNumber,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-cyber-border pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Security Officer Profile</h1>
        <p className="text-xs text-slate-400">Account identity & cryptographic keys association</p>
      </div>

      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-6">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-cyber-border bg-cyber-surface p-3 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Associated Enterprise Email</label>
            <input
              type="email"
              disabled
              value={user?.email || "analyst@defense.internal"}
              className="w-full rounded-xl border border-cyber-border bg-slate-900 p-3 text-slate-400 cursor-not-allowed font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Assigned Security Roles</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {roles.map((r) => (
                <span
                  key={r}
                  className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 font-mono font-bold text-emerald-400 uppercase text-[10px]"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              {isUpdating ? "Synchronizing with Fortress..." : saved ? "✓ Profile Updated!" : "Save Profile Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
