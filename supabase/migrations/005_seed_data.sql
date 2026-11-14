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
