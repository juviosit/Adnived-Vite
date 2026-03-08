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

    const body = await req.json();
    // OnePay callback payload: { transaction_id, status, status_message, additional_data }
    const { transaction_id, status, status_message, additional_data } = body;

    console.log("OnePay callback received:", JSON.stringify(body));

    if (!additional_data) {
      return new Response(JSON.stringify({ error: "Missing transaction reference" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // additional_data contains our internal transaction ID
    const internalTxId = additional_data;

    // Get the transaction
    const { data: tx, error: txError } = await supabase
      .from("payment_transactions")
      .select("id, user_id, plan_id, status, coupon_id")
      .eq("id", internalTxId)
      .single();

    if (txError || !tx) {
      console.error("Transaction not found:", internalTxId);
      return new Response(JSON.stringify({ error: "Transaction not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // status 1 = SUCCESS in OnePay
    const newStatus = status === 1 ? "success" : "failed";

    // Update transaction
    await supabase
      .from("payment_transactions")
      .update({
        status: newStatus,
        onepay_transaction_id: transaction_id || null,
      })
      .eq("id", internalTxId);

    // If payment succeeded, upgrade user's subscription
    if (newStatus === "success") {
      // Increment coupon usage if a coupon was used
      if (tx.coupon_id) {
        const { data: coupon } = await supabase
          .from("coupons")
          .select("id, used_count")
          .eq("id", tx.coupon_id)
          .single();
        if (coupon) {
          await supabase
            .from("coupons")
            .update({ used_count: coupon.used_count + 1 })
            .eq("id", coupon.id);
        }
      }

      // Check if user already has an active subscription
      const { data: existingSub } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", tx.user_id)
        .eq("status", "active")
        .single();

      if (existingSub) {
        await supabase
          .from("user_subscriptions")
          .update({
            plan_id: tx.plan_id,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            hits_used: 0,
          })
          .eq("id", existingSub.id);
      } else {
        await supabase.from("user_subscriptions").insert({
          user_id: tx.user_id,
          plan_id: tx.plan_id,
        });
      }

      // Mark plan as selected (for first-time purchasers)
      await supabase
        .from("profiles")
        .update({ plan_selected: true })
        .eq("id", tx.user_id);

      console.log(`User ${tx.user_id} upgraded to plan ${tx.plan_id}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Callback error:", error);
    return new Response(
      JSON.stringify({ error: "Payment callback processing failed." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
