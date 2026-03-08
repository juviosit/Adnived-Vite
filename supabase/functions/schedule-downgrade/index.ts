import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { target_plan_id } = await req.json();
    if (!target_plan_id) {
      return new Response(JSON.stringify({ error: "target_plan_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get user's active subscription
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("id, plan_id, plans(price_cents)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .single();

    if (subError || !subscription) {
      return new Response(JSON.stringify({ error: "No active subscription found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get target plan
    const { data: targetPlan, error: planError } = await supabase
      .from("plans")
      .select("id, price_cents, is_active")
      .eq("id", target_plan_id)
      .eq("is_active", true)
      .single();

    if (planError || !targetPlan) {
      return new Response(JSON.stringify({ error: "Target plan not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate it's a downgrade
    const currentPrice = (subscription.plans as any)?.price_cents ?? 0;
    if (targetPlan.price_cents >= currentPrice) {
      return new Response(JSON.stringify({ error: "Target plan must be lower-priced than current plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Schedule the downgrade
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({ scheduled_plan_id: target_plan_id })
      .eq("id", subscription.id);

    if (updateError) {
      console.error("Failed to schedule downgrade:", updateError);
      return new Response(JSON.stringify({ error: "Failed to schedule downgrade" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("schedule-downgrade error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
