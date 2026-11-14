# SIS CYBER FORTRESS — Supabase Backend Setup & Configuration Guide

**Document Version:** 1.0.0  
**Backend:** Supabase Cloud / Supabase CLI Local Instance  

---

## 1. Prerequisites

Before beginning backend deployment, ensure you have:
- A Supabase account and a newly created project (or a local Supabase CLI installation).
- The project's **Project URL** and **Anon Public Key** (from Project Settings -> API).
- The project's **Service Role Secret Key** (for Edge Functions deployment and administrative scripts).
- Supabase CLI installed locally: `npm install -g supabase`.

---

## 2. Database Migration Deployment

All database structures, functions, triggers, RLS policies, and seed data are maintained in 5 sequential SQL migrations located in `supabase/migrations/`:

```
supabase/migrations/
├── 001_initial_schema.sql         # 46 Tables, Foreign Keys, Indexes, Check Constraints
├── 002_rbac_and_functions.sql     # SECURITY DEFINER functions, Auth triggers, Super Admin bootstrap
├── 003_row_level_security.sql     # RLS policies on all 46 tables
├── 004_storage_buckets.sql        # Storage bucket definitions and access policies
└── 005_seed_data.sql              # Enterprise roles, 24 permissions, threat sources, settings
```

### Option A: Via Supabase SQL Editor (Cloud Dashboard)
1. Open your project at [https://app.supabase.com](https://app.supabase.com).
2. Navigate to **SQL Editor** in the left navigation sidebar.
3. Open and execute the migration files in strict numerical order:
   - Run `001_initial_schema.sql` (Creates all tables and indexes).
   - Run `002_rbac_and_functions.sql` (Creates helper functions and auth triggers).
   - Run `003_row_level_security.sql` (Enables RLS and applies all tenant policies).
   - Run `004_storage_buckets.sql` (Provisions `forensic-evidence`, `cloud-backups`, `reports`, `avatars`).
   - Run `005_seed_data.sql` (Seeds roles, permissions, threat sources, tags, and sample IOCs).

### Option B: Via Supabase CLI (Automated)
From the repository root:
```bash
# Link your local project to your remote Supabase project
supabase link --project-ref <YOUR_PROJECT_REFERENCE_ID>

# Apply all migrations sequentially
supabase db push
```

---

## 3. Initial Super Admin Bootstrapping

To prevent default hardcoded credentials, the platform requires an explicit administrator bootstrapping procedure:

1. **Register the Admin Account**:
   - Navigate to the Web Portal `/register` or Android App Registration screen.
   - Register an account with your desired administrative email (e.g., `admin@siscyberfortress.internal`) and a strong passphrase.
2. **Retrieve the User UUID**:
   - In Supabase Dashboard, go to **Authentication -> Users**.
   - Copy the `UUID` of your newly registered account.
3. **Execute the Safe Bootstrap Function**:
   - Open the Supabase **SQL Editor** and run:
     ```sql
     SELECT initialize_super_admin('<PASTE_USER_UUID_HERE>');
     ```
4. **Verification**:
   - Query the `user_roles` view to confirm elevation:
     ```sql
     SELECT u.email, r.name, r.slug 
     FROM profiles u
     JOIN user_roles ur ON u.id = ur.user_id
     JOIN roles r ON ur.role_id = r.id
     WHERE u.id = '<PASTE_USER_UUID_HERE>';
     ```
   - Log into the Web Portal; you will immediately be granted access to the `/admin` Super Admin Control Center.

---

## 4. Edge Functions Deployment

Deploy the 6 enterprise Deno Edge Functions located in `supabase/functions/`:

```bash
# Deploy all 6 edge functions
supabase functions deploy phishing-url-check
supabase functions deploy website-security-check
supabase functions deploy admin-user-management
supabase functions deploy incident-workflow
supabase functions deploy threat-feed-sync
supabase functions deploy system-health-check
```

### Configuring Edge Function Secrets
Set the required environment secrets using the Supabase CLI:

```bash
# Set required Supabase service role secrets
supabase secrets set SUPABASE_URL=https://<your-project>.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-secret>

# Optional external intelligence API keys
supabase secrets set VIRUSTOTAL_API_KEY=<your_vt_api_key_if_available>
supabase secrets set ABUSEIPDB_API_KEY=<your_abuseipdb_key_if_available>
```

---

## 5. Storage Buckets Verification

Navigate to **Storage** in the Supabase Dashboard and verify the 4 buckets exist:
1. `forensic-evidence` (Private: for case files, logs, and artifacts)
2. `cloud-backups` (Private: for encrypted user and system archives)
3. `reports` (Private: for generated compliance audit reports)
4. `avatars` (Public with RLS write protection: for user profile avatars)

If any bucket needs manual recreation, the definitions in `supabase/migrations/004_storage_buckets.sql` will idempotently restore them.
