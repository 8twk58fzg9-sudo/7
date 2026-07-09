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

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowed = allowedOrigins.some((item) => origin === item || origin.startsWith(item + "/"));
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://computrax.sk",
    Vary: "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function json(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function basicAuth(apiKey: string) {
  return "Basic " + btoa(`api:${apiKey}`);
}

function decodeBase64Image(dataUrl: string) {
  const match = String(dataUrl || "").match(/^data:(image\/(?:jpeg|png|webp|avif));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match) throw new Error("Neplatný formát obrázka.");
  const contentType = match[1].toLowerCase();
  if (!ALLOWED_TYPES.has(contentType)) throw new Error("Povolené sú iba JPG, PNG, WebP alebo AVIF obrázky.");
  const binary = atob(match[2].replace(/\s+/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  if (bytes.byteLength <= 0 || bytes.byteLength > MAX_IMAGE_BYTES) throw new Error("Obrázok je prázdny alebo väčší než 10 MB.");
  return { contentType, bytes };
}

async function requireAdmin(req: Request, supabaseUrl: string, serviceRoleKey: string) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) throw new Error("Chýba admin prihlásenie.");

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${token}` },
  });
  if (!userRes.ok) throw new Error("Admin prihlásenie vypršalo.");
  const user = await userRes.json().catch(() => ({}));
  if (!user?.id) throw new Error("Neplatný admin používateľ.");

  const adminRes = await fetch(`${supabaseUrl}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
  });
  if (adminRes.ok) {
    const isAdmin = await adminRes.json().catch(() => false);
    if (isAdmin !== true) throw new Error("Používateľ nemá admin oprávnenie.");
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { ok: false, message: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const tinifyKey = Deno.env.get("TINIFY_API_KEY") || Deno.env.get("TINYPNG_API_KEY") || Deno.env.get("TINYJPG_API_KEY") || "";
  if (!supabaseUrl || !serviceRoleKey) return json(req, { ok: false, message: "Supabase funkcia nie je nastavená." }, 500);

  try {
    await requireAdmin(req, supabaseUrl, serviceRoleKey);
    if (!tinifyKey) return json(req, { ok: false, message: "TINIFY_API_KEY nie je nastavený v Supabase secrets." }, 503);
    const body = await req.json().catch(() => ({}));
    const { contentType, bytes } = decodeBase64Image(String(body.image || ""));
    const desiredType = String(body.convert_to || "image/webp");
    const outputType = ["image/webp", "image/jpeg", "image/png", "image/avif"].includes(desiredType) ? desiredType : "image/webp";

    const shrink = await fetch("https://api.tinify.com/shrink", {
      method: "POST",
      headers: { Authorization: basicAuth(tinifyKey), "Content-Type": contentType },
      body: bytes,
    });
    const shrinkText = await shrink.text();
    const location = shrink.headers.get("location") || "";
    if (!shrink.ok || !location) {
      return json(req, { ok: false, message: shrinkText || "TinyJPG kompresia zlyhala." }, shrink.status || 502);
    }

    const converted = await fetch(location, {
      method: "POST",
      headers: { Authorization: basicAuth(tinifyKey), "Content-Type": "application/json" },
      body: JSON.stringify({ convert: { type: outputType } }),
    });
    const optimizedBytes = new Uint8Array(await converted.arrayBuffer());
    if (!converted.ok || !optimizedBytes.byteLength) {
      const message = new TextDecoder().decode(optimizedBytes) || "TinyJPG výstup sa nepodarilo stiahnuť.";
      return json(req, { ok: false, message }, converted.status || 502);
    }

    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < optimizedBytes.length; i += chunk) {
      binary += String.fromCharCode(...optimizedBytes.slice(i, i + chunk));
    }
    const optimizedType = converted.headers.get("content-type") || outputType;
    const compressionCount = Number(converted.headers.get("compression-count") || shrink.headers.get("compression-count") || 0);

    return json(req, {
      ok: true,
      image: `data:${optimizedType};base64,${btoa(binary)}`,
      input_size: bytes.byteLength,
      output_size: optimizedBytes.byteLength,
      output_type: optimizedType,
      compression_count: compressionCount,
      saved_bytes: Math.max(0, bytes.byteLength - optimizedBytes.byteLength),
      saved_percent: bytes.byteLength ? Math.max(0, Math.round((1 - optimizedBytes.byteLength / bytes.byteLength) * 100)) : 0,
    });
  } catch (error) {
    return json(req, { ok: false, message: error instanceof Error ? error.message : String(error) }, 400);
  }
});
