// ==============================================================================
// SIS CYBER FORTRESS — Shared Types & Entity Definitions
// ==============================================================================

export type UserRole =
  | "super_admin"
  | "security_admin"
  | "module_admin"
  | "auditor"
  | "standard_user";

export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info";

export type IncidentStatus =
  | "new"
  | "under_review"
  | "assigned"
  | "investigating"
  | "resolved"
  | "closed";

export type DeviceStatus = "active" | "revoked" | "lost" | "quarantined";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  security_score: number;
  mfa_enabled: boolean;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
  roles?: UserRole[];
}

export interface RegisteredDevice {
  id: string;
  user_id: string;
  device_identifier: string;
  device_name: string;
  device_model: string | null;
  os_type: string;
  os_version: string | null;
  app_version: string | null;
  is_rooted: boolean;
  biometrics_available: boolean;
  security_patch_level: string | null;
  last_sync_at: string;
  status: DeviceStatus;
  created_at: string;
  updated_at: string;
}

export interface EncryptedVaultItem {
  id: string;
  user_id: string;
  title_hint: string;
  item_type: "note" | "credential" | "card" | "key" | "document";
  encrypted_blob: string; // Base64 ciphertext
  iv: string;            // Base64 initialization vector
  auth_tag?: string;     // Base64 GCM auth tag
  favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface PhishingScanResult {
  id: string;
  user_id: string;
  url: string;
  normalized_url: string;
  domain: string;
  risk_level: "critical" | "high" | "medium" | "low" | "unknown";
  risk_score: number;
  heuristic_flags: string[];
  threat_reputation: string;
  summary: string;
  scanned_at: string;
}

export interface WebShieldFinding {
  title: string;
  severity: SeverityLevel;
  category: string;
  description: string;
  remediation: string;
}

export interface WebShieldScan {
  id: string;
  asset_id: string;
  target_url: string;
  status: "running" | "completed" | "failed";
  score: number;
  tls_valid: boolean;
  tls_issuer: string | null;
  headers_checked: Record<string, boolean>;
  dns_sec_valid: boolean;
  findings?: WebShieldFinding[];
  created_at: string;
}

export interface ForensicCase {
  id: string;
  case_reference: string;
  title: string;
  description: string | null;
  severity: SeverityLevel;
  status: "open" | "investigating" | "pending_review" | "closed";
  lead_investigator_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ForensicEvidence {
  id: string;
  case_id: string;
  evidence_number: string;
  item_name: string;
  file_path: string | null;
  sha256_hash: string;
  file_size_bytes: number | null;
  source_device: string | null;
  acquired_by: string | null;
  acquired_at: string;
  notes: string | null;
}

export interface ThreatIndicator {
  id: string;
  source_id: string | null;
  indicator_type: "domain" | "url" | "ip" | "hash";
  indicator_value: string;
  severity: SeverityLevel;
  threat_actor: string | null;
  malware_family: string | null;
  description: string | null;
  confidence: number;
  first_seen: string;
  last_seen: string;
  tags?: string[];
}

export interface SecurityAlert {
  id: string;
  alert_reference: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  source_module: string;
  user_id: string | null;
  device_id: string | null;
  is_resolved: boolean;
  created_at: string;
}

export interface SecurityIncident {
  id: string;
  incident_number: string;
  alert_id: string | null;
  title: string;
  description: string | null;
  severity: SeverityLevel;
  status: IncidentStatus;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SystemAuditLog {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  ip_address: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface CloudBackupJob {
  id: string;
  user_id: string;
  job_name: string;
  backup_type: "full" | "incremental" | "vault_snapshot";
  status: "pending" | "running" | "completed" | "failed";
  size_bytes: number;
  is_encrypted: boolean;
  sha256_hash: string | null;
  storage_path: string | null;
  created_at: string;
}
