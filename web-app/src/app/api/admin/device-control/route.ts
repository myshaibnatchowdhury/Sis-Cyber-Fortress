import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side privileged client using service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gqgdcqtbxshkwjfsvwjl.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    let query = supabaseAdmin
      .from("registered_devices")
      .select(`
        id,
        user_id,
        device_identifier,
        device_name,
        device_model,
        os_type,
        os_version,
        app_version,
        is_rooted,
        biometrics_available,
        security_patch_level,
        last_sync_at,
        status,
        created_at,
        profiles (
          id,
          email,
          full_name,
          is_suspended
        )
      `)
      .order("last_sync_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ devices: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, device_id, user_id, reason, actor_email } = body;

    if (!action || (!device_id && !user_id)) {
      return NextResponse.json({ error: "Missing action or target identifier" }, { status: 400 });
    }

    // 1. Stolen / Lost action
    if (action === "stolen") {
      const { data, error } = await supabaseAdmin
        .from("registered_devices")
        .update({
          status: "lost",
          updated_at: new Date().toISOString(),
        })
        .eq("id", device_id)
        .select()
        .single();

      if (error) throw error;

      // Log alert to SOC
      await supabaseAdmin.from("security_alerts").insert({
        title: "🚨 MOBILE ENDPOINT REPORTED STOLEN",
        description: `Device ID ${device_id} was marked as STOLEN/LOST by administrator. Remote lockdown enforced.`,
        severity: "critical",
        module: "endpoint",
        details: { device_id, reason: reason || "Reported stolen by admin" },
      });

      // Log to immutable audit log
      await supabaseAdmin.from("audit_logs").insert({
        actor_email: actor_email || "admin@sis-cyberfortress.internal",
        action: "DEVICE_REPORTED_STOLEN",
        entity_type: "registered_devices",
        entity_id: device_id,
        details: { device_id, new_status: "lost", reason },
      });

      return NextResponse.json({ success: true, status: "lost", message: "Device marked as STOLEN. Lockdown command dispatched." });
    }

    // 2. Quarantine / Remote Lock
    if (action === "quarantine") {
      const { data, error } = await supabaseAdmin
        .from("registered_devices")
        .update({
          status: "quarantined",
          updated_at: new Date().toISOString(),
        })
        .eq("id", device_id)
        .select()
        .single();

      if (error) throw error;

      await supabaseAdmin.from("security_alerts").insert({
        title: "🔒 REMOTE DEVICE LOCKDOWN ENFORCED",
        description: `Device ID ${device_id} quarantined by administrator. Local access frozen.`,
        severity: "high",
        module: "endpoint",
        details: { device_id, reason: reason || "Quarantine initiated" },
      });

      return NextResponse.json({ success: true, status: "quarantined", message: "Device remotely quarantined and locked." });
    }

    // 3. Remote Wipe & Revoke
    if (action === "revoke") {
      const { data, error } = await supabaseAdmin
        .from("registered_devices")
        .update({
          status: "revoked",
          updated_at: new Date().toISOString(),
        })
        .eq("id", device_id)
        .select()
        .single();

      if (error) throw error;

      await supabaseAdmin.from("security_alerts").insert({
        title: "⚡ REMOTE WIPE & REVOCATION COMMAND ISSUED",
        description: `Device ID ${device_id} authorization revoked. Remote wipe scheduled on next check-in.`,
        severity: "critical",
        module: "endpoint",
        details: { device_id },
      });

      return NextResponse.json({ success: true, status: "revoked", message: "Device authorization revoked and wipe queued." });
    }

    // 4. Reactivate / Unlock
    if (action === "activate") {
      const { data, error } = await supabaseAdmin
        .from("registered_devices")
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", device_id)
        .select()
        .single();

      if (error) throw error;

      await supabaseAdmin.from("audit_logs").insert({
        actor_email: actor_email || "admin@sis-cyberfortress.internal",
        action: "DEVICE_REACTIVATED",
        entity_type: "registered_devices",
        entity_id: device_id,
        details: { device_id, new_status: "active" },
      });

      return NextResponse.json({ success: true, status: "active", message: "Device reactivated and unlocked." });
    }

    // 5. Suspend User Profile (Full account freeze)
    if (action === "toggle_suspension") {
      const targetUserId = user_id;
      const { data: userProfile } = await supabaseAdmin
        .from("profiles")
        .select("is_suspended")
        .eq("id", targetUserId)
        .single();

      const newSuspendedState = !userProfile?.is_suspended;

      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          is_suspended: newSuspendedState,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetUserId);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        is_suspended: newSuspendedState,
        message: newSuspendedState
          ? "User account and profile FROZEN by administrator."
          : "User account unfrozen and active.",
      });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to execute device control" }, { status: 500 });
  }
}
