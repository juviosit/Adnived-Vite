import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "public, max-age=86400",
};

// Lightweight tracking script (~900 bytes minified)
const TRACKER_SCRIPT = `(function(){
  "use strict";
  var d=document,w=window,l=w.location;
  var s=d.currentScript;
  var domain=s&&s.getAttribute("data-domain");
  if(!domain)return;
  var endpoint=s.src.split("?")[0];
  var tz;try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){tz=""}

  function getUTM(p){try{return new URL(l.href).searchParams.get(p)||undefined}catch(e){return undefined}}

  function send(evt,props){
    var payload={
      domain:domain,
      pathname:l.pathname,
      referrer:d.referrer||undefined,
      screen_size:w.innerWidth+"x"+w.innerHeight,
      timezone:tz,
      utm_source:getUTM("utm_source"),
      utm_medium:getUTM("utm_medium"),
      utm_campaign:getUTM("utm_campaign"),
      utm_term:getUTM("utm_term"),
      utm_content:getUTM("utm_content")
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

// Simple timezone-to-country mapping for common timezones
const TZ_COUNTRY: Record<string, { country: string; region?: string; city?: string }> = {
  "America/New_York": { country: "US", region: "New York", city: "New York" },
  "America/Chicago": { country: "US", region: "Illinois", city: "Chicago" },
  "America/Denver": { country: "US", region: "Colorado", city: "Denver" },
  "America/Los_Angeles": { country: "US", region: "California", city: "Los Angeles" },
  "America/Phoenix": { country: "US", region: "Arizona", city: "Phoenix" },
  "America/Anchorage": { country: "US", region: "Alaska" },
  "Pacific/Honolulu": { country: "US", region: "Hawaii", city: "Honolulu" },
  "America/Toronto": { country: "CA", region: "Ontario", city: "Toronto" },
  "America/Vancouver": { country: "CA", region: "British Columbia", city: "Vancouver" },
  "America/Montreal": { country: "CA", region: "Quebec", city: "Montreal" },
  "Europe/London": { country: "GB", region: "England", city: "London" },
  "Europe/Paris": { country: "FR", region: "Île-de-France", city: "Paris" },
  "Europe/Berlin": { country: "DE", region: "Berlin", city: "Berlin" },
  "Europe/Madrid": { country: "ES", region: "Madrid", city: "Madrid" },
  "Europe/Rome": { country: "IT", region: "Lazio", city: "Rome" },
  "Europe/Amsterdam": { country: "NL", region: "North Holland", city: "Amsterdam" },
  "Europe/Brussels": { country: "BE", region: "Brussels", city: "Brussels" },
  "Europe/Zurich": { country: "CH", region: "Zurich", city: "Zurich" },
  "Europe/Vienna": { country: "AT", region: "Vienna", city: "Vienna" },
  "Europe/Stockholm": { country: "SE", region: "Stockholm", city: "Stockholm" },
  "Europe/Oslo": { country: "NO", region: "Oslo", city: "Oslo" },
  "Europe/Copenhagen": { country: "DK", region: "Capital Region", city: "Copenhagen" },
  "Europe/Helsinki": { country: "FI", region: "Uusimaa", city: "Helsinki" },
  "Europe/Warsaw": { country: "PL", region: "Masovia", city: "Warsaw" },
  "Europe/Prague": { country: "CZ", region: "Prague", city: "Prague" },
  "Europe/Bucharest": { country: "RO", region: "Bucharest", city: "Bucharest" },
  "Europe/Athens": { country: "GR", region: "Attica", city: "Athens" },
  "Europe/Istanbul": { country: "TR", region: "Istanbul", city: "Istanbul" },
  "Europe/Moscow": { country: "RU", region: "Moscow", city: "Moscow" },
  "Europe/Kiev": { country: "UA", region: "Kyiv", city: "Kyiv" },
  "Europe/Lisbon": { country: "PT", region: "Lisbon", city: "Lisbon" },
  "Europe/Dublin": { country: "IE", region: "Leinster", city: "Dublin" },
  "Asia/Tokyo": { country: "JP", region: "Tokyo", city: "Tokyo" },
  "Asia/Shanghai": { country: "CN", region: "Shanghai", city: "Shanghai" },
  "Asia/Hong_Kong": { country: "HK", region: "Hong Kong", city: "Hong Kong" },
  "Asia/Singapore": { country: "SG", region: "Singapore", city: "Singapore" },
  "Asia/Seoul": { country: "KR", region: "Seoul", city: "Seoul" },
  "Asia/Kolkata": { country: "IN", region: "Maharashtra", city: "Mumbai" },
  "Asia/Calcutta": { country: "IN", region: "Maharashtra", city: "Mumbai" },
  "Asia/Dubai": { country: "AE", region: "Dubai", city: "Dubai" },
  "Asia/Bangkok": { country: "TH", region: "Bangkok", city: "Bangkok" },
  "Asia/Jakarta": { country: "ID", region: "Jakarta", city: "Jakarta" },
  "Asia/Taipei": { country: "TW", region: "Taipei", city: "Taipei" },
  "Asia/Colombo": { country: "LK", region: "Western", city: "Colombo" },
  "Australia/Sydney": { country: "AU", region: "New South Wales", city: "Sydney" },
  "Australia/Melbourne": { country: "AU", region: "Victoria", city: "Melbourne" },
  "Australia/Brisbane": { country: "AU", region: "Queensland", city: "Brisbane" },
  "Australia/Perth": { country: "AU", region: "Western Australia", city: "Perth" },
  "Pacific/Auckland": { country: "NZ", region: "Auckland", city: "Auckland" },
  "America/Sao_Paulo": { country: "BR", region: "São Paulo", city: "São Paulo" },
  "America/Argentina/Buenos_Aires": { country: "AR", region: "Buenos Aires", city: "Buenos Aires" },
  "America/Mexico_City": { country: "MX", region: "Mexico City", city: "Mexico City" },
  "America/Bogota": { country: "CO", region: "Bogotá", city: "Bogotá" },
  "America/Lima": { country: "PE", region: "Lima", city: "Lima" },
  "America/Santiago": { country: "CL", region: "Santiago", city: "Santiago" },
  "Africa/Cairo": { country: "EG", region: "Cairo", city: "Cairo" },
  "Africa/Lagos": { country: "NG", region: "Lagos", city: "Lagos" },
  "Africa/Johannesburg": { country: "ZA", region: "Gauteng", city: "Johannesburg" },
  "Africa/Nairobi": { country: "KE", region: "Nairobi", city: "Nairobi" },
  "Africa/Casablanca": { country: "MA", region: "Casablanca", city: "Casablanca" },
  "Asia/Riyadh": { country: "SA", region: "Riyadh", city: "Riyadh" },
  "Asia/Tel_Aviv": { country: "IL", region: "Tel Aviv", city: "Tel Aviv" },
  "Asia/Karachi": { country: "PK", region: "Sindh", city: "Karachi" },
  "Asia/Dhaka": { country: "BD", region: "Dhaka", city: "Dhaka" },
  "Asia/Kuala_Lumpur": { country: "MY", region: "Kuala Lumpur", city: "Kuala Lumpur" },
  "Asia/Manila": { country: "PH", region: "Metro Manila", city: "Manila" },
  "Asia/Ho_Chi_Minh": { country: "VN", region: "Ho Chi Minh", city: "Ho Chi Minh City" },
};

function resolveGeo(
  headers: Headers,
  timezone?: string
): { country: string | null; region: string | null; city: string | null } {
  // 1. Try CDN/proxy geo headers
  const country = headers.get("cf-ipcountry") || headers.get("x-country") || headers.get("x-vercel-ip-country");
  if (country && country !== "XX") {
    return {
      country,
      region: headers.get("cf-region") || headers.get("x-vercel-ip-country-region") || null,
      city: headers.get("cf-ipcity") || headers.get("x-vercel-ip-city") || null,
    };
  }

  // 2. Fallback to timezone mapping
  if (timezone && TZ_COUNTRY[timezone]) {
    const tz = TZ_COUNTRY[timezone];
    return { country: tz.country, region: tz.region || null, city: tz.city || null };
  }

  // 3. Try partial timezone match (e.g. "Europe/X" → first match)
  if (timezone) {
    const prefix = timezone.split("/")[0];
    const regionMap: Record<string, string> = {
      Europe: "EU",
      America: "US",
      Asia: "AS",
      Africa: "AF",
      Australia: "AU",
      Pacific: "OC",
    };
    if (regionMap[prefix]) {
      return { country: regionMap[prefix], region: null, city: null };
    }
  }

  return { country: null, region: null, city: null };
}

// In-memory rate limiter (per isolate)
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

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
    const { domain, pathname, referrer, screen_size, timezone, utm_source, utm_medium, utm_campaign, utm_term, utm_content, event_name, properties } = body;

    if (!domain || typeof domain !== "string") {
      return new Response(JSON.stringify({ error: "domain required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Input length validation
    if (domain.length > 255) {
      return new Response(JSON.stringify({ error: "domain too long" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (pathname && pathname.length > 2048) {
      return new Response(JSON.stringify({ error: "pathname too long" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (referrer && referrer.length > 2048) {
      return new Response(JSON.stringify({ error: "referrer too long" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (event_name && (typeof event_name !== "string" || event_name.length > 255)) {
      return new Response(JSON.stringify({ error: "invalid event_name" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const utmFields = [utm_source, utm_medium, utm_campaign, utm_term, utm_content];
    if (utmFields.some((f) => f && (typeof f !== "string" || f.length > 255))) {
      return new Response(JSON.stringify({ error: "UTM parameter too long" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (properties && JSON.stringify(properties).length > 10000) {
      return new Response(JSON.stringify({ error: "properties too large" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Simple IP-based rate limiting (100 requests/minute per IP)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    const limit = rateLimiter.get(ip);
    if (limit) {
      if (now < limit.resetAt) {
        if (limit.count >= 100) {
          return new Response(JSON.stringify({ error: "rate limit exceeded" }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" },
          });
        }
        limit.count++;
      } else {
        rateLimiter.set(ip, { count: 1, resetAt: now + 60000 });
      }
    } else {
      rateLimiter.set(ip, { count: 1, resetAt: now + 60000 });
    }
    // Cleanup old entries periodically
    if (rateLimiter.size > 10000) {
      for (const [key, val] of rateLimiter) {
        if (now > val.resetAt) rateLimiter.delete(key);
      }
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
    const userAgent = req.headers.get("user-agent") || "";
    const today = new Date().toISOString().split("T")[0];
    const encoder = new TextEncoder();
    const data = encoder.encode(`${ip}|${userAgent}|${today}|${site.id}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sessionHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const browser = parseBrowser(userAgent);
    const os = parseOS(userAgent);
    const deviceType = parseDevice(userAgent);
    const geo = resolveGeo(req.headers, timezone);

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
        country: geo.country,
        region: geo.region,
        city: geo.city,
        browser,
        os,
        device_type: deviceType,
        screen_size: screen_size || null,
        session_hash: sessionHash,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_term: utm_term || null,
        utm_content: utm_content || null,
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
  if (ua.includes("Linux") && !ua.includes("Android")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("CrOS")) return "Chrome OS";
  return "Other";
}

function parseDevice(ua: string): string {
  if (/Mobi|Android.*Mobile|iPhone/i.test(ua)) return "Mobile";
  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}
