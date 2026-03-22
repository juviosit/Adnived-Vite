import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { securityHeaders } from "../_shared/security-headers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  ...securityHeaders,
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

    // If final price is 0 with coupon, activate plan directly
    if (finalPriceCents === 0 && plan.price_cents > 0) {
      if (couponData) {
        await supabase
          .from("coupons")
          .update({ used_count: couponData.used_count + 1 })
          .eq("id", couponData.id);
      }

      const freeMonths = couponData?.discount_type === "free_months" && couponData?.free_months > 0
        ? couponData.free_months
        : 1;
      const periodEnd = new Date(Date.now() + freeMonths * 30 * 24 * 60 * 60 * 1000).toISOString();

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

      await supabase
        .from("profiles")
        .update({ plan_selected: true })
        .eq("id", user.id);

      await supabase.from("payment_transactions").insert({
        user_id: user.id,
        plan_id: plan.id,
        amount_cents: 0,
        currency: "USD",
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

    // Get MaxelPay API key
    const maxelPayApiKey = Deno.env.get("MAXELPAY_API_KEY");
    if (!maxelPayApiKey) {
      console.error("MAXELPAY_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get payment settings for redirect/callback URLs
    const { data: settings } = await supabase
      .from("payment_settings")
      .select("redirect_url, callback_url, currency")
      .limit(1)
      .single();

    const amount = finalPriceCents / 100;
    const orderId = `ORD-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    const callbackUrl = settings?.callback_url ||
      `${supabaseUrl}/functions/v1/maxelpay-webhook`;
    const successUrl = settings?.redirect_url || "";
    const cancelUrl = settings?.redirect_url || "";

    // Create transaction record first
    const { data: transaction, error: txError } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        amount_cents: finalPriceCents,
        currency: settings?.currency || "USD",
        order_reference: orderId,
        coupon_id: couponData?.id || null,
        additional_data: JSON.stringify({ coupon_code: couponData?.code, plan_slug: plan.slug }),
      })
      .select("id")
      .single();

    if (txError) {
      console.error("Failed to create transaction:", txError);
      return new Response(JSON.stringify({ error: "Failed to create transaction" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call MaxelPay API to create payment session
    const maxelPayResponse = await fetch("https://api.maxelpay.com/api/v1/payments/sessions", {
      method: "POST",
      headers: {
        "X-API-KEY": maxelPayApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: orderId,
        amount: amount,
        currency: settings?.currency || "USD",
        successUrl: successUrl,
        cancelUrl: cancelUrl,
        callbackUrl: callbackUrl,
      }),
    });

    const maxelPayData = await maxelPayResponse.json();

    if (!maxelPayResponse.ok) {
      console.error("MaxelPay API error:", JSON.stringify(maxelPayData));
      // Mark transaction as failed
      await supabase
        .from("payment_transactions")
        .update({ status: "failed" })
        .eq("id", transaction.id);
      return new Response(
        JSON.stringify({ error: "Payment gateway error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store the MaxelPay session ID in the transaction
    await supabase
      .from("payment_transactions")
      .update({ onepay_transaction_id: maxelPayData.sessionId || maxelPayData.id || null })
      .eq("id", transaction.id);

    return new Response(
      JSON.stringify({
        checkoutUrl: maxelPayData.checkoutUrl || maxelPayData.url,
        sessionId: maxelPayData.sessionId || maxelPayData.id,
        transactionId: transaction.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating payment:", error);
    return new Response(
      JSON.stringify({ error: "Payment processing failed. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
