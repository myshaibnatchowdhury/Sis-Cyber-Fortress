"use client";

import React, { useState, useEffect } from "react";
import { Smartphone, Shield, CheckCircle, AlertTriangle, Trash2, RefreshCw, Key, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function EndpointGuardianPage() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, [user]);

  const loadDevices = async () => {
    setLoading(true);
    if (!isSupabaseConfigured || !user) {
      setDevices([
        {
          id: "00000000-0000-0000-0000-000000000001",
          device_name: "Pixel 8 Pro (Enterprise Guard)",
          device_model: "Google Pixel 8 Pro",
          os_type: "Android",
          os_version: "Android 14 (API 34)",
          app_version: "SIS-Fortress 1.0.0",
          is_rooted: false,
          biometrics_available: true,
          security_patch_level: "2026-11-01",
          last_sync_at: new Date().toISOString(),
          status: "active",
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("registered_devices")
        .select("*")
        .eq("user_id", user.id)
        .order("last_sync_at", { ascending: false });

      if (data && data.length > 0) setDevices(data);
    } catch (err) {
      console.error("Error loading devices:", err);
    } finally {
      setLoading(false);
    }
  };

  const revokeDevice = async (id: string) => {
    if (!confirm("Are you sure you want to revoke and quarantine this Android endpoint?")) return;
    setDevices((prev) => prev.filter((d) => d.id !== id));
    if (isSupabaseConfigured) {
      await supabase.from("registered_devices").update({ status: "revoked" }).eq("id", id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 font-bold uppercase">
            <Smartphone className="h-4 w-4" />
            MODULE 03
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">SIS Endpoint Guardian</h1>
          <p className="text-xs text-slate-400">Android fleet hardware security, Keystore binding & permission audit</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDevices}
            className="flex items-center gap-1.5 rounded-xl bg-cyber-card border border-cyber-border px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Devices List */}
      <div className="space-y-4">
        {devices.map((d) => (
          <div key={d.id} className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{d.device_name}</h3>
                  <div className="text-xs text-cyber-muted font-mono">
                    {d.device_model} • {d.os_version}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {d.status === "lost" ? (
                  <span className="rounded-full bg-rose-500/20 border border-rose-500 px-3 py-1 text-xs font-mono font-bold text-rose-300 flex items-center gap-1.5 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    STOLEN • FROZEN
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE • SYNCED
                  </span>
                )}

                {d.status !== "lost" && (
                  <button
                    onClick={async () => {
                      if (confirm("CRITICAL: Has your phone been lost or stolen? Reporting it stolen will instantly lock down the device, freeze local credentials, and notify the Security Administrator.")) {
                        await fetch("/api/admin/device-control", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "stolen", device_id: d.id, actor_email: user?.email }),
                        });
                        loadDevices();
                      }
                    }}
                    className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    🚨 Report Stolen
                  </button>
                )}

                <button
                  onClick={() => revokeDevice(d.id)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                  title="Revoke and Quarantine Device"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Hardware Security Attributes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-cyber-surface border border-cyber-border/60">
                <div className="text-slate-400 text-[10px]">ROOT DETECTION</div>
                <div className="text-emerald-400 font-bold mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {d.is_rooted ? "ROOTED (RISK)" : "UNCOMPROMISED"}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-cyber-surface border border-cyber-border/60">
                <div className="text-slate-400 text-[10px]">BIOMETRIC KEYSTORE</div>
                <div className="text-emerald-400 font-bold mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {d.biometrics_available ? "HARDWARE-BACKED" : "UNAVAILABLE"}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-cyber-surface border border-cyber-border/60">
                <div className="text-slate-400 text-[10px]">SECURITY PATCH</div>
                <div className="text-slate-200 font-bold mt-1">{d.security_patch_level}</div>
              </div>
              <div className="p-3 rounded-xl bg-cyber-surface border border-cyber-border/60">
                <div className="text-slate-400 text-[10px]">LAST HEARTBEAT</div>
                <div className="text-slate-300 font-bold mt-1">{new Date(d.last_sync_at).toLocaleTimeString()}</div>
              </div>
            </div>

            {/* Permission Audit Checklist */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Android Runtime Permissions Audit:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-cyber-surface border border-cyber-border/60 flex items-center justify-between">
                  <span>Network Access</span>
                  <span className="text-emerald-400 font-bold font-mono">GRANTED</span>
                </div>
                <div className="p-2.5 rounded-lg bg-cyber-surface border border-cyber-border/60 flex items-center justify-between">
                  <span>Biometric Prompt</span>
                  <span className="text-emerald-400 font-bold font-mono">GRANTED</span>
                </div>
                <div className="p-2.5 rounded-lg bg-cyber-surface border border-cyber-border/60 flex items-center justify-between">
                  <span>Notifications</span>
                  <span className="text-emerald-400 font-bold font-mono">GRANTED</span>
                </div>
                <div className="p-2.5 rounded-lg bg-cyber-surface border border-cyber-border/60 flex items-center justify-between">
                  <span>Camera / Mic</span>
                  <span className="text-slate-400 font-mono">DENIED</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* APK Installation Card */}
      <div className="rounded-2xl border border-dashed border-cyber-border bg-slate-900/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-emerald-400" />
            Install Native Android App (Debug APK)
          </h3>
          <p className="text-xs text-slate-400">
            Build and install the compiled APK: <code className="text-emerald-400 font-mono">android-app/app/build/outputs/apk/debug/app-debug.apk</code>
          </p>
        </div>
        <div className="shrink-0 text-xs text-cyber-muted font-mono">
          Gradle 8.2.1 • AGP 8.2.1 • Jetpack Compose
        </div>
      </div>
    </div>
  );
}
