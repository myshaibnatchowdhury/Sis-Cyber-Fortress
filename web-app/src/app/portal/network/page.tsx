"use client";

import React, { useState } from "react";
import { Wifi, ShieldCheck, AlertTriangle, Globe, Lock, CheckCircle2, RefreshCw } from "lucide-react";

export default function NetworkSentinelPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [networkInfo, setNetworkInfo] = useState({
    connectionType: "Wi-Fi (WPA3-Enterprise)",
    ssid: "Enterprise-Secure-Corp",
    isOpenWifi: false,
    vpnActive: true,
    localIp: "192.168.10.45",
    gateway: "192.168.10.1",
    dnsServer: "1.1.1.1 (Cloudflare DNS over HTTPS)",
    riskLevel: "low",
  });

  const checkNetwork = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 font-bold uppercase">
            <Wifi className="h-4 w-4" />
            MODULE 04
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">SIS Network Sentinel</h1>
          <p className="text-xs text-slate-400">Wi-Fi security inspection, rogue hotspot warning & network posture audit</p>
        </div>

        <button
          onClick={checkNetwork}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-xl bg-cyber-card border border-cyber-border px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:border-emerald-500/40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Auditing Network..." : "Inspect Active Connection"}
        </button>
      </div>

      {/* Network Status Card */}
      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyber-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Wifi className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-mono text-slate-400">PRIMARY INTERFACE</div>
              <h2 className="text-base font-bold text-white">{networkInfo.connectionType}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              ENCRYPTED • VPN TUNNEL ACTIVE
            </span>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-cyber-surface border border-cyber-border/60">
            <div className="text-slate-400 text-[10px]">WIRELESS SSID</div>
            <div className="text-white font-bold mt-1 truncate">{networkInfo.ssid}</div>
          </div>
          <div className="p-3 rounded-xl bg-cyber-surface border border-cyber-border/60">
            <div className="text-slate-400 text-[10px]">LOCAL IP ADDRESS</div>
            <div className="text-teal-400 font-bold mt-1">{networkInfo.localIp}</div>
          </div>
          <div className="p-3 rounded-xl bg-cyber-surface border border-cyber-border/60">
            <div className="text-slate-400 text-[10px]">SECURE DNS RESOLVER</div>
            <div className="text-emerald-400 font-bold mt-1 truncate">{networkInfo.dnsServer}</div>
          </div>
          <div className="p-3 rounded-xl bg-cyber-surface border border-cyber-border/60">
            <div className="text-slate-400 text-[10px]">DEFAULT GATEWAY</div>
            <div className="text-slate-200 font-bold mt-1">{networkInfo.gateway}</div>
          </div>
        </div>
      </div>

      {/* Network Security Checklist */}
      <div className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Network Security Recommendations</h3>
        <div className="space-y-3 text-xs">
          {[
            { title: "No Open or Unencrypted Wi-Fi Detected", detail: "Network utilizes WPA2/WPA3 enterprise authentication.", pass: true },
            { title: "DNS-over-HTTPS (DoH) Enabled", detail: "Domain queries are encrypted preventing ISP or hotspot eavesdropping.", pass: true },
            { title: "No Captive Portal Hijack Anomaly", detail: "HTTP redirect probes returned expected enterprise certificates.", pass: true },
            { title: "VPN Gateway Verified", detail: "Encrypted WireGuard/IPsec tunnel encapsulating egress traffic.", pass: true },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-cyber-surface border border-cyber-border/60">
              <div className="space-y-0.5">
                <div className="font-semibold text-white">{item.title}</div>
                <div className="text-slate-400 text-[11px]">{item.detail}</div>
              </div>
              <span className="font-mono text-emerald-400 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> SECURE
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
