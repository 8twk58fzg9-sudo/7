import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const allowedOrigins = [
  "https://computrax.sk",
  "https://www.computrax.sk",
  "https://8twk58fzg9-sudo.github.io",
  "https://8twk58fzg9-sudo.github.io/real",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:8767",
];

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowed = allowedOrigins.some((item) => origin === item || origin.startsWith(item + "/"));
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://computrax.sk",
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

function json(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders(req) });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { ok: false, message: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!supabaseUrl || !serviceRoleKey) {
    return json(req, { ok: false, message: "Server objednávok nie je nastavený." }, 500);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const orderPayload = body.order_payload;
    if (!orderPayload || typeof orderPayload !== "object" || Array.isArray(orderPayload)) {
      return json(req, { ok: false, message: "Neplatná objednávka." }, 400);
    }

    const rpc = await fetch(`${supabaseUrl}/rest/v1/rpc/create_order_and_purchase`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order_payload: orderPayload }),
    });
    const text = await rpc.text();
    const data = text ? JSON.parse(text) : {};
    if (!rpc.ok) {
      return json(req, { ok: false, message: data.message || data.error || text || "Objednávku sa nepodarilo uložiť." }, rpc.status);
    }
    return json(req, data);
  } catch (error) {
    return json(req, { ok: false, message: error instanceof Error ? error.message : String(error) }, 500);
  }
});
