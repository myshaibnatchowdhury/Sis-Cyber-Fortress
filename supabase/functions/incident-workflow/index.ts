// ==============================================================================
// SIS CYBER FORTRESS — Edge Function: incident-workflow
// SOC Incident Lifecycle State Transition & Investigator Assignment Engine
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

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization token." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabaseClient.auth.getUser(token);
    if (authErr || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Must be Security Admin or Super Admin
    const { data: isSecAdmin } = await supabaseClient.rpc("is_security_admin");
    if (!isSecAdmin) {
      return new Response(
        JSON.stringify({ error: "FORBIDDEN: Requires Security Admin authorization." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { incident_id, new_status, assigned_to, comment } = await req.json();
    if (!incident_id) {
      return new Response(
        JSON.stringify({ error: "incident_id is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validStatuses = ["new", "under_review", "assigned", "investigating", "resolved", "closed"];
    if (new_status && !validStatuses.includes(new_status)) {
      return new Response(
        JSON.stringify({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update incident
    const updatePayload: Record<string, unknown> = {};
    if (new_status) updatePayload.status = new_status;
    if (assigned_to !== undefined) updatePayload.assigned_to = assigned_to;

    const { data: updatedIncident, error: updateErr } = await supabaseClient
      .from("security_incidents")
      .update(updatePayload)
      .eq("id", incident_id)
      .select()
      .single();

    if (updateErr) {
      return new Response(
        JSON.stringify({ error: updateErr.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record Event
    if (comment || new_status) {
      await supabaseClient.from("incident_events").insert({
        incident_id,
        actor_id: user.id,
        event_type: new_status ? "status_change" : "comment_added",
        comment: comment || `Status updated to ${new_status}`,
      });
    }

    // Record assignment if assigned_to specified
    if (assigned_to) {
      await supabaseClient.from("incident_assignments").insert({
        incident_id,
        assigned_to,
        assigned_by: user.id,
      });
    }

    // Audit Log
    await supabaseClient.from("audit_logs").insert({
      actor_id: user.id,
      actor_email: user.email,
      action: "INCIDENT_UPDATED",
      entity_type: "security_incidents",
      entity_id: incident_id,
      details: { new_status, assigned_to, comment },
    });

    return new Response(
      JSON.stringify({ success: true, incident: updatedIncident }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
