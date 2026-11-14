-- ==============================================================================
-- SIS CYBER FORTRESS — 001_initial_schema.sql
-- Complete PostgreSQL Database Schema for Core & 12 Security Modules
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. CORE ARCHITECTURE TABLES
-- ==============================================================================

-- User Profiles (Linked 1-to-1 with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone_number TEXT,
    security_score INTEGER DEFAULT 85 CHECK (security_score BETWEEN 0 AND 100),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    is_suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Central Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Granular Permissions Table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    module TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Role-Permission Mapping
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- User Role Assignments
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, role_id)
);

-- User Privacy Consents
CREATE TABLE IF NOT EXISTS public.user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    granted BOOLEAN DEFAULT TRUE NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    UNIQUE(user_id, consent_type)
);

-- User Session Metadata
CREATE TABLE IF NOT EXISTS public.user_sessions_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_info TEXT,
    ip_address TEXT,
    location_display TEXT,
    last_active TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Registered Android Devices
CREATE TABLE IF NOT EXISTS public.registered_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_identifier TEXT NOT NULL,
    device_name TEXT NOT NULL,
    device_model TEXT,
    os_type TEXT DEFAULT 'Android' NOT NULL,
    os_version TEXT,
    app_version TEXT,
    is_rooted BOOLEAN DEFAULT FALSE NOT NULL,
    biometrics_available BOOLEAN DEFAULT FALSE NOT NULL,
    security_patch_level TEXT,
    last_sync_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'revoked', 'lost', 'quarantined')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, device_identifier)
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' NOT NULL CHECK (type IN ('info', 'warning', 'danger', 'success')),
    module TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Immutable Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    ip_address TEXT,
    details JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- System Settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 2. MODULE 01 — SIS IDENTITY GUARDIAN
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.identity_security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    ip_address TEXT,
    location_city TEXT,
    risk_level TEXT DEFAULT 'low' NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.account_security_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    check_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pass', 'warn', 'fail')),
    details JSONB DEFAULT '{}'::jsonb NOT NULL,
    checked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 3. MODULE 02 — SIS PHISHING SHIELD
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.phishing_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    normalized_url TEXT NOT NULL,
    domain TEXT NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical', 'unknown')),
    risk_score INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    heuristic_flags JSONB DEFAULT '[]'::jsonb NOT NULL,
    threat_reputation TEXT DEFAULT 'clean' NOT NULL,
    summary TEXT,
    scanned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.phishing_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    report_type TEXT NOT NULL CHECK (report_type IN ('threat_submission', 'false_positive')),
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'reviewed', 'accepted', 'dismissed')),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.url_reputation_cache (
    domain TEXT PRIMARY KEY,
    reputation TEXT NOT NULL,
    categories JSONB DEFAULT '[]'::jsonb NOT NULL,
    source TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 4. MODULE 03 — SIS ENDPOINT GUARDIAN
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.endpoint_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.registered_devices(id) ON DELETE CASCADE,
    package_name TEXT NOT NULL,
    app_name TEXT NOT NULL,
    version_name TEXT,
    is_system_app BOOLEAN DEFAULT FALSE NOT NULL,
    installed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.endpoint_security_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.registered_devices(id) ON DELETE CASCADE,
    screen_lock_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    biometric_enrolled BOOLEAN DEFAULT FALSE NOT NULL,
    encryption_status TEXT DEFAULT 'encrypted' NOT NULL,
    developer_options_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    usb_debugging_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    root_detected BOOLEAN DEFAULT FALSE NOT NULL,
    posture_score INTEGER DEFAULT 90 CHECK (posture_score BETWEEN 0 AND 100),
    last_checked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.endpoint_permission_overview (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.registered_devices(id) ON DELETE CASCADE,
    permission_name TEXT NOT NULL,
    is_granted BOOLEAN DEFAULT FALSE NOT NULL,
    risk_tier TEXT DEFAULT 'normal' NOT NULL CHECK (risk_tier IN ('normal', 'dangerous', 'privileged'))
);

-- ==============================================================================
-- 5. MODULE 04 — SIS NETWORK SENTINEL
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.network_security_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_id UUID REFERENCES public.registered_devices(id) ON DELETE SET NULL,
    connection_type TEXT NOT NULL,
    ssid TEXT,
    is_open_wifi BOOLEAN DEFAULT FALSE NOT NULL,
    vpn_active BOOLEAN DEFAULT FALSE NOT NULL,
    dns_server TEXT,
    ip_address TEXT,
    gateway TEXT,
    risk_level TEXT DEFAULT 'low' NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    findings JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.network_risk_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'warning' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 6. MODULE 05 — SIS VAULT GUARDIAN (ZERO-KNOWLEDGE ENCRYPTED)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.vault_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    salt TEXT NOT NULL,
    kdf_iterations INTEGER DEFAULT 100000 NOT NULL,
    item_count INTEGER DEFAULT 0 NOT NULL,
    auto_lock_minutes INTEGER DEFAULT 5 NOT NULL,
    last_unlocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.encrypted_vault_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title_hint TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('note', 'credential', 'card', 'key', 'document')),
    encrypted_blob TEXT NOT NULL, -- Ciphertext base64
    iv TEXT NOT NULL,            -- Initialization Vector base64
    auth_tag TEXT,              -- GCM auth tag base64
    favorite BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.vault_recovery_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recovery_hint TEXT,
    key_check_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 7. MODULE 06 — SIS RANSOMWARE GUARDIAN
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.recovery_readiness_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    backup_configured BOOLEAN DEFAULT FALSE NOT NULL,
    offline_backup_exists BOOLEAN DEFAULT FALSE NOT NULL,
    readiness_score INTEGER DEFAULT 75 CHECK (readiness_score BETWEEN 0 AND 100),
    checklist JSONB DEFAULT '[]'::jsonb NOT NULL,
    last_evaluated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.file_integrity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_id UUID REFERENCES public.registered_devices(id) ON DELETE SET NULL,
    file_path_hint TEXT NOT NULL,
    expected_hash TEXT,
    actual_hash TEXT,
    event_type TEXT NOT NULL,
    severity TEXT DEFAULT 'warning' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 8. MODULE 07 — SIS WEBSHIELD (AUTHORIZED WEBSITE ASSESSMENT)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.authorized_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    authorization_method TEXT DEFAULT 'dns_txt' NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.website_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.authorized_assets(id) ON DELETE CASCADE,
    target_url TEXT NOT NULL,
    status TEXT DEFAULT 'completed' NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
    score INTEGER DEFAULT 80 CHECK (score BETWEEN 0 AND 100),
    tls_valid BOOLEAN DEFAULT TRUE NOT NULL,
    tls_issuer TEXT,
    tls_expires_at TIMESTAMPTZ,
    headers_checked JSONB DEFAULT '{}'::jsonb NOT NULL,
    dns_sec_valid BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.website_scan_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES public.website_scans(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    remediation TEXT NOT NULL
);

-- ==============================================================================
-- 9. MODULE 08 — SIS DIGITAL FORENSICS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.forensic_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_reference TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'medium' NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status TEXT DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'investigating', 'pending_review', 'closed')),
    lead_investigator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.forensic_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.forensic_cases(id) ON DELETE CASCADE,
    evidence_number TEXT NOT NULL,
    item_name TEXT NOT NULL,
    file_path TEXT,
    sha256_hash TEXT NOT NULL,
    file_size_bytes BIGINT,
    source_device TEXT,
    acquired_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    acquired_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.evidence_custody_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id UUID NOT NULL REFERENCES public.forensic_evidence(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    recipient TEXT,
    reason TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 10. MODULE 09 — SIS ACCESS GUARDIAN
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.access_security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    status TEXT DEFAULT 'success' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.session_security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 11. MODULE 10 — SIS THREAT INTELLIGENCE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.threat_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    feed_url TEXT,
    trust_score INTEGER DEFAULT 80 CHECK (trust_score BETWEEN 0 AND 100),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_synced_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.threat_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES public.threat_sources(id) ON DELETE SET NULL,
    indicator_type TEXT NOT NULL CHECK (indicator_type IN ('domain', 'url', 'ip', 'hash')),
    indicator_value TEXT NOT NULL,
    severity TEXT DEFAULT 'high' NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    threat_actor TEXT,
    malware_family TEXT,
    description TEXT,
    confidence INTEGER DEFAULT 85 CHECK (confidence BETWEEN 0 AND 100),
    first_seen TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_seen TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.threat_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#10B981' NOT NULL
);

CREATE TABLE IF NOT EXISTS public.threat_indicator_tags (
    indicator_id UUID NOT NULL REFERENCES public.threat_indicators(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.threat_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (indicator_id, tag_id)
);

-- ==============================================================================
-- 12. MODULE 11 — SIS CLOUD BACKUP GUARDIAN
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.backup_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_name TEXT NOT NULL,
    backup_type TEXT DEFAULT 'full' NOT NULL CHECK (backup_type IN ('full', 'incremental', 'vault_snapshot')),
    status TEXT DEFAULT 'completed' NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    size_bytes BIGINT DEFAULT 0 NOT NULL,
    is_encrypted BOOLEAN DEFAULT TRUE NOT NULL,
    sha256_hash TEXT,
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.backup_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.backup_jobs(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    content_type TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.restore_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.backup_jobs(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'completed' NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    target_location TEXT,
    restored_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.backup_integrity_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.backup_jobs(id) ON DELETE CASCADE,
    verified_hash TEXT NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 13. MODULE 12 — SIS CYBER SOC
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_reference TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
    source_module TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    device_id UUID REFERENCES public.registered_devices(id) ON DELETE SET NULL,
    is_resolved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.security_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number TEXT UNIQUE NOT NULL,
    alert_id UUID REFERENCES public.security_alerts(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status TEXT DEFAULT 'new' NOT NULL CHECK (status IN ('new', 'under_review', 'assigned', 'investigating', 'resolved', 'closed')),
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.incident_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.security_incidents(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.incident_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.security_incidents(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- INDEXES FOR FREQUENT QUERIES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.registered_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_phishing_scans_user ON public.phishing_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_phishing_scans_domain ON public.phishing_scans(domain);
CREATE INDEX IF NOT EXISTS idx_vault_items_user ON public.encrypted_vault_items(user_id);
CREATE INDEX IF NOT EXISTS idx_website_scans_asset ON public.website_scans(asset_id);
CREATE INDEX IF NOT EXISTS idx_forensic_cases_status ON public.forensic_cases(status);
CREATE INDEX IF NOT EXISTS idx_forensic_evidence_case ON public.forensic_evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_threat_indicators_value ON public.threat_indicators(indicator_value);
CREATE INDEX IF NOT EXISTS idx_threat_indicators_type ON public.threat_indicators(indicator_type);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_user ON public.backup_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON public.security_alerts(severity, is_resolved);
CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON public.security_incidents(status);
