import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { securityHeaders } from "../_shared/security-headers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  ...securityHeaders,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { referral_code, user_id } = await req.json();

    if (!referral_code || !user_id) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the referral
    const { data: referral, error: refError } = await supabase
      .from("referrals")
      .select("*")
      .eq("referral_code", referral_code)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .single();

    if (refError || !referral) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired referral code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the new user's email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user_id)
      .single();

    if (!profile || profile.email !== referral.referral_email) {
      // Email doesn't match — still mark as linked but no strict enforcement
      // The trigger handles the reward; this is a fallback
    }

    // Mark referral completed
    await supabase
      .from("referrals")
      .update({
        referred_user_id: user_id,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", referral.id);

    // Find Pro plan
    const { data: proPlan } = await supabase
      .from("plans")
      .select("id")
      .eq("slug", "pro")
      .eq("is_active", true)
      .single();

    if (proPlan) {
      // Reward referrer
      const { data: referrerSub } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", referral.referrer_id)
        .single();

      if (referrerSub) {
        const newEnd = new Date(
          Math.max(new Date(referrerSub.current_period_end).getTime(), Date.now()) +
            30 * 24 * 60 * 60 * 1000
        ).toISOString();
        await supabase
          .from("user_subscriptions")
          .update({ plan_id: proPlan.id, current_period_end: newEnd })
          .eq("user_id", referral.referrer_id);
      }

      // Reward referred user
      const newEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await supabase
        .from("user_subscriptions")
        .update({ plan_id: proPlan.id, current_period_end: newEnd })
        .eq("user_id", user_id);

      // Mark reward applied
      await supabase
        .from("referrals")
        .update({ reward_applied: true })
        .eq("id", referral.id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
