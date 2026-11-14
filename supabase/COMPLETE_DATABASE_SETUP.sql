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
-- ==============================================================================
-- SIS CYBER FORTRESS — 002_rbac_and_functions.sql
-- Role-Based Access Control Functions, Triggers, & Automated Security Handlers
-- ==============================================================================

-- ==============================================================================
-- 1. SECURITY DEFINER HELPER FUNCTIONS FOR RBAC
-- ==============================================================================

-- Check if a specific user has a given role name
CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, role_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = check_user_id 
      AND r.name = role_name
  );
$$;

-- Check if current authenticated caller is a Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin');
$$;

-- Check if current authenticated caller is a Security Admin
CREATE OR REPLACE FUNCTION public.is_security_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin') 
      OR public.has_role(auth.uid(), 'security_admin');
$$;

-- Check if current authenticated caller is a Module Admin
CREATE OR REPLACE FUNCTION public.is_module_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin') 
      OR public.has_role(auth.uid(), 'security_admin')
      OR public.has_role(auth.uid(), 'module_admin');
$$;

-- Check if current authenticated caller is an Auditor (read-only)
CREATE OR REPLACE FUNCTION public.is_auditor()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT public.has_role(auth.uid(), 'auditor');
$$;

-- Check if caller is any administrative or auditor role
CREATE OR REPLACE FUNCTION public.is_admin_or_auditor()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT public.is_module_admin() OR public.is_auditor();
$$;

-- Return all role names for the current user
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TEXT[]
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT COALESCE(array_agg(r.name), ARRAY[]::TEXT[])
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid();
$$;

-- ==============================================================================
-- 2. AUTOMATIC PROFILE & ROLE PROVISIONING TRIGGER
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_standard_role_id UUID;
  v_user_salt TEXT;
BEGIN
  -- Insert User Profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    security_score,
    mfa_enabled,
    is_suspended
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    85,
    FALSE,
    FALSE
  ) ON CONFLICT (id) DO NOTHING;

  -- Lookup standard_user role
  SELECT id INTO v_standard_role_id FROM public.roles WHERE name = 'standard_user';

  -- If roles table is not seeded yet, fallback safely
  IF v_standard_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, v_standard_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  -- Generate Salt for Zero-Knowledge Vault
  v_user_salt := encode(gen_random_bytes(16), 'hex');
  INSERT INTO public.vault_metadata (user_id, salt, kdf_iterations, item_count, auto_lock_minutes)
  VALUES (NEW.id, v_user_salt, 100000, 0, 5)
  ON CONFLICT (user_id) DO NOTHING;

  -- Default Consents
  INSERT INTO public.user_consents (user_id, consent_type, granted)
  VALUES 
    (NEW.id, 'device_telemetry', TRUE),
    (NEW.id, 'security_scanning', TRUE)
  ON CONFLICT (user_id, consent_type) DO NOTHING;

  -- Welcome Notification
  INSERT INTO public.notifications (user_id, title, message, type, module)
  VALUES (
    NEW.id,
    'Welcome to SIS Cyber Fortress',
    'Your cybersecurity ecosystem is active. Review your Identity and Endpoint security status.',
    'info',
    'core'
  );

  -- Initial Audit Log
  INSERT INTO public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, details)
  VALUES (
    NEW.id,
    NEW.email,
    'USER_REGISTERED',
    'auth.users',
    NEW.id::TEXT,
    jsonb_build_object('registration_method', 'supabase_auth')
  );

  RETURN NEW;
END;
$$;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. UPDATED_AT TIMESTAMP TRIGGER
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_devices_updated_at
  BEFORE UPDATE ON public.registered_devices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_vault_items_updated_at
  BEFORE UPDATE ON public.encrypted_vault_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_forensic_cases_updated_at
  BEFORE UPDATE ON public.forensic_cases
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_incidents_updated_at
  BEFORE UPDATE ON public.security_incidents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 4. SAFE SUPER ADMIN INITIALIZATION PROCEDURE
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.initialize_super_admin(target_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_super_role_id UUID;
  v_count_super_admins INTEGER;
BEGIN
  -- Check existing Super Admins count
  SELECT COUNT(*) INTO v_count_super_admins
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE r.name = 'super_admin';

  -- If super admins already exist, caller MUST be a super admin
  IF v_count_super_admins > 0 AND NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only an existing Super Admin can assign the Super Admin role.';
  END IF;

  -- Locate target profile by email
  SELECT id INTO v_user_id FROM public.profiles WHERE LOWER(email) = LOWER(target_email);
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Target user profile not found for email: %', target_email;
  END IF;

  -- Locate super_admin role
  SELECT id INTO v_super_role_id FROM public.roles WHERE name = 'super_admin';
  IF v_super_role_id IS NULL THEN
    RAISE EXCEPTION 'super_admin role not found in database.';
  END IF;

  -- Assign Role
  INSERT INTO public.user_roles (user_id, role_id, assigned_by)
  VALUES (v_user_id, v_super_role_id, auth.uid())
  ON CONFLICT (user_id, role_id) DO NOTHING;

  -- Record Audit Log
  INSERT INTO public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    (SELECT email FROM public.profiles WHERE id = auth.uid()),
    'SUPER_ADMIN_ASSIGNED',
    'public.user_roles',
    v_user_id::TEXT,
    jsonb_build_object('target_email', target_email, 'first_bootstrap', (v_count_super_admins = 0))
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'message', format('User %s successfully assigned Super Admin role.', target_email),
    'user_id', v_user_id
  );
END;
$$;
-- ==============================================================================
-- SIS CYBER FORTRESS — 003_row_level_security.sql
-- Mandatory Row Level Security Policies for Zero-Trust Multi-Tenant Architecture
-- ==============================================================================

-- ==============================================================================
-- 1. ENABLE RLS ON ALL TABLES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registered_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.identity_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_security_checks ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.phishing_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phishing_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.url_reputation_cache ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.endpoint_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endpoint_security_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endpoint_permission_overview ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.network_security_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_risk_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.vault_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encrypted_vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_recovery_metadata ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.recovery_readiness_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_integrity_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.authorized_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_scan_findings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.forensic_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forensic_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_custody_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.access_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_security_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.threat_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_indicator_tags ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.backup_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restore_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_integrity_checks ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_events ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. CORE & PROFILE POLICIES
-- ==============================================================================

-- Profiles
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin_or_auditor());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR public.is_super_admin())
  WITH CHECK (id = auth.uid() OR public.is_super_admin());

-- Roles and Permissions (Read by authenticated, managed by Super Admin)
CREATE POLICY "roles_read_auth" ON public.roles
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "roles_write_super" ON public.roles
  FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "permissions_read_auth" ON public.permissions
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "permissions_write_super" ON public.permissions
  FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "role_permissions_read_auth" ON public.role_permissions
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "role_permissions_write_super" ON public.role_permissions
  FOR ALL TO authenticated USING (public.is_super_admin());

-- User Roles: Strictly protected. Users cannot escalate their own roles!
CREATE POLICY "user_roles_select" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_or_auditor());

CREATE POLICY "user_roles_insert_super" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.is_super_admin());

CREATE POLICY "user_roles_update_super" ON public.user_roles
  FOR UPDATE TO authenticated USING (public.is_super_admin());

CREATE POLICY "user_roles_delete_super" ON public.user_roles
  FOR DELETE TO authenticated USING (public.is_super_admin());

-- Consents
CREATE POLICY "consents_manage_own" ON public.user_consents
  FOR ALL USING (user_id = auth.uid());

-- User Sessions Metadata
CREATE POLICY "sessions_select_own_or_admin" ON public.user_sessions_metadata
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_or_auditor());
CREATE POLICY "sessions_insert_own" ON public.user_sessions_metadata
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "sessions_update_own" ON public.user_sessions_metadata
  FOR UPDATE USING (user_id = auth.uid() OR public.is_super_admin());

-- Registered Devices
CREATE POLICY "devices_select_own_or_admin" ON public.registered_devices
  FOR SELECT USING (user_id = auth.uid() OR public.is_security_admin() OR public.is_auditor());
CREATE POLICY "devices_manage_own" ON public.registered_devices
  FOR ALL USING (user_id = auth.uid());

-- Notifications
CREATE POLICY "notifications_manage_own" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- Audit Logs: Read-only for Super Admin and Auditor. No one can update or delete!
CREATE POLICY "audit_logs_select" ON public.audit_logs
  FOR SELECT USING (public.is_super_admin() OR public.is_auditor());
CREATE POLICY "audit_logs_insert" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (TRUE);

-- System Settings
CREATE POLICY "system_settings_read_auth" ON public.system_settings
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "system_settings_write_super" ON public.system_settings
  FOR ALL TO authenticated USING (public.is_super_admin());

-- ==============================================================================
-- 3. MODULE POLICIES
-- ==============================================================================

-- Module 1: Identity Guardian
CREATE POLICY "identity_events_select" ON public.identity_security_events
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_or_auditor());
CREATE POLICY "identity_events_insert" ON public.identity_security_events
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

CREATE POLICY "account_checks_manage_own" ON public.account_security_checks
  FOR ALL USING (user_id = auth.uid() OR public.is_admin_or_auditor());

-- Module 2: Phishing Shield
CREATE POLICY "phishing_scans_select" ON public.phishing_scans
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_or_auditor());
CREATE POLICY "phishing_scans_insert" ON public.phishing_scans
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "phishing_reports_select" ON public.phishing_reports
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_or_auditor());
CREATE POLICY "phishing_reports_insert" ON public.phishing_reports
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "phishing_reports_update_admin" ON public.phishing_reports
  FOR UPDATE USING (public.is_security_admin());

CREATE POLICY "url_cache_read_auth" ON public.url_reputation_cache
  FOR SELECT TO authenticated USING (TRUE);

-- Module 3: Endpoint Guardian
CREATE POLICY "endpoint_inventory_select" ON public.endpoint_inventory
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.registered_devices d WHERE d.id = device_id AND (d.user_id = auth.uid() OR public.is_security_admin() OR public.is_auditor()))
  );
CREATE POLICY "endpoint_inventory_manage" ON public.endpoint_inventory
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.registered_devices d WHERE d.id = device_id AND d.user_id = auth.uid())
  );

CREATE POLICY "endpoint_status_manage" ON public.endpoint_security_status
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.registered_devices d WHERE d.id = device_id AND (d.user_id = auth.uid() OR public.is_security_admin() OR public.is_auditor()))
  );

CREATE POLICY "endpoint_permissions_manage" ON public.endpoint_permission_overview
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.registered_devices d WHERE d.id = device_id AND (d.user_id = auth.uid() OR public.is_security_admin() OR public.is_auditor()))
  );

-- Module 4: Network Sentinel
CREATE POLICY "network_checks_select" ON public.network_security_checks
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_or_auditor());
CREATE POLICY "network_checks_insert" ON public.network_security_checks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "network_events_select" ON public.network_risk_events
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_or_auditor());
CREATE POLICY "network_events_insert" ON public.network_risk_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Module 5: Vault Guardian (ZERO-KNOWLEDGE: NEVER EXPOSED TO ADMINS)
CREATE POLICY "vault_metadata_isolate" ON public.vault_metadata
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "encrypted_vault_items_isolate" ON public.encrypted_vault_items
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "vault_recovery_isolate" ON public.vault_recovery_metadata
  FOR ALL USING (user_id = auth.uid());

-- Module 6: Ransomware Guardian
CREATE POLICY "ransomware_readiness_manage" ON public.recovery_readiness_checks
  FOR ALL USING (user_id = auth.uid() OR public.is_admin_or_auditor());

CREATE POLICY "file_integrity_manage" ON public.file_integrity_events
  FOR ALL USING (user_id = auth.uid() OR public.is_admin_or_auditor());

-- Module 7: WebShield
CREATE POLICY "authorized_assets_select" ON public.authorized_assets
  FOR SELECT USING (user_id = auth.uid() OR public.is_security_admin() OR public.is_auditor());
CREATE POLICY "authorized_assets_manage" ON public.authorized_assets
  FOR ALL USING (user_id = auth.uid() OR public.is_security_admin());

CREATE POLICY "website_scans_select" ON public.website_scans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.authorized_assets a WHERE a.id = asset_id AND (a.user_id = auth.uid() OR public.is_security_admin() OR public.is_auditor()))
  );
CREATE POLICY "website_scans_insert" ON public.website_scans
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.authorized_assets a WHERE a.id = asset_id AND (a.user_id = auth.uid() OR public.is_security_admin()))
  );

CREATE POLICY "website_findings_select" ON public.website_scan_findings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.website_scans s 
      JOIN public.authorized_assets a ON s.asset_id = a.id
      WHERE s.id = scan_id AND (a.user_id = auth.uid() OR public.is_security_admin() OR public.is_auditor())
    )
  );
CREATE POLICY "website_findings_insert" ON public.website_scan_findings
  FOR INSERT WITH CHECK (public.is_security_admin() OR auth.role() = 'authenticated');

-- Module 8: Digital Forensics
CREATE POLICY "forensic_cases_select" ON public.forensic_cases
  FOR SELECT USING (created_by = auth.uid() OR lead_investigator_id = auth.uid() OR public.is_security_admin() OR public.is_auditor());
CREATE POLICY "forensic_cases_manage" ON public.forensic_cases
  FOR ALL USING (public.is_security_admin());

CREATE POLICY "forensic_evidence_select" ON public.forensic_evidence
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.forensic_cases c WHERE c.id = case_id AND (c.created_by = auth.uid() OR c.lead_investigator_id = auth.uid() OR public.is_security_admin() OR public.is_auditor()))
  );
CREATE POLICY "forensic_evidence_manage" ON public.forensic_evidence
  FOR ALL USING (public.is_security_admin());

CREATE POLICY "custody_logs_select" ON public.evidence_custody_logs
  FOR SELECT USING (public.is_security_admin() OR public.is_auditor());
CREATE POLICY "custody_logs_insert" ON public.evidence_custody_logs
  FOR INSERT WITH CHECK (public.is_security_admin());

-- Module 9: Access Guardian
CREATE POLICY "access_events_select" ON public.access_security_events
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_or_auditor());
CREATE POLICY "access_events_insert" ON public.access_security_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "session_events_select" ON public.session_security_events
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_or_auditor());
CREATE POLICY "session_events_insert" ON public.session_security_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Module 10: Threat Intelligence
CREATE POLICY "threat_sources_read" ON public.threat_sources
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "threat_sources_write" ON public.threat_sources
  FOR ALL TO authenticated USING (public.is_security_admin());

CREATE POLICY "threat_indicators_read" ON public.threat_indicators
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "threat_indicators_write" ON public.threat_indicators
  FOR ALL TO authenticated USING (public.is_security_admin());

CREATE POLICY "threat_tags_read" ON public.threat_tags
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "threat_tags_write" ON public.threat_tags
  FOR ALL TO authenticated USING (public.is_security_admin());

CREATE POLICY "threat_indicator_tags_read" ON public.threat_indicator_tags
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "threat_indicator_tags_write" ON public.threat_indicator_tags
  FOR ALL TO authenticated USING (public.is_security_admin());

-- Module 11: Cloud Backup Guardian
CREATE POLICY "backup_jobs_manage_own" ON public.backup_jobs
  FOR ALL USING (user_id = auth.uid() OR public.is_security_admin() OR public.is_auditor());

CREATE POLICY "backup_files_manage_own" ON public.backup_files
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.backup_jobs j WHERE j.id = job_id AND (j.user_id = auth.uid() OR public.is_security_admin() OR public.is_auditor()))
  );

CREATE POLICY "restore_jobs_manage_own" ON public.restore_jobs
  FOR ALL USING (user_id = auth.uid() OR public.is_security_admin() OR public.is_auditor());

CREATE POLICY "backup_integrity_manage_own" ON public.backup_integrity_checks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.backup_jobs j WHERE j.id = job_id AND (j.user_id = auth.uid() OR public.is_security_admin() OR public.is_auditor()))
  );

-- Module 12: Cyber SOC
CREATE POLICY "security_alerts_select" ON public.security_alerts
  FOR SELECT USING (user_id = auth.uid() OR public.is_security_admin() OR public.is_auditor());
CREATE POLICY "security_alerts_insert" ON public.security_alerts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "security_alerts_update_admin" ON public.security_alerts
  FOR UPDATE USING (public.is_security_admin());

CREATE POLICY "security_incidents_select" ON public.security_incidents
  FOR SELECT USING (public.is_security_admin() OR public.is_auditor());
CREATE POLICY "security_incidents_manage" ON public.security_incidents
  FOR ALL USING (public.is_security_admin());

CREATE POLICY "incident_assignments_manage" ON public.incident_assignments
  FOR ALL USING (public.is_security_admin());

CREATE POLICY "incident_events_manage" ON public.incident_events
  FOR ALL USING (public.is_security_admin());
-- ==============================================================================
-- SIS CYBER FORTRESS — 004_storage_buckets.sql
-- Storage Buckets & Policies for Private Multi-Tenant File Storage
-- ==============================================================================

-- Create Private Buckets in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('forensic-evidence', 'forensic-evidence', FALSE, 104857600, ARRAY['application/pdf', 'application/zip', 'application/octet-stream', 'image/png', 'image/jpeg', 'text/plain']),
  ('cloud-backups', 'cloud-backups', FALSE, 209715200, ARRAY['application/octet-stream', 'application/x-zip-compressed', 'application/json', 'application/zip']),
  ('reports', 'reports', FALSE, 26214400, ARRAY['application/pdf', 'application/json', 'text/csv']),
  ('avatars', 'avatars', TRUE, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==============================================================================
-- STORAGE RLS POLICIES ON storage.objects
-- ==============================================================================

-- 1. Avatars bucket: Public read, owner update/insert
CREATE POLICY "avatars_public_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_user_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_user_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_user_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2. Cloud-Backups bucket: Strictly user-isolated (zero public access)
CREATE POLICY "backups_user_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'cloud-backups' 
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_security_admin())
  );

CREATE POLICY "backups_user_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'cloud-backups' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "backups_user_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'cloud-backups' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Forensic-Evidence bucket: Restricted to Security Admins and Case Investigators
CREATE POLICY "forensics_evidence_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'forensic-evidence' 
    AND (public.is_security_admin() OR public.is_auditor())
  );

CREATE POLICY "forensics_evidence_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'forensic-evidence' 
    AND public.is_security_admin()
  );

CREATE POLICY "forensics_evidence_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'forensic-evidence' 
    AND public.is_super_admin()
  );

-- 4. Reports bucket: Admin and authorized users can read reports
CREATE POLICY "reports_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'reports' 
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_security_admin() OR public.is_auditor())
  );

CREATE POLICY "reports_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'reports' 
    AND (public.is_security_admin() OR auth.role() = 'authenticated')
  );
-- ==============================================================================
-- SIS CYBER FORTRESS — 005_seed_data.sql
-- Default Roles, Granular Permissions, Threat Intelligence Feeds & Settings
-- ==============================================================================

-- 1. Insert Core Roles
INSERT INTO public.roles (name, description) VALUES
  ('super_admin', 'Supreme administrator with full system, role, user, and module management authorization'),
  ('security_admin', 'Security Operations team member authorized for alerts, incidents, forensics, assets, and threat feeds'),
  ('module_admin', 'Specialized administrator authorized to manage designated security modules only'),
  ('auditor', 'Independent compliance officer with strictly read-only access to audit logs, reports, and evidence'),
  ('standard_user', 'Authorized enterprise member with personal device, vault, and security scanning access')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 2. Insert Permissions
INSERT INTO public.permissions (code, module, description) VALUES
  -- Core & Admin
  ('admin.users.manage', 'core', 'Provision, suspend, or manage enterprise user accounts'),
  ('admin.roles.manage', 'core', 'Assign and revoke administrative security roles'),
  ('admin.settings.manage', 'core', 'Modify global platform and security configurations'),
  ('admin.audit.view', 'core', 'Inspect immutable system-wide security audit trails'),

  -- Module 01: Identity Guardian
  ('identity.view', 'identity', 'Inspect account security posture and sign-in telemetry'),
  ('identity.mfa.enforce', 'identity', 'Enforce multi-factor authentication compliance'),

  -- Module 02: Phishing Shield
  ('phishing.scan', 'phishing', 'Submit and inspect suspicious URLs and domains'),
  ('phishing.manage_reports', 'phishing', 'Triage and review user-submitted phishing reports'),

  -- Module 03: Endpoint Guardian
  ('endpoint.register', 'endpoint', 'Enroll and manage authorized Android endpoints'),
  ('endpoint.audit_all', 'endpoint', 'Inspect enterprise-wide fleet device security posture'),

  -- Module 04: Network Sentinel
  ('network.check', 'network', 'Inspect network configurations and hotspot security'),

  -- Module 05: Vault Guardian
  ('vault.use', 'vault', 'Create, update, and manage zero-knowledge encrypted vault entries'),

  -- Module 06: Ransomware Guardian
  ('ransomware.readiness', 'ransomware', 'Evaluate disaster recovery and file integrity status'),

  -- Module 07: WebShield
  ('webshield.register_asset', 'webshield', 'Register enterprise domains for security assessments'),
  ('webshield.scan', 'webshield', 'Initiate authorized SSRF-protected vulnerability scans'),

  -- Module 08: Digital Forensics
  ('forensics.case.create', 'forensics', 'Open and triage digital forensic investigation cases'),
  ('forensics.evidence.manage', 'forensics', 'Acquire evidence and record cryptographic chain-of-custody'),

  -- Module 09: Access Guardian
  ('access.sessions.view', 'access', 'Inspect active enterprise sessions and access anomalies'),
  ('access.sessions.terminate', 'access', 'Revoke or terminate unauthorized user sessions'),

  -- Module 10: Threat Intelligence
  ('threat_intel.view', 'threat_intel', 'Query threat indicators, IOCs, and malware signatures'),
  ('threat_intel.manage', 'threat_intel', 'Ingest and update IOCs, threat tags, and feed connectors'),

  -- Module 11: Cloud Backup Guardian
  ('backup.execute', 'backup', 'Create and restore encrypted multi-tenant data backups'),

  -- Module 12: Cyber SOC
  ('soc.alerts.view', 'soc', 'Inspect incoming enterprise security alerts'),
  ('soc.incidents.manage', 'soc', 'Assign, investigate, and resolve security incident workflows')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- 3. Map Permissions to Roles
DO $$
DECLARE
  v_super_id UUID;
  v_sec_id UUID;
  v_mod_id UUID;
  v_audit_id UUID;
  v_std_id UUID;
BEGIN
  SELECT id INTO v_super_id FROM public.roles WHERE name = 'super_admin';
  SELECT id INTO v_sec_id FROM public.roles WHERE name = 'security_admin';
  SELECT id INTO v_mod_id FROM public.roles WHERE name = 'module_admin';
  SELECT id INTO v_audit_id FROM public.roles WHERE name = 'auditor';
  SELECT id INTO v_std_id FROM public.roles WHERE name = 'standard_user';

  -- Super Admin gets ALL permissions
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT v_super_id, id FROM public.permissions
  ON CONFLICT DO NOTHING;

  -- Security Admin permissions
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT v_sec_id, id FROM public.permissions 
  WHERE code IN (
    'identity.view', 'phishing.scan', 'phishing.manage_reports',
    'endpoint.audit_all', 'network.check', 'ransomware.readiness',
    'webshield.register_asset', 'webshield.scan', 'forensics.case.create',
    'forensics.evidence.manage', 'access.sessions.view', 'access.sessions.terminate',
    'threat_intel.view', 'threat_intel.manage', 'backup.execute',
    'soc.alerts.view', 'soc.incidents.manage'
  )
  ON CONFLICT DO NOTHING;

  -- Auditor permissions (strictly read-only)
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT v_audit_id, id FROM public.permissions 
  WHERE code IN (
    'admin.audit.view', 'identity.view', 'endpoint.audit_all',
    'access.sessions.view', 'threat_intel.view', 'soc.alerts.view'
  )
  ON CONFLICT DO NOTHING;

  -- Standard User permissions
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT v_std_id, id FROM public.permissions 
  WHERE code IN (
    'identity.view', 'phishing.scan', 'endpoint.register',
    'network.check', 'vault.use', 'ransomware.readiness',
    'webshield.register_asset', 'webshield.scan', 'access.sessions.view',
    'threat_intel.view', 'backup.execute', 'soc.alerts.view'
  )
  ON CONFLICT DO NOTHING;
END $$;

-- 4. Insert Default System Settings
INSERT INTO public.system_settings (key, value, description) VALUES
  ('mfa_policy', '{"enforce_for_admins": true, "grace_period_days": 7}', 'MFA enforcement policy across administrative tiers'),
  ('session_timeout', '{"idle_timeout_minutes": 30, "max_session_hours": 12}', 'Session idle expiration and absolute validity limits'),
  ('password_policy', '{"min_length": 12, "require_special": true, "require_numbers": true, "max_age_days": 90}', 'Password complexity and rotation rules'),
  ('phishing_engine', '{"auto_quarantine_score": 85, "trusted_feeds_enabled": true}', 'Automated phishing triage threshold configuration'),
  ('threat_feed_sync', '{"interval_hours": 6, "auto_publish": true}', 'Frequency for syncing external threat intelligence feeds')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 5. Insert Threat Intelligence Tags
INSERT INTO public.threat_tags (tag_name, color) VALUES
  ('APT-29', '#EF4444'),
  ('Ransomware-LockBit', '#DC2626'),
  ('Phishing-Credential', '#F59E0B'),
  ('Cobalt-Strike-C2', '#8B5CF6'),
  ('Mirai-Botnet', '#06B6D4'),
  ('Data-Exfiltration', '#EC4899')
ON CONFLICT (tag_name) DO NOTHING;

-- 6. Insert Default Threat Intelligence Sources
INSERT INTO public.threat_sources (name, feed_url, trust_score, is_active) VALUES
  ('CISA Known Exploited Vulnerabilities', 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', 98, TRUE),
  ('Abuse.ch URLhaus Feed', 'https://urlhaus.abuse.ch/downloads/json_recent/', 95, TRUE),
  ('AlienVault OTX Community Feed', 'https://otx.alienvault.com/api/v1/pulses/subscribed', 88, TRUE)
ON CONFLICT (name) DO NOTHING;

-- 7. Insert Sample Realistic Threat Indicators (IOCs)
INSERT INTO public.threat_indicators (indicator_type, indicator_value, severity, threat_actor, malware_family, description, confidence) VALUES
  ('domain', 'secure-login-portal-auth99.com', 'critical', 'ScamLab FinCrime', 'PhishHunter', 'Lookalike domain spoofing Microsoft 365 OAuth authentication flows', 96),
  ('ip', '194.135.25.14', 'high', 'APT-29', 'Cobalt Strike', 'Command and Control beaconing listener detected in Eastern European hosting provider', 92),
  ('hash', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'critical', 'LockBit 3.0', 'LockBit Green', 'SHA-256 binary hash associated with ransomware payload execution stages', 99),
  ('url', 'http://185.220.101.5/bins/arm7.elf', 'high', 'Mirai Gang', 'Mirai Botnet', 'Direct IP download droplet targeting unpatched IoT endpoints', 90)
ON CONFLICT DO NOTHING;

-- 8. Populate URL Reputation Cache (Known clean and malicious domains)
INSERT INTO public.url_reputation_cache (domain, reputation, categories, source) VALUES
  ('google.com', 'clean', '["search_engine", "trusted_infrastructure"]', 'internal_whitelist'),
  ('github.com', 'clean', '["developer_tools", "code_repository"]', 'internal_whitelist'),
  ('microsoft.com', 'clean', '["enterprise_cloud", "trusted_infrastructure"]', 'internal_whitelist'),
  ('apple.com', 'clean', '["technology", "trusted_infrastructure"]', 'internal_whitelist'),
  ('paypal-security-account-alert.xyz', 'malicious', '["phishing", "credential_harvesting"]', 'urlhaus'),
  ('free-crypto-giveaway-claim.top', 'malicious', '["scam", "crypto_drainer"]', 'abuse_ch')
ON CONFLICT (domain) DO UPDATE SET reputation = EXCLUDED.reputation;
