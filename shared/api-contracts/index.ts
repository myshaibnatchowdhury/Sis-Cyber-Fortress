// ==============================================================================
// SIS CYBER FORTRESS — API Contracts & OpenAPI Specifications
// ==============================================================================

export const API_ENDPOINTS = {
  PHISHING_URL_CHECK: "/functions/v1/phishing-url-check",
  WEBSITE_SECURITY_CHECK: "/functions/v1/website-security-check",
  ADMIN_USER_MANAGEMENT: "/functions/v1/admin-user-management",
  INCIDENT_WORKFLOW: "/functions/v1/incident-workflow",
  THREAT_FEED_SYNC: "/functions/v1/threat-feed-sync",
  SYSTEM_HEALTH_CHECK: "/functions/v1/system-health-check",
} as const;

export const OPENAPI_SPEC = {
  openapi: "3.0.3",
  info: {
    title: "SIS CYBER FORTRESS API",
    version: "1.0.0",
    description: "Enterprise Cybersecurity Ecosystem Edge Function & Database Endpoints",
  },
  paths: {
    "/functions/v1/phishing-url-check": {
      post: {
        summary: "Heuristic Phishing URL Inspection",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  url: { type: "string", example: "https://secure-login-portal-auth99.com" },
                },
                required: ["url"],
              },
            },
          },
        },
        responses: {
          "200": { description: "Scan completed successfully" },
          "400": { description: "Malformed or invalid URL" },
        },
      },
    },
    "/functions/v1/website-security-check": {
      post: {
        summary: "SSRF-Protected Website Vulnerability Assessment",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  target_url: { type: "string", example: "https://example.com" },
                  asset_id: { type: "string", format: "uuid" },
                },
                required: ["target_url"],
              },
            },
          },
        },
        responses: {
          "200": { description: "Assessment completed" },
          "403": { description: "SSRF policy violation (loopback or private address detected)" },
        },
      },
    },
    "/functions/v1/admin-user-management": {
      post: {
        summary: "Super Admin Privileged User & Role Mutation",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  action: { type: "string", enum: ["assign_role", "revoke_role", "toggle_suspension"] },
                  target_user_id: { type: "string", format: "uuid" },
                  role_name: { type: "string" },
                  is_suspended: { type: "boolean" },
                },
                required: ["action", "target_user_id"],
              },
            },
          },
        },
        responses: {
          "200": { description: "Administrative mutation applied" },
          "403": { description: "Requires Super Admin role" },
        },
      },
    },
    "/functions/v1/incident-workflow": {
      post: {
        summary: "SOC Incident Lifecycle Transition",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  incident_id: { type: "string", format: "uuid" },
                  new_status: { type: "string", enum: ["new", "under_review", "assigned", "investigating", "resolved", "closed"] },
                  assigned_to: { type: "string", format: "uuid" },
                  comment: { type: "string" },
                },
                required: ["incident_id"],
              },
            },
          },
        },
        responses: {
          "200": { description: "Incident updated" },
          "403": { description: "Requires Security Admin role" },
        },
      },
    },
    "/functions/v1/system-health-check": {
      get: {
        summary: "System Health, Telemetry & Response Latency Check",
        responses: {
          "200": { description: "System operational" },
          "503": { description: "System degraded" },
        },
      },
    },
  },
};
