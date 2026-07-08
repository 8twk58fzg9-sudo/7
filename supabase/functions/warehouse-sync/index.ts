import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const allowedOrigins = new Set(["https://computrax.sk", "https://www.computrax.sk", "https://8twk58fzg9-sudo.github.io", "http://localhost:3000", "http://localhost:5173"]);
function corsHeaders(req: Request) { const origin = req.headers.get("origin") || ""; return { "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://computrax.sk", "Vary": "Origin", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Content-Type": "application/json" }; }
function json(req: Request, data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: corsHeaders(req) }); }
function decodeJwtPayload(token: string) { try { const part = token.split(".")[1] || ""; const normalized = part.replace(/-/g, "+").replace(/_/g, "/"); const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4); return JSON.parse(atob(padded)); } catch (_) { return null; } }
function normalizeNumber(value: unknown, fallback = 0) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
function normalizeItem(item: Record<string, unknown>) { return { sku: String(item.sku ?? item.id ?? item.code ?? item.ean ?? "").trim(), title: String(item.title ?? item.name ?? item.product_name ?? "").trim(), stock: normalizeNumber(item.stock ?? item.quantity ?? item.qty ?? item.available, 0), price: normalizeNumber(item.price ?? item.sale_price ?? item.amount, 0), warehouse_location: String(item.location ?? item.warehouse_location ?? "").trim(), raw: item }; }

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  const bearer = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const claims = decodeJwtPayload(bearer);
  const email = String(claims?.email || "").toLowerCase();
  const role = String(claims?.role || "");
  const allowlist = (Deno.env.get("COMPUTRAX_ADMIN_EMAILS") || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (role !== "authenticated") return json(req, { ok: false, error: "authentication_required" }, 401);
  if (allowlist.length && !allowlist.includes(email)) return json(req, { ok: false, error: "admin_not_allowed" }, 403);

  const providerUrl = Deno.env.get("WAREHOUSE_API_URL") ?? "";
  const providerKey = Deno.env.get("WAREHOUSE_API_KEY") ?? "";
  if (req.method === "GET") return json(req, { ok: true, service: "Computrax warehouse sync", authenticated_as: email || "authenticated-user", secrets_present: { WAREHOUSE_API_URL: Boolean(providerUrl), WAREHOUSE_API_KEY: Boolean(providerKey), COMPUTRAX_ADMIN_EMAILS: Boolean(allowlist.length) } });
  if (!providerUrl || !providerKey) return json(req, { ok: false, error: "warehouse_not_configured", hint: "Set WAREHOUSE_API_URL and WAREHOUSE_API_KEY in Supabase Edge Function secrets. Do not put warehouse keys in GitHub Pages." }, 400);

  try {
    const body = await req.json().catch(() => ({}));
    const method = String(body.method || "GET").toUpperCase() === "POST" ? "POST" : "GET";
    const upstream = await fetch(providerUrl, { method, headers: { "Authorization": `Bearer ${providerKey}`, "Accept": "application/json", "Content-Type": "application/json" }, body: method === "POST" ? JSON.stringify(body.payload || {}) : undefined });
    const contentType = upstream.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await upstream.json() : await upstream.text();
    if (!upstream.ok) return json(req, { ok: false, error: "warehouse_provider_error", status: upstream.status, payload }, 502);
    const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : Array.isArray(payload?.products) ? payload.products : Array.isArray(payload?.data) ? payload.data : [];
    const items = rows.map((x: unknown) => normalizeItem(x as Record<string, unknown>)).filter((x) => x.sku || x.title);
    return json(req, { ok: true, synced_at: new Date().toISOString(), count: items.length, items });
  } catch (error) {
    return json(req, { ok: false, error: "sync_failed", message: error instanceof Error ? error.message : String(error) }, 500);
  }
});
