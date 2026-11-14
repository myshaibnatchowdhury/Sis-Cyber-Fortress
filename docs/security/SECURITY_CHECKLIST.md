# SIS CYBER FORTRESS — Security & Privacy Architecture Checklist

**Document Version:** 1.0.0  
**Compliance Standard:** Zero-Trust Enterprise Cybersecurity Standards  
**Scope:** Web Application, Android Native Application, Edge Functions, PostgreSQL RLS  

---

## 1. Zero-Knowledge Vault Cryptography Specification

The SIS CYBER FORTRESS Vault Guardian (Module 05) enforces a strict zero-knowledge architecture. The backend database never receives, processes, or stores user master passwords, encryption keys, or unencrypted vault payloads.

### 1.1 Web Application Cryptographic Pipeline
The web client utilizes the native browser `window.crypto.subtle` API:

```
[User Master Password]
        │
        ▼
[PBKDF2 Key Derivation] ──> Salt: 16 cryptographically random bytes
        │                   Iterations: 100,000
        │                   Hash: SHA-256
        ▼
[AES-256-GCM Key (256 bits)]
        │
        ├──> [Encryption] ────> IV: 12 cryptographically random bytes
        │                        Tag Length: 128 bits
        │                        Output: Base64(Ciphertext + AuthTag)
        │
        └──> [Decryption] <──── Validates integrity before returning plaintext
```

- **Salt & IV Storage**: The 16-byte salt and 12-byte IV are encoded in Base64 and stored alongside the ciphertext in `vault_items` (`encryption_salt`, `initialization_vector`).
- **Memory Hygiene**: The derived AES key resides strictly in transient browser heap memory and is wiped on vault lock or session expiration.

### 1.2 Android Native Cryptographic Pipeline
The Android application leverages the hardware-backed `AndroidKeyStore` system:

- **Key Generation**: Uses `KeyGenerator` initialized with `KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)`.
- **Cipher**: `AES/GCM/NoPadding` with 256-bit key length and 128-bit authentication tag.
- **Biometric Gate**: Integrated with `BiometricPrompt.PromptInfo` with `BIOMETRIC_STRONG` or device credential fallback (PIN/pattern).
- **Session Tokens**: Stored using AndroidX `EncryptedSharedPreferences` backed by `MasterKey.DEFAULT_AES256_GCM_SPEC`.

### 1.3 Super Admin Isolation Verification
To prove zero-knowledge integrity:
1. `vault_items` table RLS policy:
   ```sql
   CREATE POLICY "Users have exclusive access to their vault items"
     ON vault_items FOR ALL
     USING (user_id = auth.uid())
     WITH CHECK (user_id = auth.uid());
   ```
2. No administrative bypass policy exists for `vault_items`.
3. Even if a database administrator executes direct SQL queries as the PostgreSQL superuser, `encrypted_content` is stored as an AES-GCM ciphertext requiring the user's client-side passphrase.

---

## 2. Server-Side Request Forgery (SSRF) Defense Architecture

The WebShield Analyzer (Module 07) scanner in `supabase/functions/website-security-check/index.ts` enforces multi-layer SSRF defenses to prevent internal network scanning:

| Threat Vector | Defense Mechanism | Implemented Rule |
|:---|:---|:---|
| **Cloud Metadata Theft** | Blacklist IP check before TCP handshake | Blocks `169.254.169.254` (AWS/GCP/Azure) and `metadata.google.internal` |
| **Localhost Exploitation** | Loopback interface blocking | Blocks `127.0.0.0/8`, `::1`, and `localhost` |
| **Intranet Scanning** | RFC 1918 Private Subnet blocking | Blocks `10.0.0.0/8`, `172.16.0.0/12`, and `192.168.0.0/16` |
| **Carrier-Grade NAT / Link-Local** | Link-local blocking | Blocks `169.254.0.0/16` and `100.64.0.0/10` |
| **DNS Rebinding & Redirection** | Multi-hop inspection | Validates target IP on initial resolution AND validates destination URL for every HTTP redirect (max 3 hops) |
| **Dangerous Schemes** | Protocol whitelisting | Rejects `file://`, `gopher://`, `dict://`, `ftp://`; strictly allows `http://` and `https://` |

---

## 3. Android Endpoint Security Checklist

| Check Item | Implementation Mechanism | Status |
|:---|:---|:---|
| **Root Detection** | Checks for `su` binaries across 8 standard locations (`/system/bin`, `/system/xbin`, etc.) and detects test-keys build tags. | **VERIFIED** |
| **Secure Key Storage** | Hardware-backed `AndroidKeyStore` provider with hardware TEE / StrongBox where available. | **VERIFIED** |
| **Encrypted SharedPreferences** | AES-256-GCM encrypted preferences for session tokens and refresh tokens. | **VERIFIED** |
| **Background Posture Worker** | WorkManager `PeriodicWorkRequestBuilder` executing periodic root, permission, and connectivity checks. | **VERIFIED** |
| **Biometric Authentication** | `BiometricPrompt` with cryptographic cipher initialization for vault unlock. | **VERIFIED** |
| **Screen Capture Protection** | `FLAG_SECURE` capability supported on sensitive screens (vault, credentials). | **READY** |
| **Network Security Config** | Cleartext traffic disabled by default; HTTPS-only communication with Supabase endpoints. | **VERIFIED** |

---

## 4. OWASP Top 10 Web & Mobile Compliance Matrix

| Vulnerability Category | Risk Description | SIS Cyber Fortress Countermeasure |
|:---|:---|:---|
| **A01: Broken Access Control** | Unauthorized privilege escalation | Centralized PostgreSQL RBAC (`user_roles`), RLS on all 46 tables, and server-side Edge Function verification. |
| **A02: Cryptographic Failures** | Weak cipher suites or cleartext leaks | AES-256-GCM with PBKDF2 (100,000 iterations) for vault; TLS 1.3 enforced for Supabase APIs. |
| **A03: Injection** | SQLi / Command Injection | Parameterized queries exclusively via PostgREST / Supabase JS SDK; no raw string interpolation in queries. |
| **A04: Insecure Design** | Architectural flaws | Zero-trust boundaries, automated canary files for ransomware, and immutable audit logging. |
| **A05: Security Misconfiguration** | Default passwords or open buckets | Private storage buckets with RLS; safe `initialize_super_admin` bootstrap without hardcoded credentials. |
| **A06: Vulnerable Components** | Outdated third-party packages | Modern Next.js 15, React 19, Supabase JS 2.118, Kotlin 1.9.23 with verified builds. |
| **A07: Identification & Auth** | Credential stuffing & weak sessions | Supabase Auth with MFA support, device registration, and active session invalidation. |
| **A08: Software & Data Integrity** | Unverified updates or payloads | SHA-256 hash validation for forensic evidence and ransomware integrity baselines. |
| **A09: Logging & Monitoring** | Missing audit trails | Immutable `audit_logs` table with append-only RLS and SOC alert event queues. |
| **A10: SSRF** | Abuse of server URL fetchers | Enterprise SSRF blocking engine in WebShield inspecting DNS, private IPs, and redirect chains. |
