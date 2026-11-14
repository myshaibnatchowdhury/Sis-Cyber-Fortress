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
