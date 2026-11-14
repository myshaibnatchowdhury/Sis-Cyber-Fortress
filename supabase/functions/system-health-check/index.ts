// ==============================================================================
// SIS CYBER FORTRESS — Edge Function: system-health-check
// Comprehensive Health, Latency, Storage & Fleet Telemetry Endpoint
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Measure DB query latency
    const dbStart = Date.now();
    const { count: userCount, error: userErr } = await supabaseClient
      .from("profiles")
      .select("*", { count: "exact", head: true });
    const dbLatencyMs = Date.now() - dbStart;

    if (userErr) {
      throw new Error(`Database ping failed: ${userErr.message}`);
    }

    // 2. Query Key Metrics
    const [
      { count: deviceCount },
      { count: incidentCount },
      { count: scanCount },
      { count: alertCount },
      { count: threatCount },
    ] = await Promise.all([
      supabaseClient.from("registered_devices").select("*", { count: "exact", head: true }),
      supabaseClient.from("security_incidents").select("*", { count: "exact", head: true }),
      supabaseClient.from("phishing_scans").select("*", { count: "exact", head: true }),
      supabaseClient.from("security_alerts").select("*", { count: "exact", head: true }),
      supabaseClient.from("threat_indicators").select("*", { count: "exact", head: true }),
    ]);

    // 3. Storage buckets check
    const { data: buckets, error: bucketErr } = await supabaseClient.storage.listBuckets();

    const totalDuration = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        status: "HEALTHY",
        timestamp: new Date().toISOString(),
        total_latency_ms: totalDuration,
        database: {
          status: "CONNECTED",
          latency_ms: dbLatencyMs,
          engine: "PostgreSQL 15+",
        },
        services: {
          auth: "ACTIVE",
          edge_functions: "ACTIVE",
          storage: bucketErr ? "DEGRADED" : "HEALTHY",
          buckets_available: buckets?.map((b) => b.name) ?? [],
        },
        telemetry: {
          total_users: userCount ?? 0,
          registered_devices: deviceCount ?? 0,
          active_incidents: incidentCount ?? 0,
          scanned_urls: scanCount ?? 0,
          total_alerts: alertCount ?? 0,
          threat_indicators: threatCount ?? 0,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        status: "UNHEALTHY",
        error: (err as Error).message,
        timestamp: new Date().toISOString(),
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
