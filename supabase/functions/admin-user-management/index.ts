// ==============================================================================
// SIS CYBER FORTRESS — Edge Function: admin-user-management
// Privileged Server-Side User & RBAC Management with Super Admin Authorization
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

    // 1. Verify Caller Authentication
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
        JSON.stringify({ error: "Invalid caller credentials." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Server-Side Verification: Caller MUST be Super Admin
    const { data: isSuperAdmin } = await supabaseClient.rpc("has_role", {
      check_user_id: user.id,
      role_name: "super_admin",
    });

    if (!isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: "FORBIDDEN: Requires Super Admin privileges." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action, target_user_id, role_name, is_suspended } = body;

    // 3. Handle Actions
    if (action === "assign_role") {
      if (!target_user_id || !role_name) {
        return new Response(
          JSON.stringify({ error: "target_user_id and role_name are required." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: roleRow, error: roleErr } = await supabaseClient
        .from("roles")
        .select("id")
        .eq("name", role_name)
        .single();

      if (roleErr || !roleRow) {
        return new Response(
          JSON.stringify({ error: `Role '${role_name}' does not exist.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabaseClient
        .from("user_roles")
        .upsert(
          { user_id: target_user_id, role_id: roleRow.id, assigned_by: user.id },
          { onConflict: "user_id,role_id" }
        );

      // Audit Log
      await supabaseClient.from("audit_logs").insert({
        actor_id: user.id,
        actor_email: user.email,
        action: "ROLE_ASSIGNED",
        entity_type: "user_roles",
        entity_id: target_user_id,
        details: { assigned_role: role_name },
      });

      return new Response(
        JSON.stringify({ success: true, message: `Role '${role_name}' assigned to user.` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "revoke_role") {
      const { data: roleRow } = await supabaseClient
        .from("roles")
        .select("id")
        .eq("name", role_name)
        .single();

      if (roleRow) {
        await supabaseClient
          .from("user_roles")
          .delete()
          .eq("user_id", target_user_id)
          .eq("role_id", roleRow.id);

        await supabaseClient.from("audit_logs").insert({
          actor_id: user.id,
          actor_email: user.email,
          action: "ROLE_REVOKED",
          entity_type: "user_roles",
          entity_id: target_user_id,
          details: { revoked_role: role_name },
        });
      }

      return new Response(
        JSON.stringify({ success: true, message: `Role '${role_name}' revoked.` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "toggle_suspension") {
      await supabaseClient
        .from("profiles")
        .update({ is_suspended: !!is_suspended })
        .eq("id", target_user_id);

      await supabaseClient.from("audit_logs").insert({
        actor_id: user.id,
        actor_email: user.email,
        action: is_suspended ? "USER_SUSPENDED" : "USER_UNSUSPENDED",
        entity_type: "profiles",
        entity_id: target_user_id,
        details: { is_suspended: !!is_suspended },
      });

      return new Response(
        JSON.stringify({ success: true, message: `User suspension status updated.` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action specified." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
