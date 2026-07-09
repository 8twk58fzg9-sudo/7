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

function replaceVars(template: string, values: Record<string, string>) {
  return String(template || "").replace(/{{\s*([a-z0-9_]+)\s*}}/gi, (_, key) => values[String(key).toLowerCase()] ?? "");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { ok: false, message: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const resendKey = Deno.env.get("RESEND_API_KEY") || "";
  const fromEmail = Deno.env.get("ORDER_EMAIL_FROM") || "NANOERA <onboarding@resend.dev>";
  const fallbackReplyTo = Deno.env.get("ORDER_EMAIL_REPLY_TO") || "computerax.sk@gmail.com";
  if (!supabaseUrl || !serviceRoleKey) return json(req, { ok: false, message: "E-mailová služba nie je nastavená." }, 500);

  try {
    const body = await req.json().catch(() => ({}));
    const status = String(body.status || "confirmed");
    const orderNumber = String(body.order_number || "").trim().toUpperCase();
    const testEmail = String(body.test_email || "").trim().toLowerCase();

    let order: Record<string, unknown> = {};
    if (orderNumber) {
      const orderRes = await fetch(`${supabaseUrl}/rest/v1/orders?select=*&order_number=eq.${encodeURIComponent(orderNumber)}&limit=1`, {
        headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
      });
      const rows = await orderRes.json().catch(() => []);
      order = Array.isArray(rows) ? rows[0] || {} : {};
    }

    const templateRes = await fetch(`${supabaseUrl}/rest/v1/email_templates?select=*&key=eq.${encodeURIComponent(status)}&limit=1`, {
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    });
    const templateRows = await templateRes.json().catch(() => []);
    const template = Array.isArray(templateRows) ? templateRows[0] || {} : {};

    const to = testEmail || String(order.customer_email || "").trim().toLowerCase();
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) return json(req, { ok: false, message: "Chýba platný e-mail zákazníka." }, 400);

    const items = Array.isArray(order.items) ? order.items : [];
    const itemText = items.map((item: any) => `${item.qty || 1}x ${item.name || "Produkt"} - ${item.price || 0} EUR`).join("\n");
    const values = {
      customer_name: String(order.customer_name || "zákazník"),
      order_number: orderNumber || "TEST",
      order_total: `${order.total || 0} EUR`,
      items: itemText || "Testovací e-mail",
      support_email: fallbackReplyTo,
      status_label: status,
      tracking_number: String(order.tracking_number || ""),
      tracking_line: order.tracking_number ? `Sledovanie zásielky: ${order.tracking_number}` : "",
    };
    const subject = replaceVars(String(template.subject || "Objednávka {{order_number}} - {{status_label}}"), values);
    const text = replaceVars(String(template.body || "Dobrý deň {{customer_name}},\n\nstav objednávky {{order_number}}: {{status_label}}\n\nNANOERA s.r.o."), values);

    if (!resendKey) {
      return json(req, { ok: true, email_sent: false, message: "RESEND_API_KEY nie je nastavený. Šablóna je pripravená, e-mail sa neposlal.", subject, text });
    }

    const mail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: fromEmail, to, reply_to: fallbackReplyTo, subject, text }),
    });
    const responseText = await mail.text();
    if (!mail.ok) return json(req, { ok: false, email_sent: false, message: responseText || "Resend e-mail zlyhal." }, 502);
    return json(req, { ok: true, email_sent: true, provider_response: JSON.parse(responseText || "{}") });
  } catch (error) {
    return json(req, { ok: false, email_sent: false, message: error instanceof Error ? error.message : String(error) }, 500);
  }
});
