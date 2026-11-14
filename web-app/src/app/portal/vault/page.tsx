"use client";

import React, { useState, useEffect } from "react";
import { Key, Lock, Unlock, Plus, Trash2, Eye, EyeOff, ShieldCheck, AlertCircle, Copy, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { deriveKeyFromPassphrase, encryptVaultItem, decryptVaultItem } from "@/lib/vaultCrypto";

interface VaultItem {
  id: string;
  title_hint: string;
  item_type: "note" | "credential" | "card" | "key" | "document";
  decryptedContent?: string;
  encrypted_blob: string;
  iv: string;
  created_at: string;
}

export default function VaultGuardianPage() {
  const { user } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [derivedKey, setDerivedKey] = useState<CryptoKey | null>(null);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New item modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"note" | "credential" | "card" | "key">("note");
  const [newContent, setNewContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-lock timer (5 minutes)
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isUnlocked) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            lockVault();
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isUnlocked]);

  const unlockVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase) return;
    setError(null);
    setLoading(true);

    try {
      // Deterministic user salt or lookup from vault_metadata
      const salt = "4a8f9b1c2d3e4f5a6b7c8d9e0f1a2b3c";
      const key = await deriveKeyFromPassphrase(passphrase, salt);
      setDerivedKey(key);

      // Load and decrypt items
      await loadAndDecryptItems(key);
      setIsUnlocked(true);
      setTimeLeft(300);
    } catch (err) {
      setError(`Unlock failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadAndDecryptItems = async (key: CryptoKey) => {
    if (!isSupabaseConfigured || !user) {
      // Offline / demo vault items
      const mockItems: VaultItem[] = [
        {
          id: "1",
          title_hint: "Enterprise SSH Private Key",
          item_type: "key",
          encrypted_blob: "mock",
          iv: "mock",
          decryptedContent: "-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn\n-----END OPENSSH PRIVATE KEY-----",
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "2",
          title_hint: "Production Database Password",
          item_type: "credential",
          encrypted_blob: "mock",
          iv: "mock",
          decryptedContent: "P@ssw0rd_Sis_Fortress_2026!#UltraSecure",
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
      setItems(mockItems);
      return;
    }

    const { data, error: fetchErr } = await supabase
      .from("encrypted_vault_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchErr) throw fetchErr;

    if (data) {
      const decryptedList: VaultItem[] = [];
      for (const row of data) {
        try {
          const content = await decryptVaultItem(row.encrypted_blob, row.iv, key);
          decryptedList.push({ ...row, decryptedContent: content });
        } catch {
          decryptedList.push({ ...row, decryptedContent: "[Decryption Failed - Key Mismatch]" });
        }
      }
      setItems(decryptedList);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!derivedKey || !newTitle || !newContent) return;

    try {
      // 1. Client-Side AES-256-GCM Encryption
      const { ciphertext, iv } = await encryptVaultItem(newContent, derivedKey);

      if (!isSupabaseConfigured || !user) {
        const newItem: VaultItem = {
          id: Date.now().toString(),
          title_hint: newTitle,
          item_type: newType,
          encrypted_blob: ciphertext,
          iv,
          decryptedContent: newContent,
          created_at: new Date().toISOString(),
        };
        setItems([newItem, ...items]);
      } else {
        const { data, error: insertErr } = await supabase
          .from("encrypted_vault_items")
          .insert({
            user_id: user.id,
            title_hint: newTitle,
            item_type: newType,
            encrypted_blob: ciphertext,
            iv,
          })
          .select()
          .single();

        if (insertErr) throw insertErr;

        setItems([{ ...data, decryptedContent: newContent }, ...items]);
      }

      setShowAddModal(false);
      setNewTitle("");
      setNewContent("");
    } catch (err) {
      alert(`Encryption failed: ${(err as Error).message}`);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this encrypted vault item?")) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (isSupabaseConfigured) {
      await supabase.from("encrypted_vault_items").delete().eq("id", id);
    }
  };

  const lockVault = () => {
    setIsUnlocked(false);
    setDerivedKey(null);
    setPassphrase("");
    setItems([]);
  };

  const copyToClipboard = (id: string, text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase">
            <Key className="h-4 w-4" />
            MODULE 05
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">SIS Vault Guardian</h1>
          <p className="text-xs text-slate-400">Zero-Knowledge client-side AES-256-GCM encryption • Server never sees plaintext</p>
        </div>

        {isUnlocked && (
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-slate-400">
              AUTO-LOCK: <span className="text-amber-400 font-bold">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Secret
            </button>
            <button
              onClick={lockVault}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-cyber-border px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              <Lock className="h-4 w-4 text-amber-400" />
              Lock Vault
            </button>
          </div>
        )}
      </div>

      {!isUnlocked ? (
        /* Locked Vault View */
        <div className="max-w-md mx-auto my-12 rounded-2xl border border-cyber-border bg-cyber-card p-8 text-center space-y-6 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Lock className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Vault is Locked & Encrypted</h2>
            <p className="text-xs text-slate-400">
              Enter your master passphrase to derive the AES-256-GCM decryption key in local browser memory.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400 text-left">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={unlockVault} className="space-y-4">
            <input
              type="password"
              required
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter master vault passphrase..."
              className="w-full rounded-xl border border-cyber-border bg-cyber-surface px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              <Unlock className="h-4 w-4" />
              {loading ? "Deriving Key & Decrypting..." : "Unlock Vault Plaintexts"}
            </button>
          </form>

          <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            PBKDF2 100,000 Iterations • Web Crypto API
          </div>
        </div>
      ) : (
        /* Unlocked Items View */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{items.length} Secure Vault Entries Decrypted</span>
            <span className="font-mono text-emerald-400">AES-256-GCM IN-MEMORY DECRYPTION ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-cyber-border bg-cyber-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 text-[10px] font-mono uppercase font-bold">
                      {item.item_type}
                    </span>
                    <h3 className="text-sm font-bold text-white">{item.title_hint}</h3>
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Delete Vault Item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative rounded-xl bg-cyber-surface border border-cyber-border/80 p-3 font-mono text-xs text-emerald-300 break-all select-all">
                  {item.decryptedContent}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    Created: {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => copyToClipboard(item.id, item.decryptedContent)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Plaintext</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Secret Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-cyber-border bg-cyber-card p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-emerald-400" />
              Encrypt New Secret
            </h3>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Title / Label</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="AWS Secret Key / API Token / Master Note"
                  className="w-full rounded-xl border border-cyber-border bg-cyber-surface p-3 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Secret Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full rounded-xl border border-cyber-border bg-cyber-surface p-3 text-white focus:outline-none"
                >
                  <option value="note">Encrypted Secure Note</option>
                  <option value="credential">Username & Password</option>
                  <option value="key">Cryptographic Key / API Secret</option>
                  <option value="card">Payment Card Details</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Secret Plaintext (Encrypted Locally Before Sending)</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste your sensitive plaintext here..."
                  className="w-full rounded-xl border border-cyber-border bg-cyber-surface p-3 text-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                >
                  Encrypt & Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
