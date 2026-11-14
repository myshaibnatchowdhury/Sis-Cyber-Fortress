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
