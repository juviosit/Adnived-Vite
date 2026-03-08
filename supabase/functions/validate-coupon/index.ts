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
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
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

    const { code, plan_id } = await req.json();
    if (!code || !plan_id) {
      return new Response(JSON.stringify({ error: "code and plan_id are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up coupon
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (couponError || !coupon) {
      return new Response(JSON.stringify({ error: "Invalid coupon code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "This coupon has expired" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check max uses
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      return new Response(JSON.stringify({ error: "This coupon has reached its usage limit" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get plan to calculate discount
    const { data: plan } = await supabase
      .from("plans")
      .select("id, name, price_cents, slug")
      .eq("id", plan_id)
      .eq("is_active", true)
      .single();

    if (!plan) {
      return new Response(JSON.stringify({ error: "Plan not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let discountedPriceCents = plan.price_cents;
    let description = "";

    if (coupon.discount_type === "percentage") {
      const discount = Math.round(plan.price_cents * (coupon.discount_value / 100));
      discountedPriceCents = Math.max(0, plan.price_cents - discount);
      description = `${coupon.discount_value}% off`;
    } else if (coupon.discount_type === "fixed") {
      const discountCents = Math.round(coupon.discount_value * 100);
      discountedPriceCents = Math.max(0, plan.price_cents - discountCents);
      description = `$${coupon.discount_value} off`;
    } else if (coupon.discount_type === "free_months") {
      discountedPriceCents = 0;
      description = `${coupon.free_months} free month${coupon.free_months !== 1 ? "s" : ""}`;
    }

    return new Response(
      JSON.stringify({
        valid: true,
        coupon_id: coupon.id,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        free_months: coupon.free_months,
        description,
        original_price_cents: plan.price_cents,
        discounted_price_cents: discountedPriceCents,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error validating coupon:", error);
    return new Response(
      JSON.stringify({ error: "Failed to validate coupon" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
