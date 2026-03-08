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

    const { plan_id, coupon_id } = await req.json();
    if (!plan_id) {
      return new Response(JSON.stringify({ error: "plan_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id, name, price_cents, slug")
      .eq("id", plan_id)
      .eq("is_active", true)
      .single();

    if (planError || !plan) {
      return new Response(JSON.stringify({ error: "Plan not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate final price with coupon
    let finalPriceCents = plan.price_cents;
    let couponData = null;

    if (coupon_id) {
      const { data: coupon, error: couponError } = await supabase
        .from("coupons")
        .select("*")
        .eq("id", coupon_id)
        .eq("is_active", true)
        .single();

      if (couponError || !coupon) {
        return new Response(JSON.stringify({ error: "Invalid coupon" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Validate expiry and usage
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: "Coupon has expired" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
        return new Response(JSON.stringify({ error: "Coupon usage limit reached" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      couponData = coupon;

      if (coupon.discount_type === "percentage") {
        const discount = Math.round(plan.price_cents * (coupon.discount_value / 100));
        finalPriceCents = Math.max(0, plan.price_cents - discount);
      } else if (coupon.discount_type === "fixed") {
        const discountCents = Math.round(coupon.discount_value * 100);
        finalPriceCents = Math.max(0, plan.price_cents - discountCents);
      } else if (coupon.discount_type === "free_months") {
        finalPriceCents = 0;
      }
    }

    // If final price is 0, activate plan directly
    if (finalPriceCents === 0 && plan.price_cents > 0) {
      // Increment coupon usage
      if (couponData) {
        await supabase
          .from("coupons")
          .update({ used_count: couponData.used_count + 1 })
          .eq("id", couponData.id);
      }

      // Calculate period end based on free_months coupon or default 30 days
      const freeMonths = couponData?.discount_type === "free_months" && couponData?.free_months > 0
        ? couponData.free_months
        : 1;
      const periodEnd = new Date(Date.now() + freeMonths * 30 * 24 * 60 * 60 * 1000).toISOString();

      // Update user subscription to the paid plan
      const { data: existingSub } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingSub) {
        await supabase
          .from("user_subscriptions")
          .update({
            plan_id: plan.id,
            status: "active",
            current_period_start: new Date().toISOString(),
            current_period_end: periodEnd,
          })
          .eq("id", existingSub.id);
      } else {
        await supabase
          .from("user_subscriptions")
          .insert({
            user_id: user.id,
            plan_id: plan.id,
            status: "active",
            current_period_start: new Date().toISOString(),
            current_period_end: periodEnd,
          });
      }

      // Mark plan selected
      await supabase
        .from("profiles")
        .update({ plan_selected: true })
        .eq("id", user.id);

      // Create a record of the transaction
      await supabase.from("payment_transactions").insert({
        user_id: user.id,
        plan_id: plan.id,
        amount_cents: 0,
        currency: "LKR",
        order_reference: `COUPON-${Date.now()}`,
        status: "completed",
        coupon_id: couponData?.id || null,
        additional_data: JSON.stringify({ coupon_code: couponData?.code, plan_slug: plan.slug }),
      });

      return new Response(
        JSON.stringify({ free_activation: true, message: "Plan activated with coupon" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (plan.price_cents === 0) {
      return new Response(JSON.stringify({ error: "Cannot pay for free plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get payment settings
    const { data: settings, error: settingsError } = await supabase
      .from("payment_settings")
      .select("*")
      .limit(1)
      .single();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings.app_id || !settings.app_token || !settings.hash_salt) {
      return new Response(
        JSON.stringify({ error: "Payment gateway credentials incomplete" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const amount = (finalPriceCents / 100).toFixed(2);
    const orderReference = `ORD-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    // Generate hash
    const hashInput = settings.app_id + settings.currency + amount + settings.hash_salt;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(hashInput));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    const nameParts = (profile?.full_name || "Customer").split(" ");
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "User";

    // NOTE: Coupon usage is incremented in the callback (onepay-callback) after payment is confirmed,
    // not here, to avoid inflating usage if the user abandons payment.

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        amount_cents: finalPriceCents,
        currency: settings.currency,
        order_reference: orderReference,
        coupon_id: couponData?.id || null,
        additional_data: JSON.stringify({ coupon_code: couponData?.code, plan_slug: plan.slug }),
      })
      .select("id")
      .single();

    if (txError) {
      return new Response(JSON.stringify({ error: "Failed to create transaction" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentData = {
      appid: settings.app_id,
      hashToken: hash,
      amount: parseFloat(amount),
      orderReference,
      customerFirstName: firstName,
      customerLastName: lastName,
      customerPhoneNumber: "",
      customerEmail: profile?.email || user.email || "",
      transactionRedirectUrl: settings.redirect_url || "",
      additionalData: transaction.id,
      apptoken: settings.app_token,
      currency: settings.currency,
    };

    return new Response(JSON.stringify({ paymentData, transactionId: transaction.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return new Response(
      JSON.stringify({ error: "Payment processing failed. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
