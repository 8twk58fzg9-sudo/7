import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const MAX_BODY_BYTES = 4_096;
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

async function isAdminRequest(req: Request, admin: ReturnType<typeof createClient>): Promise<boolean> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) return false;
  const anon = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const url = Deno.env.get("SUPABASE_URL") || "";
  if (!anon || !url) return false;
  const userClient = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: auth } },
  });
  const { data } = await userClient.auth.getUser(token);
  const uid = data.user?.id;
  if (!uid) return false;
  const { data: marker } = await admin.from("admin_users").select("user_id").eq("user_id", uid).maybeSingle();
  return Boolean(marker);
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  if (origin && !isAllowedOrigin(origin)) return json("", 403, { message: "Origin is not allowed" });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: headers(origin) });
  if (req.method !== "POST") return json(origin, 405, { message: "Method not allowed" });

  const body = await readJson(req);
  if (!body) return json(origin, 400, { message: "Invalid request" });

  const orderId = Number(body.order_id);
  if (!Number.isSafeInteger(orderId) || orderId <= 0) return json(origin, 400, { message: "Invalid order" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const secretKey = serverSecretKey();
  if (!supabaseUrl || !secretKey) return json(origin, 503, { message: "Server is not configured" });

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const internalKey = Deno.env.get("COMMERCE_INTERNAL_KEY") || "";
  const providedInternalKey = req.headers.get("x-commerce-internal-key") || "";
  const allowed = internalKey && providedInternalKey === internalKey || await isAdminRequest(req, admin);
  if (!allowed) return json(origin, 403, { message: "Admin or internal access required" });

  const missing = ["SUPERFAKTURA_EMAIL", "SUPERFAKTURA_API_KEY"].filter((key) => !Deno.env.get(key));
  if (missing.length) return json(origin, 503, {
    ok: false,
    message: "SuperFaktura is not configured yet",
    missing_secrets: missing,
  });

  const { data: order, error } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (error) return json(origin, 503, { message: "Order lookup failed" });
  if (!order) return json(origin, 404, { message: "Order not found" });
  if (order.invoice_status === "created" || order.invoice_status === "sent") {
    return json(origin, 200, {
      ok: true,
      already_created: true,
      invoice_number: order.invoice_number,
      invoice_pdf_url: order.invoice_pdf_url,
    });
  }
  if (order.payment_status && !["paid", "unpaid"].includes(order.payment_status)) {
    return json(origin, 409, { message: "Invoice cannot be created for this payment state" });
  }

  await admin.from("orders").update({
    invoice_provider: "superfaktura",
    invoice_status: "pending",
    updated_at: new Date().toISOString(),
  }).eq("id", orderId);

  // Production implementation point:
  // 1. Map order/customer/items into SuperFaktura invoice payload.
  // 2. Confirm VAT/margin-scheme logic with accountant before launch.
  // 3. Call SuperFaktura API with SUPERFAKTURA_EMAIL + SUPERFAKTURA_API_KEY.
  // 4. Store invoice_provider_id, invoice_number and invoice_pdf_url in orders.
  // 5. Log provider payload in invoice_events.
  // 6. Send invoice email or let SuperFaktura send it.

  await admin.from("invoice_events").insert({
    provider: "superfaktura",
    event_type: "prepared_not_sent",
    order_id: orderId,
    payload: { note: "Skeleton called. SuperFaktura API mapping is not enabled yet." },
  });

  return json(origin, 501, {
    ok: false,
    message: "SuperFaktura API call is prepared but not enabled. Finish invoice payload mapping after accountant confirms VAT settings.",
  });
});
