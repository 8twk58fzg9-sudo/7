import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const MAX_BODY_BYTES = 8_192;
const allowedOrigins = new Set([
  "https://8twk58fzg9-sudo.github.io",
  "https://computrax.sk",
  "https://www.computrax.sk",
]);

function isAllowedOrigin(origin: string): boolean {
  if (allowedOrigins.has(origin) || origin === "null") return true;
  try {
    const url = new URL(origin);
    return ["localhost", "127.0.0.1", "[::1]", "0.0.0.0"].includes(url.hostname) &&
      ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function headers(origin: string): Record<string, string> {
  const result: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Vary": "Origin",
  };
  if (origin && isAllowedOrigin(origin)) {
    result["Access-Control-Allow-Origin"] = origin;
    result["Access-Control-Allow-Headers"] = "authorization, apikey, content-type, x-client-info";
    result["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    result["Access-Control-Max-Age"] = "600";
  }
  return result;
}

function json(origin: string, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: headers(origin) });
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

function missingGoPaySecrets(): string[] {
  return ["GOPAY_CLIENT_ID", "GOPAY_CLIENT_SECRET", "GOPAY_GOID", "GOPAY_RETURN_URL", "GOPAY_NOTIFICATION_URL"]
    .filter((key) => !Deno.env.get(key));
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  if (origin && !isAllowedOrigin(origin)) return json("", 403, { message: "Origin is not allowed" });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: headers(origin) });
  if (req.method !== "POST") return json(origin, 405, { message: "Method not allowed" });

  const body = await readJson(req);
  if (!body) return json(origin, 400, { message: "Invalid request" });

  const orderId = Number(body.order_id);
  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    return json(origin, 400, { message: "Invalid order" });
  }

  const missing = missingGoPaySecrets();
  if (missing.length) {
    return json(origin, 503, {
      ok: false,
      message: "GoPay is not configured yet",
      missing_secrets: missing,
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const secretKey = serverSecretKey();
  if (!supabaseUrl || !secretKey) return json(origin, 503, { message: "Server is not configured" });

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data: order, error } = await admin
    .from("orders")
    .select("id,order_number,total,customer_email,customer_name,payment_status")
    .eq("id", orderId)
    .maybeSingle();

  if (error) return json(origin, 503, { message: "Order lookup failed" });
  if (!order) return json(origin, 404, { message: "Order not found" });
  if (order.payment_status === "paid") return json(origin, 409, { message: "Order is already paid" });

  // Production implementation point:
  // 1. Recalculate the order total from trusted order_items/products data.
  // 2. Call GoPay OAuth token endpoint with GOPAY_CLIENT_ID/GOPAY_CLIENT_SECRET.
  // 3. Create payment with GOPAY_GOID, amount in cents, return_url and notification_url.
  // 4. Store GoPay payment id/reference + checkout URL on the order.
  // 5. Return checkout_url to the browser.
  // This skeleton intentionally refuses to fake a payment URL.

  await admin.from("orders").update({
    payment_provider: "gopay",
    payment_status: "pending",
    updated_at: new Date().toISOString(),
  }).eq("id", orderId);

  return json(origin, 501, {
    ok: false,
    message: "GoPay API call is prepared but not enabled. Add real GoPay credentials and finish provider request mapping.",
    next_step: "Add GOPAY_* secrets in Supabase and replace the TODO block with the GoPay create-payment request.",
  });
});
