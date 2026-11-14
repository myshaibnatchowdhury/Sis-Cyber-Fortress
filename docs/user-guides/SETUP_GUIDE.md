# SIS CYBER FORTRESS — Installation & Local Development Guide

**Document Version:** 1.0.0  
**Scope:** Full-Stack Monorepo Setup (Android + Web + Supabase)  

---

## 1. System Requirements & Prerequisites

To develop, build, and test the full **SIS CYBER FORTRESS** ecosystem locally, verify the following tools are installed:

| Tool | Minimum Version | Verified Path / Recommendation |
|:---|:---|:---|
| **Operating System** | Windows 10/11, macOS, or Linux | Windows 11 Enterprise |
| **Node.js & npm** | Node.js v20.x or higher | `node -v` >= 20.0.0 |
| **Java Development Kit** | JDK 17 (Temurin / OpenJDK) | Eclipse Temurin JDK 17 |
| **Android SDK** | API Level 34 (Android 14) | Build Tools 34.0.0, Platform 34 |
| **Git** | 2.40+ | `git --version` |
| **Supabase CLI** | 1.150+ | `npm install -g supabase` |

---

## 2. Repository Setup

1. **Clone or Navigate to the Repository**:
   ```bash
   cd C:\Users\UESR\.gemini\antigravity\scratch\sis-cyber-fortress
   ```

2. **Environment Variables Setup**:
   Copy `.env.example` to `web-app/.env.local`:
   ```bash
   cp .env.example web-app/.env.local
   ```
   Configure the following keys in `web-app/.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
   ```

---

## 3. Web Application Setup

1. **Install Dependencies**:
   ```bash
   cd web-app
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Compile Production Build**:
   ```bash
   npm run build
   ```
   Verifies that all 50 static and dynamic routes compile without errors.

4. **Run Production Server**:
   ```bash
   npm run start
   ```

---

## 4. Android Application Setup

1. **Configure SDK Path**:
   Verify or create `android-app/local.properties`:
   ```properties
   sdk.dir=C:\\Users\\UESR\\AppData\\Local\\Android\\Sdk
   ```

2. **Ensure Java 17 is in Environment**:
   ```powershell
   $env:JAVA_HOME = "C:\Users\UESR\.gemini\antigravity\scratch\jdk17\jdk-17.0.13+11"
   $env:Path = "$env:JAVA_HOME\bin;$env:Path"
   ```

3. **Build the Debug APK**:
   ```powershell
   cd android-app
   .\gradlew.bat assembleDebug
   ```
   The verified APK will be generated at:
   `android-app/app/build/outputs/apk/debug/app-debug.apk`

4. **Install on Emulator or Physical Android Device**:
   ```powershell
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

---

## 5. Connecting Android to Supabase

The Android application communicates with Supabase via `SupabaseApiClient.kt`. Update the endpoint constants in:
`android-app/app/src/main/java/com/sis/cyberfortress/data/SupabaseApiClient.kt`
```kotlin
private const val SUPABASE_URL = "https://your-project.supabase.co"
private const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5c..."
```

---

## 6. Super Admin Initialization Runbook

1. Launch either the Web portal (`http://localhost:3000/register`) or the Android app.
2. Register an account with your administrator email.
3. Open the Supabase SQL Editor and execute:
   ```sql
   SELECT initialize_super_admin('<YOUR_USER_UUID>');
   ```
4. Refresh your session; the Super Admin dashboard at `/admin` is immediately accessible.
