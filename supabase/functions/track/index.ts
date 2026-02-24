import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "public, max-age=86400",
};

// Lightweight tracking script (~800 bytes minified)
const TRACKER_SCRIPT = `(function(){
  "use strict";
  var d=document,w=window,l=w.location;
  var s=d.currentScript;
  var domain=s&&s.getAttribute("data-domain");
  if(!domain)return;
  var endpoint=s.src.split("?")[0];

  function getUTM(p){try{return new URL(l.href).searchParams.get(p)||undefined}catch(e){return undefined}}

  function send(evt,props){
    var payload={
      domain:domain,
      pathname:l.pathname,
      referrer:d.referrer||undefined,
      screen_size:w.innerWidth+"x"+w.innerHeight,
      utm_source:getUTM("utm_source"),
      utm_medium:getUTM("utm_medium"),
      utm_campaign:getUTM("utm_campaign")
    };
    if(evt){payload.event_name=evt;payload.properties=props||{}}
    try{
      if(navigator.sendBeacon){
        navigator.sendBeacon(endpoint,JSON.stringify(payload));
      }else{
        var x=new XMLHttpRequest();
        x.open("POST",endpoint,true);
        x.setRequestHeader("Content-Type","application/json");
        x.send(JSON.stringify(payload));
      }
    }catch(e){}
  }

  // Track initial pageview
  send();

  // SPA support: track pushState/replaceState navigations
  var origPush=history.pushState;
  var origReplace=history.replaceState;
  history.pushState=function(){origPush.apply(this,arguments);send()};
  history.replaceState=function(){origReplace.apply(this,arguments);send()};
  w.addEventListener("popstate",function(){send()});

  // Expose for custom events: window.insight("eventName", {props})
  w.insight=function(evt,props){send(evt,props)};
})();`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // GET = serve the tracking script
  if (req.method === "GET") {
    return new Response(TRACKER_SCRIPT, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { domain, pathname, referrer, screen_size, utm_source, utm_medium, utm_campaign, event_name, properties } = body;

    if (!domain) {
      return new Response(JSON.stringify({ error: "domain required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up site by domain
    const { data: site } = await supabase
      .from("sites")
      .select("id")
      .eq("domain", domain)
      .single();

    if (!site) {
      return new Response(JSON.stringify({ error: "Site not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate daily-rotating session hash from IP + User-Agent (privacy-friendly, no cookies)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || "";
    const today = new Date().toISOString().split("T")[0];
    const encoder = new TextEncoder();
    const data = encoder.encode(`${ip}|${userAgent}|${today}|${site.id}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sessionHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const browser = parseBrowser(userAgent);
    const os = parseOS(userAgent);
    const country = req.headers.get("cf-ipcountry") || null;

    if (event_name) {
      await supabase.from("custom_events").insert({
        site_id: site.id,
        event_name,
        properties: properties || {},
      });
    } else {
      const currentPathname = pathname || "/";
      await supabase.from("pageviews").insert({
        site_id: site.id,
        pathname: currentPathname,
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

      // Check for matching goals and auto-record conversions
      const { data: matchingGoals } = await supabase
        .from("goals")
        .select("id, name, goal_value")
        .eq("site_id", site.id)
        .eq("goal_type", "page_visit");

      for (const goal of matchingGoals || []) {
        if (currentPathname === goal.goal_value || currentPathname.startsWith(goal.goal_value)) {
          await supabase.from("custom_events").insert({
            site_id: site.id,
            event_name: `goal:${goal.name}`,
            properties: { goal_id: goal.id, pathname: currentPathname },
          });
        }
      }
    }

    // Return 202 Accepted (non-blocking for the client)
    return new Response(JSON.stringify({ ok: true }), {
      status: 202,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_err) {
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
