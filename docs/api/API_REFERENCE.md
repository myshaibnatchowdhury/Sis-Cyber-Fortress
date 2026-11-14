# SIS CYBER FORTRESS — API Reference & Edge Functions Specification

**Document Version:** 1.0.0  
**Specification Standard:** OpenAPI 3.0.3  
**Base URL:** `https://<YOUR_PROJECT_ID>.supabase.co/functions/v1`  
**Authentication:** HTTP Authorization Header with Supabase Bearer JWT  

---

## 1. Authentication & Security Headers

All requests to privileged Edge Functions must provide standard authorization headers:

```http
Authorization: Bearer <USER_OR_ADMIN_SUPABASE_JWT>
apikey: <SUPABASE_ANON_KEY>
Content-Type: application/json
```

---

## 2. Edge Function Endpoints

### 2.1 Phishing URL Heuristic Check
Evaluates suspicious URLs using domain analysis, homoglyphs, and known threat feeds.

- **Route:** `POST /phishing-url-check`
- **Permissions:** Authenticated User (`standard_user`+)
- **Request Body:**
  ```json
  {
    "url": "https://secure-login-apple-support.attacker.com/verify"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "url": "https://secure-login-apple-support.attacker.com/verify",
    "normalized_url": "https://secure-login-apple-support.attacker.com/verify",
    "risk_level": "critical",
    "risk_score": 92,
    "indicators": [
      "Brand keyword spoofing detected (apple, login)",
      "High subdomain depth (3 subdomains)",
      "Raw IP or newly registered domain pattern"
    ],
    "explanation": "This URL exhibits multiple high-confidence phishing indicators.",
    "scan_id": "7f8b9c0d-1234-5678-9abc-def012345678"
  }
  ```

---

### 2.2 Website Security & SSRF-Safe Audit
Performs perimeter security audits on external websites while strictly enforcing multi-tier SSRF protection.

- **Route:** `POST /website-security-check`
- **Permissions:** Authenticated User
- **Request Body:**
  ```json
  {
    "url": "https://example.com"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "target_url": "https://example.com",
    "status_code": 200,
    "security_grade": "A",
    "security_score": 90,
    "headers": {
      "strict-transport-security": "max-age=31536000; includeSubDomains",
      "content-security-policy": "default-src 'self'",
      "x-frame-options": "DENY",
      "x-content-type-options": "nosniff"
    },
    "ssl_tls": {
      "protocol": "TLS 1.3",
      "is_valid": true
    },
    "ssrf_protection": {
      "resolved_ip": "93.184.216.34",
      "is_private_or_loopback": false,
      "redirect_count": 0
    }
  }
  ```
- **Error Response (400 Bad Request — SSRF Violation):**
  ```json
  {
    "error": "SSRF Protection: Requests to private, loopback, or cloud metadata addresses are forbidden."
  }
  ```

---

### 2.3 Administrative User Management
Performs privileged user role modifications and account lifecycle operations.

- **Route:** `POST /admin-user-management`
- **Permissions:** Super Admin Only (`is_super_admin() = true`)
- **Request Body:**
  ```json
  {
    "action": "assign_role",
    "target_user_id": "9a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
    "role_slug": "security_admin"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Role 'security_admin' successfully assigned to target user.",
    "timestamp": "2026-11-14T03:45:00.000Z"
  }
  ```

---

### 2.4 SOC Incident Workflow Engine
Transitions incident states and dispatches notifications across the security team.

- **Route:** `POST /incident-workflow`
- **Permissions:** Security Admin or Super Admin
- **Request Body:**
  ```json
  {
    "incident_id": "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
    "action": "transition_state",
    "new_status": "investigating",
    "notes": "Assigned SOC Tier 2 analyst. Isolating affected subnet endpoints."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "incident_id": "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
    "previous_status": "under_review",
    "current_status": "investigating",
    "updated_at": "2026-11-14T03:46:12.000Z"
  }
  ```

---

### 2.5 Threat Feed Ingestion & Sync
Synchronizes Indicators of Compromise (IOCs) from CISA KEV and threat feeds.

- **Route:** `POST /threat-feed-sync`
- **Permissions:** Security Admin or Service Cron
- **Request Body:**
  ```json
  {
    "source": "cisa_kev",
    "limit": 50
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "source": "cisa_kev",
    "indicators_processed": 50,
    "new_indicators_inserted": 12,
    "existing_updated": 38,
    "sync_time_ms": 340
  }
  ```

---

### 2.6 System Telemetry & Health Check
Returns live service status, database query latency, and edge function health.

- **Route:** `GET /system-health-check`
- **Permissions:** Public / Monitoring Service
- **Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "version": "1.0.0",
    "environment": "production",
    "database_connected": true,
    "db_latency_ms": 14,
    "timestamp": "2026-11-14T03:47:00.000Z"
  }
  ```
