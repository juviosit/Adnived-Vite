import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { securityHeaders } from "../_shared/security-headers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const body = await req.json();
    console.log("MaxelPay webhook received:", JSON.stringify(body));

    // MaxelPay sends: { event, data: { sessionId, orderId, status, ... } }
    const event = body.event || body.type;
    const data = body.data || body;
    const orderId = data.orderId || data.order_id;
    const sessionId = data.sessionId || data.session_id;
    const paymentStatus = data.status;

    if (!orderId) {
      console.error("Missing orderId in webhook payload");
      return new Response(JSON.stringify({ error: "Missing orderId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find the transaction by order_reference
    const { data: tx, error: txError } = await supabase
      .from("payment_transactions")
      .select("id, user_id, plan_id, status, coupon_id")
      .eq("order_reference", orderId)
      .single();

    if (txError || !tx) {
      console.error("Transaction not found for orderId:", orderId);
      return new Response(JSON.stringify({ error: "Transaction not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine status
    const isSuccess = event === "payment.completed" ||
      paymentStatus === "completed" ||
      paymentStatus === "success" ||
      paymentStatus === "COMPLETED";
    const newStatus = isSuccess ? "completed" : "failed";

    // Update transaction
    await supabase
      .from("payment_transactions")
      .update({
        status: newStatus,
        onepay_transaction_id: sessionId || null,
      })
      .eq("id", tx.id);

    // If payment succeeded, upgrade user's subscription
    if (isSuccess) {
      // Increment coupon usage
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

      // Update or create subscription
      const { data: existingSub } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", tx.user_id)
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

      // Mark plan as selected
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
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
