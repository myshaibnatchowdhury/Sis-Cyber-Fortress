# SIS CYBER FORTRESS — 12-in-1 Enterprise Cybersecurity Ecosystem

[![Android APK](https://img.shields.io/badge/Android%20APK-17.06%20MB%20(Verified)-brightgreen.svg)](file:///C:/Users/UESR/.gemini/antigravity/scratch/sis-cyber-fortress/android-app/app/build/outputs/apk/debug/app-debug.apk)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.29%20(50%20Routes%20Compiled)-blue.svg)](file:///C:/Users/UESR/.gemini/antigravity/scratch/sis-cyber-fortress/web-app)
[![Supabase](https://img.shields.io/badge/Supabase-46%20Tables%20%2B%20RLS-3ECF8E.svg)](file:///C:/Users/UESR/.gemini/antigravity/scratch/sis-cyber-fortress/supabase)
[![Security](https://img.shields.io/badge/Zero--Knowledge-AES--256--GCM-red.svg)](file:///C:/Users/UESR/.gemini/antigravity/scratch/sis-cyber-fortress/docs/security/SECURITY_CHECKLIST.md)

**SIS CYBER FORTRESS** is a production-grade, enterprise-oriented cybersecurity ecosystem built on a **unified Supabase backend**. The platform pairs a native **Android Mobile Application (Kotlin + Jetpack Compose)** with a responsive **Next.js 15 Web Portal & Super Admin Console**, sharing the same PostgreSQL database, identical authentication authority, and unified Row Level Security (RLS) enforcement.

---

## 🏛️ System Architecture

```
                 SIS CYBER FORTRESS ECOSYSTEM
                 
  ANDROID APPLICATION                        NEXT.JS WEB APPLICATION
(Kotlin / Jetpack Compose)                  (React 19 / TypeScript)
 • Hardware Keystore (AES-256-GCM)           • Public Awareness Portal
 • BiometricPrompt & PIN Fallback            • User Security Portal (12 Modules)
 • WorkManager Background Audits             • Super Admin Dashboard (19 Views)
 • Material 3 Dark Cyber UI                  • SubtleCrypto Zero-Knowledge Vault
           │                                           │
           │                                           │
           └───► HTTPS / REST API / Bearer JWT ◄───────┘
                               │
                               ▼
                    UNIFIED SUPABASE BACKEND
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
 SUPABASE AUTH           POSTGRESQL DB          SUPABASE STORAGE
 • RS256 JWT Tokens     • 46 Enterprise Tables • forensic-evidence (Private)
 • MFA Support          • Row Level Security   • cloud-backups (Private)
 • RBAC Role Claims     • Security Definers    • reports (Private)
                        • Audit Logging        • avatars (Public/RLS)
                               ▲
                               │
                    DENO EDGE FUNCTIONS (6)
 • phishing-url-check       • incident-workflow
 • website-security-check   • threat-feed-sync
 • admin-user-management    • system-health-check
```

---

## 📦 Verified Deliverables & Artifacts

### 1. Android Application (Debug APK)
- **APK Path**: [app-debug.apk](file:///C:/Users/UESR/.gemini/antigravity/scratch/sis-cyber-fortress/android-app/app/build/outputs/apk/debug/app-debug.apk)
- **File Size**: **17,062,659 bytes** (~17.06 MB)
- **Compile / Target SDK**: Android 14 (API Level 34)
- **Minimum SDK**: Android 8.0 (API Level 26)
- **Build Status**: Verified with `.\gradlew.bat assembleDebug` (Exit Code 0).

### 2. Web Application (Next.js 15)
- **Directory**: [web-app](file:///C:/Users/UESR/.gemini/antigravity/scratch/sis-cyber-fortress/web-app)
- **Framework**: Next.js 15.5.29, React 19, Tailwind CSS, Lucide React
- **Compiled Routes**: **50 / 50 Routes** generated successfully (Exit Code 0).
- **Interfaces**: Public Awareness Site, User Security Portal, and 19-Section Super Admin Console.

### 3. Supabase Backend
- **Migrations Directory**: [supabase/migrations](file:///C:/Users/UESR/.gemini/antigravity/scratch/sis-cyber-fortress/supabase/migrations)
  - `001_initial_schema.sql` (46 Tables, Foreign Keys, Indexes)
  - `002_rbac_and_functions.sql` (Security Definer RBAC functions & Auth triggers)
  - `003_row_level_security.sql` (RLS policies across all tables)
  - `004_storage_buckets.sql` (4 private/restricted storage buckets)
  - `005_seed_data.sql` (5 roles, 24 permissions, threat sources, tags, IOCs)
- **Edge Functions Directory**: [supabase/functions](file:///C:/Users/UESR/.gemini/antigravity/scratch/sis-cyber-fortress/supabase/functions)
  - `phishing-url-check`: Heuristic scanner & homoglyph detector
  - `website-security-check`: Enterprise SSRF-safe web perimeter scanner
  - `admin-user-management`: Server-validated Super Admin role assignment
  - `incident-workflow`: SOC incident lifecycle transition engine
  - `threat-feed-sync`: CISA KEV & threat intelligence ingest
  - `system-health-check`: Live database query latency & telemetry

---

## 🛡️ The 12 Security Modules

| Module # | Name | Description & Enterprise Capabilities |
|:---|:---|:---|
| **01** | **Identity Guardian** | Digital identity posture, MFA tracking, active session termination, compromised credential warnings. |
| **02** | **Phishing Shield** | Real-time URL heuristic analysis, homoglyph detection, brand spoofing recognition, scan history. |
| **03** | **Endpoint Guardian** | Mobile and workstation inventory, OS telemetry, root/jailbreak detection heuristics, permission audit. |
| **04** | **Network Sentinel** | Interface telemetry, captive portal detection, open Wi-Fi security alerts, configuration audit. |
| **05** | **Vault Guardian** | Zero-knowledge AES-256-GCM encrypted credential vault with client-side key derivation (PBKDF2 / Keystore). |
| **06** | **Ransomware Defense** | SHA-256 file integrity baselines, canary tripwire files, high-velocity file modification detection. |
| **07** | **WebShield Analyzer** | Enterprise website perimeter scanner with multi-tier SSRF protection, TLS inspection, and security header audit. |
| **08** | **Digital Forensics** | Investigative case management, immutable evidence locker with SHA-256 verification, chain of custody logs. |
| **09** | **Access Control Center**| Centralized RBAC management, API key lifecycle with cryptographic hashing, and IP whitelist policies. |
| **10** | **Threat Intelligence** | Indicator of Compromise (IOC) tracker (IP, domain, hash, URL) integrated with CISA KEV and threat feeds. |
| **11** | **Security Backup** | Encrypted cloud snapshot management, SHA-256 integrity verification, storage utilization metrics. |
| **12** | **SOC Incident Command** | Enterprise Security Operations Center incident lifecycle (`new` -> `investigating` -> `resolved` -> `closed`). |

---

## 🚀 Quickstart Guide

### 1. Web Application
```bash
cd web-app
npm install
npm run dev
# Open http://localhost:3000
```

### 2. Android Application
```powershell
# Set Java 17 environment
$env:JAVA_HOME = "C:\Users\UESR\.gemini\antigravity\scratch\jdk17\jdk-17.0.13+11"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

cd android-app
.\gradlew.bat assembleDebug

# Sideload onto connected Android device or emulator
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### 3. Super Admin Bootstrapping
1. Register an account via Web or Android (`/register`).
2. In Supabase SQL Editor, execute:
   ```sql
   SELECT initialize_super_admin('<YOUR_USER_UUID>');
   ```
3. Access the Super Admin Control Center at `http://localhost:3000/admin`.

---

## 📚 Complete Documentation Index

- [System Architecture](file:///C:/Users/UESR/.gemini/antigravity/scratch/sis-cyber-fortress/docs/architecture/ARCHITECTURE.md)
- [Database Schema & ER Diagrams](file:///C:/Users/UESR/.gemini/antigravity/scratch/sis-cyber-fortress/docs/database/DATABASE.md)
- [Supabase Setup & Migrations](file:///C:/Users/UESR/.gemini/antigravity/scratch/sis-cyber-fortress/docs/database/SUPABASE_SETUP.md)
- [Security & Privacy Checklist](file:///C:/Users/UESR/.gemini/antigravity/scratch/sis-cyber-fortress/docs/security/SECURITY_CHECKLIST.md)
- [Test Report & Verification Matrix](file:///C:/Users/UESR/.gemini/antigravity/scratch/sis-cyber-fortress/docs/testing/TEST_REPORT.md)
- [Local Installation Guide](file:///C:/Users/UESR/.gemini/antigravity/scratch/sis-cyber-fortress/docs/user-guides/SETUP_GUIDE.md)
- [Android Build & Release Guide](file:///C:/Users/UESR/.gemini/antigravity/scratch/sis-cyber-fortress/docs/user-guides/ANDROID_BUILD_GUIDE.md)
- [API Reference & Edge Functions](file:///C:/Users/UESR/.gemini/antigravity/scratch/sis-cyber-fortress/docs/api/API_REFERENCE.md)
- [Final Handover Guide](file:///C:/Users/UESR/.gemini/antigravity/scratch/sis-cyber-fortress/docs/handover/HANDOVER_GUIDE.md)

---

## 📄 License & Classification
Proprietary & Confidential — **SIS CYBER FORTRESS Ecosystem**. All rights reserved.
