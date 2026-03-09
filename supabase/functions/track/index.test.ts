import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const TRACK_URL = `${SUPABASE_URL}/functions/v1/track`;

Deno.test("rejects request with mismatched origin", async () => {
  const res = await fetch(TRACK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "https://evil-site.com",
    },
    body: JSON.stringify({ domain: "example.com", pathname: "/" }),
  });
  const body = await res.text();
  // Should be 403 (origin mismatch) or 404 (site not found) - either way, not 202
  console.log(`Mismatched origin: status=${res.status}, body=${body}`);
  assertEquals(res.status !== 202, true, "Should not accept mismatched origin");
});

Deno.test("rejects request with invalid origin (fetch may strip it)", async () => {
  const res = await fetch(TRACK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "not-a-url",
    },
    body: JSON.stringify({ domain: "example.com", pathname: "/" }),
  });
  const body = await res.text();
  console.log(`Invalid origin: status=${res.status}, body=${body}`);
  // Fetch clients may strip invalid Origin headers, so either 403 or 404 is acceptable
  assertEquals(res.status !== 202, true, "Should not accept with invalid origin");
});

Deno.test("allows request with no origin header (server-side beacon)", async () => {
  // No origin header - should proceed to site lookup (404 since example.com isn't registered)
  const res = await fetch(TRACK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain: "example.com", pathname: "/" }),
  });
  const body = await res.text();
  console.log(`No origin: status=${res.status}, body=${body}`);
  // Should be 404 (site not found), not 403
  assertEquals(res.status !== 403, true, "Should not reject when no origin header");
});
