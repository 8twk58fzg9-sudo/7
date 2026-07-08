import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const MAX_BODY_BYTES = 16_384;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}

function serverSecretKey(): string {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (legacy) return legacy;
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}") as Record<string, string>;
    return keys.default || "";
  } catch {
    return "";
  }
}

async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > MAX_BODY_BYTES) return null;
  const text = await req.text();
  if (!text || new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) return null;
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { message: "Method not allowed" });

  const body = await readJson(req);
  if (!body) return json(400, { message: "Invalid webhook" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const secretKey = serverSecretKey();
  if (!supabaseUrl || !secretKey) return json(503, { message: "Server is not configured" });

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  // GoPay sends notification data and the server must verify final state with GoPay API.
  // Do not trust browser return URLs or unverified webhook payloads.
  const paymentReference = String(body.id || body.payment_id || body.payment_reference || "").slice(0, 160);
  const eventId = String(body.event_id || body.id || crypto.randomUUID()).slice(0, 180);

  const { error: eventError } = await admin.from("payment_events").insert({
    provider: "gopay",
    event_id: eventId,
    payment_reference: paymentReference || null,
    status: "received",
    payload: body,
  });
  if (eventError?.code === "23505") return json(200, { ok: true, duplicate: true });
  if (eventError) return json(503, { message: "Webhook log failed" });

  const missing = ["GOPAY_CLIENT_ID", "GOPAY_CLIENT_SECRET", "GOPAY_GOID"].filter((key) => !Deno.env.get(key));
  if (missing.length) {
    return json(503, {
      ok: false,
      message: "GoPay webhook received, but GoPay secrets are not configured yet",
      missing_secrets: missing,
    });
  }

  // Production implementation point:
  // 1. Exchange client credentials for GoPay access token.
  // 2. Fetch payment detail by paymentReference.
  // 3. If PAID, mark order paid using payment_reference mapping.
  // 4. Decrement/reserve inventory atomically if not already done.
  // 5. Call create-invoice or enqueue invoice creation.
  // 6. Send customer email.

  return json(501, {
    ok: false,
    message: "Webhook logging is ready. Finish GoPay payment verification before enabling paid order updates.",
  });
});
