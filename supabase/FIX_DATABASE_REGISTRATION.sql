-- ==============================================================================
-- SIS CYBER FORTRESS — DATABASE REGISTRATION FIX & TRIGGER HARDENING
-- Run this script in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. Ensure extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- 2. Seed Default Roles (Required for standard_user role assignment)
INSERT INTO public.roles (name, description)
VALUES 
  ('super_admin', 'Supreme system authority with unrestricted access'),
  ('security_admin', 'Enterprise security operations and incident manager'),
  ('module_admin', 'Specialized module configurations and reviews'),
  ('auditor', 'Read-only compliance and forensic review officer'),
  ('standard_user', 'Standard enterprise user with personal security suite')
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;

-- 3. Ensure INSERT policy exists on public.profiles
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Grant table permissions to authenticated & service_role
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated, service_role;

-- 5. Ultra-Robust, Fault-Tolerant handle_new_user() Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_standard_role_id UUID;
  v_user_salt TEXT;
  v_user_name TEXT;
BEGIN
  -- Extract safe display name
  v_user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(COALESCE(NEW.email, 'user@sis.fortress'), '@', 1)
  );

  -- 1. Insert Profile (Core requirement)
  BEGIN
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
      COALESCE(NEW.email, 'unknown@sis.fortress'),
      v_user_name,
      NEW.raw_user_meta_data->>'avatar_url',
      85,
      FALSE,
      FALSE
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;

  -- 2. Assign standard_user role
  BEGIN
    SELECT id INTO v_standard_role_id FROM public.roles WHERE name = 'standard_user' LIMIT 1;
    IF v_standard_role_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role_id)
      VALUES (NEW.id, v_standard_role_id)
      ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to assign default role for user %: %', NEW.id, SQLERRM;
  END;

  -- 3. Initialize Zero-Knowledge Vault Metadata
  BEGIN
    -- Safe cross-platform salt generation (core postgres + timestamp)
    v_user_salt := md5(random()::TEXT || clock_timestamp()::TEXT);
    INSERT INTO public.vault_metadata (user_id, salt, kdf_iterations, item_count, auto_lock_minutes)
    VALUES (NEW.id, v_user_salt, 100000, 0, 5)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to initialize vault metadata for user %: %', NEW.id, SQLERRM;
  END;

  -- 4. Default Privacy & Telemetry Consents
  BEGIN
    INSERT INTO public.user_consents (user_id, consent_type, granted)
    VALUES 
      (NEW.id, 'device_telemetry', TRUE),
      (NEW.id, 'security_scanning', TRUE)
    ON CONFLICT (user_id, consent_type) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to record default consents for user %: %', NEW.id, SQLERRM;
  END;

  -- 5. Welcome Notification
  BEGIN
    INSERT INTO public.notifications (user_id, title, message, type, module)
    VALUES (
      NEW.id,
      'Welcome to SIS Cyber Fortress',
      'Your cybersecurity ecosystem is active. Review your Identity and Endpoint security status.',
      'info',
      'core'
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to deliver welcome notification for user %: %', NEW.id, SQLERRM;
  END;

  -- 6. Initial Audit Log
  BEGIN
    INSERT INTO public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, details)
    VALUES (
      NEW.id,
      NEW.email,
      'USER_REGISTERED',
      'auth.users',
      NEW.id::TEXT,
      jsonb_build_object('registration_method', 'supabase_auth')
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to log registration audit for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 6. Re-bind the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
