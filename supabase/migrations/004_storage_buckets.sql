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
