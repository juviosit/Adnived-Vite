import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { site_id, pathname, referrer, screen_size, utm_source, utm_medium, utm_campaign, event_name, properties } = body;

    if (!site_id) {
      return new Response(JSON.stringify({ error: "site_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify site exists
    const { data: site } = await supabase
      .from("sites")
      .select("id, domain")
      .eq("id", site_id)
      .single();

    if (!site) {
      return new Response(JSON.stringify({ error: "Site not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate daily-rotating session hash from IP + User-Agent
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || "";
    const today = new Date().toISOString().split("T")[0];
    const encoder = new TextEncoder();
    const data = encoder.encode(`${ip}|${userAgent}|${today}|${site_id}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sessionHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Parse User-Agent for browser/OS
    const browser = parseBrowser(userAgent);
    const os = parseOS(userAgent);

    // Determine country from Cloudflare headers if available
    const country = req.headers.get("cf-ipcountry") || null;

    if (event_name) {
      // Custom event
      await supabase.from("custom_events").insert({
        site_id,
        event_name,
        properties: properties || {},
      });
    } else {
      // Pageview
      await supabase.from("pageviews").insert({
        site_id,
        pathname: pathname || "/",
        referrer: referrer || null,
        country,
        browser,
        os,
        screen_size: screen_size || null,
        session_hash: sessionHash,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function parseBrowser(ua: string): string {
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  return "Other";
}

function parseOS(ua: string): string {
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Other";
}
