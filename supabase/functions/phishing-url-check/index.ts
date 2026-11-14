// ==============================================================================
// SIS CYBER FORTRESS — Edge Function: phishing-url-check
// Heuristic Phishing Analysis, Reputation Lookup & SOC Threat Alert Generation
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScanRequest {
  url: string;
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

    // Extract user authorization
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      userId = user?.id ?? null;
    }

    const { url }: ScanRequest = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid URL provided." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. URL Normalization
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http://") || url.startsWith("https://") ? url : `http://${url}`);
    } catch {
      return new Response(
        JSON.stringify({ error: "Malformed URL syntax." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const normalizedUrl = parsedUrl.toString();
    const heuristicFlags: string[] = [];
    let riskScore = 5;

    // 2. Heuristic Analysis
    // A. Check for raw IP address as host
    const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(":");
    if (isIpHost) {
      heuristicFlags.push("RAW_IP_HOSTNAME: Suspicious direct IP access instead of registered domain.");
      riskScore += 45;
    }

    // B. Check for suspicious TLDs
    const suspiciousTlds = [".xyz", ".top", ".club", ".work", ".cam", ".kim", ".fit", ".gq", ".cf", ".tk", ".ml"];
    if (suspiciousTlds.some((tld) => hostname.endsWith(tld))) {
      heuristicFlags.push("SUSPICIOUS_TLD: High-abuse top-level domain frequently seen in phishing campaigns.");
      riskScore += 25;
    }

    // C. Brand Impersonation / Keywords in Subdomains
    const brandKeywords = ["paypal", "microsoft", "apple", "bank", "login", "secure", "verify", "netflix", "auth", "signin", "wallet"];
    const matchedBrands = brandKeywords.filter((kw) => hostname.includes(kw));
    // Exclude legitimate major domains
    const isLegitDomain = hostname.endsWith("paypal.com") || hostname.endsWith("microsoft.com") || hostname.endsWith("apple.com") || hostname.endsWith("netflix.com");
    if (matchedBrands.length > 0 && !isLegitDomain) {
      heuristicFlags.push(`BRAND_SPOOF_RISK: Domain contains sensitive security keywords (${matchedBrands.join(", ")}) without official ownership.`);
      riskScore += 40;
    }

    // D. Excessive subdomains or hyphens (homoglyph/typosquat indicator)
    const hyphenCount = (hostname.match(/-/g) || []).length;
    if (hyphenCount >= 3) {
      heuristicFlags.push("EXCESSIVE_HYPHENS: Domain contains multiple hyphens indicative of typosquatting.");
      riskScore += 20;
    }

    // E. Obfuscated credentials syntax in URL
    if (parsedUrl.username || parsedUrl.password) {
      heuristicFlags.push("USERINFO_OBFUSCATION: URL contains embedded credentials before hostname.");
      riskScore += 50;
    }

    // 3. Database Reputation Cache Check
    const { data: cachedRep } = await supabaseClient
      .from("url_reputation_cache")
      .select("*")
      .eq("domain", hostname)
      .maybeSingle();

    let threatReputation = "clean";
    if (cachedRep) {
      if (cachedRep.reputation === "malicious") {
        threatReputation = "malicious";
        riskScore = 95;
        heuristicFlags.push(`REPUTATION_DATABASE: Domain is known malicious in feed: ${cachedRep.source}`);
      } else if (cachedRep.reputation === "clean") {
        threatReputation = "clean";
        riskScore = Math.min(riskScore, 10);
      }
    }

    // Clamp score 0 - 100
    riskScore = Math.min(Math.max(riskScore, 0), 100);

    let riskLevel = "low";
    if (riskScore >= 80) riskLevel = "critical";
    else if (riskScore >= 55) riskLevel = "high";
    else if (riskScore >= 25) riskLevel = "medium";

    const summary = riskLevel === "low"
      ? "No overt malicious indicators discovered. Practice standard browsing caution."
      : `Flagged as ${riskLevel.toUpperCase()} risk based on ${heuristicFlags.length} security heuristic triggers.`;

    // 4. Save to phishing_scans if user is known
    let scanRecordId = null;
    if (userId) {
      const { data: scanRecord } = await supabaseClient
        .from("phishing_scans")
        .insert({
          user_id: userId,
          url,
          normalized_url: normalizedUrl,
          domain: hostname,
          risk_level: riskLevel,
          risk_score: riskScore,
          heuristic_flags: heuristicFlags,
          threat_reputation: threatReputation,
          summary,
        })
        .select()
        .single();
      scanRecordId = scanRecord?.id;

      // 5. Escalate to SOC alerts if High or Critical
      if (riskLevel === "high" || riskLevel === "critical") {
        await supabaseClient.from("security_alerts").insert({
          alert_reference: `ALR-${Date.now().toString(36).toUpperCase()}`,
          title: `Phishing Detection: ${hostname}`,
          description: `User submitted high-risk phishing URL: ${url}. Risk score: ${riskScore}/100.`,
          severity: riskLevel,
          source_module: "phishing_shield",
          user_id: userId,
          is_resolved: false,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        scan_id: scanRecordId,
        url,
        normalized_url: normalizedUrl,
        domain: hostname,
        risk_level: riskLevel,
        risk_score: riskScore,
        heuristic_flags: heuristicFlags,
        threat_reputation: threatReputation,
        summary,
        scanned_at: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
