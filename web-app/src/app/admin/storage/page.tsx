"use client";

import React from "react";
import { HardDrive, Lock, ShieldCheck, Folder } from "lucide-react";

export default function AdminStorageUsagePage() {
  const buckets = [
    {
      name: "forensic-evidence",
      isPublic: false,
      limit: "100 MB",
      used: "34.8 MB",
      files: 8,
      mime: "application/pdf, application/zip, images, octet-stream",
    },
    {
      name: "cloud-backups",
      isPublic: false,
      limit: "200 MB",
      used: "24.2 MB",
      files: 12,
      mime: "application/octet-stream, application/zip",
    },
    {
      name: "reports",
      isPublic: false,
      limit: "25 MB",
      used: "2.1 MB",
      files: 5,
      mime: "application/pdf, application/json, text/csv",
    },
    {
      name: "avatars",
      isPublic: true,
      limit: "5 MB",
      used: "420 KB",
      files: 4,
      mime: "image/png, image/jpeg, image/webp",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-cyber-border pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
          <HardDrive className="h-4 w-4" />
          SECTION 18
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Storage Usage & Bucket Metrics</h1>
        <p className="text-xs text-slate-400">Supabase Storage buckets, private RLS policies & quota consumption</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buckets.map((b) => (
          <div key={b.name} className="rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-border/80 pb-3">
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-white">
                <Folder className="h-4 w-4 text-cyan-400" />
                {b.name}
              </div>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase font-bold ${
                  b.isPublic
                    ? "bg-slate-800 text-slate-300"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {b.isPublic ? "PUBLIC" : "PRIVATE (RLS)"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-cyber-surface border border-cyber-border/60">
                <div className="text-slate-400 text-[10px]">CONSUMED SPACE</div>
                <div className="text-emerald-400 font-bold mt-0.5">{b.used}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-cyber-surface border border-cyber-border/60">
                <div className="text-slate-400 text-[10px]">MAX FILE SIZE</div>
                <div className="text-white font-bold mt-0.5">{b.limit}</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              <span className="text-slate-500 block text-[9px]">ALLOWED MIME TYPES:</span>
              {b.mime}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
