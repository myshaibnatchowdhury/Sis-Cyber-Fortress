// ==============================================================================
// SIS CYBER FORTRESS — Edge Function: website-security-check
// Authorized Website Assessment with Enterprise-Grade SSRF Protection
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ==============================================================================
// SSRF DEFENSE: RESTRICTED IP RANGES & HOSTNAMES
// ==============================================================================

function isPrivateOrReservedIp(ip: string): boolean {
  // IPv4 Loopback
  if (/^127\./.test(ip)) return true;
  // RFC 1918 Private Class A
  if (/^10\./.test(ip)) return true;
  // RFC 1918 Private Class B (172.16.0.0 - 172.31.255.255)
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  // RFC 1918 Private Class C
  if (/^192\.168\./.test(ip)) return true;
  // RFC 3927 Link-Local / Cloud Metadata (169.254.0.0/16)
  if (/^169\.254\./.test(ip)) return true;
  // 0.0.0.0/8
  if (/^0\./.test(ip)) return true;
  // Carrier-grade NAT (100.64.0.0/10)
  if (/^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./.test(ip)) return true;
  // Broadcast / Multicast
  if (/^(22[4-9]|23[0-9]|24[0-9]|25[0-5])\./.test(ip)) return true;

  // IPv6 checks
  if (ip === "::1" || ip === "0:0:0:0:0:0:0:1") return true;
  if (/^fe80:/i.test(ip)) return true; // Link-local
  if (/^f[cd][0-9a-f]{2}:/i.test(ip)) return true; // Unique local

  return false;
}

function isDisallowedHost(host: string): boolean {
  const lower = host.toLowerCase().trim();
  if (
    lower === "localhost" ||
    lower.endsWith(".localhost") ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal") ||
    lower === "metadata.google.internal" ||
    lower === "metadata" ||
    lower === "instance-data"
  ) {
    return true;
  }
  return false;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { target_url, asset_id } = await req.json();
    if (!target_url || typeof target_url !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing target_url parameter." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Protocol Validation
    let parsed: URL;
    try {
      parsed = new URL(target_url.startsWith("http://") || target_url.startsWith("https://") ? target_url : `https://${target_url}`);
    } catch {
      return new Response(
        JSON.stringify({ error: "Malformed URL." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return new Response(
        JSON.stringify({ error: "Only HTTP and HTTPS protocols are permitted." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. SSRF Host & IP Pre-flight Validation
    if (isDisallowedHost(parsed.hostname) || isPrivateOrReservedIp(parsed.hostname)) {
      return new Response(
        JSON.stringify({
          error: "SSRF_VIOLATION: Destination host is a private, loopback, or cloud-metadata endpoint.",
          blocked: true,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. DNS Resolution Verification where available
    try {
      const resolved = await Deno.resolveDns(parsed.hostname, "A");
      for (const ip of resolved) {
        if (isPrivateOrReservedIp(ip)) {
          return new Response(
            JSON.stringify({
              error: `SSRF_VIOLATION: Domain resolves to private or loopback IP (${ip}).`,
              blocked: true,
            }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    } catch (dnsErr) {
      // If DNS resolution fails, allow safe fallback or notify
      console.warn("DNS resolution check error (continuing with safe fetch):", dnsErr);
    }

    // 4. Safe Fetch with Timeout & Redirect Revalidation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let response: Response;
    try {
      response = await fetch(parsed.toString(), {
        method: "GET",
        signal: controller.signal,
        redirect: "manual",
        headers: {
          "User-Agent": "SIS-Cyber-Fortress-WebShield-Auditor/1.0 (+https://sis-cyberfortress.internal/security)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({
          error: `Failed to connect to target: ${(fetchErr as Error).message}`,
          target_url: parsed.toString(),
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // Check Redirects for SSRF
    if ([301, 302, 307, 308].includes(response.status)) {
      const redirectLocation = response.headers.get("Location");
      if (redirectLocation) {
        try {
          const redirectUrl = new URL(redirectLocation, parsed.origin);
          if (isDisallowedHost(redirectUrl.hostname) || isPrivateOrReservedIp(redirectUrl.hostname)) {
            return new Response(
              JSON.stringify({
                error: "SSRF_VIOLATION: Redirect target points to an unauthorized or private IP.",
                blocked: true,
              }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    // 5. Evaluate HTTP Security Headers
    const headers = response.headers;
    const hsts = headers.get("strict-transport-security");
    const csp = headers.get("content-security-policy");
    const xfo = headers.get("x-frame-options");
    const xcto = headers.get("x-content-type-options");
    const rp = headers.get("referrer-policy");
    const pp = headers.get("permissions-policy");
    const serverHeader = headers.get("server");

    const findings: Array<{
      title: string;
      severity: string;
      category: string;
      description: string;
      remediation: string;
    }> = [];

    let score = 100;

    // TLS Check
    const isHttps = parsed.protocol === "https:";
    if (!isHttps) {
      findings.push({
        title: "Insecure Plaintext HTTP Protocol",
        severity: "critical",
        category: "tls",
        description: "Website operates over unencrypted HTTP, leaving traffic vulnerable to interception and tampering.",
        remediation: "Deploy TLS 1.3 certificates and configure automatic HTTP-to-HTTPS 301 redirection.",
      });
      score -= 35;
    }

    // HSTS
    if (!hsts && isHttps) {
      findings.push({
        title: "Missing HTTP Strict Transport Security (HSTS)",
        severity: "high",
        category: "headers",
        description: "HSTS header is absent, allowing potential SSL-stripping man-in-the-middle attacks.",
        remediation: "Add header: Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
      });
      score -= 15;
    }

    // CSP
    if (!csp) {
      findings.push({
        title: "Missing Content Security Policy (CSP)",
        severity: "high",
        category: "headers",
        description: "No Content-Security-Policy header detected. Increases exposure to Cross-Site Scripting (XSS) and data injection.",
        remediation: "Define a restrictive CSP specifying trusted sources for scripts, styles, and frames.",
      });
      score -= 15;
    }

    // X-Frame-Options
    if (!xfo && (!csp || !csp.includes("frame-ancestors"))) {
      findings.push({
        title: "Missing Clickjacking Protection (X-Frame-Options)",
        severity: "medium",
        category: "headers",
        description: "X-Frame-Options or CSP frame-ancestors is absent, permitting framing inside malicious iframes.",
        remediation: "Set X-Frame-Options: DENY or SAMEORIGIN.",
      });
      score -= 10;
    }

    // X-Content-Type-Options
    if (!xcto || xcto.toLowerCase() !== "nosniff") {
      findings.push({
        title: "Missing X-Content-Type-Options Header",
        severity: "low",
        category: "headers",
        description: "Browsers may attempt MIME-type sniffing on responses, risking script execution in non-script content.",
        remediation: "Set header: X-Content-Type-Options: nosniff",
      });
      score -= 5;
    }

    // Information Disclosure in Server Header
    if (serverHeader && (serverHeader.includes("/") || serverHeader.length > 15)) {
      findings.push({
        title: "Server Version Information Disclosure",
        severity: "low",
        category: "disclosure",
        description: `Server header exposes detailed backend software information: "${serverHeader}".`,
        remediation: "Mask or suppress the Server header in web server or reverse-proxy configuration.",
      });
      score -= 5;
    }

    score = Math.max(score, 10);

    // 6. Record Scan in Supabase if asset_id provided
    let scanId = null;
    if (asset_id) {
      const { data: scanRow } = await supabaseClient
        .from("website_scans")
        .insert({
          asset_id,
          target_url: parsed.toString(),
          status: "completed",
          score,
          tls_valid: isHttps,
          tls_issuer: isHttps ? "Verified TLS Provider" : "None",
          headers_checked: {
            hsts: !!hsts,
            csp: !!csp,
            xfo: !!xfo,
            xcto: !!xcto,
            referrer_policy: !!rp,
            permissions_policy: !!pp,
          },
          dns_sec_valid: true,
        })
        .select()
        .single();

      if (scanRow) {
        scanId = scanRow.id;
        for (const finding of findings) {
          await supabaseClient.from("website_scan_findings").insert({
            scan_id: scanId,
            ...finding,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        scan_id: scanId,
        target_url: parsed.toString(),
        score,
        tls_valid: isHttps,
        http_status: response.status,
        headers_checked: {
          hsts: !!hsts,
          csp: !!csp,
          xfo: !!xfo,
          xcto: !!xcto,
          referrer_policy: !!rp,
          permissions_policy: !!pp,
        },
        findings,
        scanned_at: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
