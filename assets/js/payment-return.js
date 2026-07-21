(function () {
  "use strict";

  var nativeFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    var response = await nativeFetch(input, init);
    var url = typeof input === "string" ? input : String(input && input.url || "");
    if (/\/functions\/v1\/gopay-create-payment\/?(?:[?#]|$)/.test(url) && init && init.body) {
      try {
        var request = JSON.parse(String(init.body));
        var result = await response.clone().json();
        if (response.ok && result.redirect_url) {
          sessionStorage.setItem("ctrax_gopay_return", JSON.stringify({
            order_number: String(request.order_number || ""),
            email: String(request.customer_email || ""),
            created_at: Date.now()
          }));
        }
      } catch (_) {}
    }
    return response;
  };

  var query = new URLSearchParams(window.location.search);
  var paymentId = String(query.get("id") || "");
  var orderNumber = String(query.get("order") || "").toUpperCase();
  if (!/^\d{1,30}$/.test(paymentId) || !/^CTX-[0-9]{8}-[A-Z0-9]{5}$/.test(orderNumber)) return;

  function readReturnContext() {
    try {
      var value = JSON.parse(sessionStorage.getItem("ctrax_gopay_return") || "null");
      if (!value || value.order_number !== orderNumber || Date.now() - Number(value.created_at || 0) > 7200000) return null;
      return value;
    } catch (_) {
      return null;
    }
  }

  function panel() {
    var box = document.createElement("section");
    box.id = "ctrax-payment-result";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
    box.innerHTML = '<div class="ctrax-payment-result-inner"><span class="ctrax-payment-icon" aria-hidden="true">...</span><div><strong>Overujeme platbu</strong><p>Čakajte chvíľu, stav zisťujeme priamo v GoPay.</p></div></div>';
    var header = document.querySelector("header, nav");
    (header && header.parentNode ? header.parentNode : document.body).insertBefore(box, header ? header.nextSibling : document.body.firstChild);
    return box;
  }

  function show(box, kind, title, message) {
    box.className = "ctrax-payment-result " + kind;
    box.querySelector(".ctrax-payment-icon").textContent = kind === "paid" ? "OK" : kind === "failed" ? "!" : "...";
    box.querySelector("strong").textContent = title;
    box.querySelector("p").textContent = message;
  }

  async function jsonFetch(url, init) {
    var response = await nativeFetch(url, init);
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(data.message || "request_failed");
    return data;
  }

  async function verify() {
    var box = panel();
    var context = readReturnContext();
    var config = window.COMPUTRAX_CONFIG || {};
    var base = String(config.SUPABASE_URL || "").replace(/\/$/, "");
    var key = String(config.SUPABASE_ANON_KEY || "");
    if (!base || !key || !context || String(context.email || "").length < 5) {
      show(box, "pending", "Platbu overujeme", "Objednávka " + orderNumber + " je uložená. Potvrdenie vám pošleme e-mailom.");
      return;
    }

    try {
      await jsonFetch(base + "/functions/v1/gopay-notify?id=" + encodeURIComponent(paymentId));
      var order = await jsonFetch(base + "/functions/v1/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: key, Authorization: "Bearer " + key },
        body: JSON.stringify({ order_number: orderNumber, email: context.email })
      });
      if (order.payment_status === "paid") {
        show(box, "paid", "Platba bola úspešná", "Ďakujeme. Objednávku " + orderNumber + " sme prijali a pripravujeme ju.");
        sessionStorage.removeItem("ctrax_gopay_return");
        if (window.ctraxTrack) window.ctraxTrack("purchase", { transaction_id: orderNumber, currency: "EUR", value: Number(order.total || 0), payment_type: "gopay" });
      } else if (["failed", "refunded"].indexOf(order.payment_status) !== -1) {
        show(box, "failed", "Platba nebola dokončená", "Objednávka ostáva evidovaná. Kontaktujte nás a pošleme vám bezpečný nový platobný odkaz.");
      } else {
        show(box, "pending", "Platba čaká na potvrdenie", "GoPay platbu ešte spracúva. Stav objednávky obnovíme automaticky.");
      }
    } catch (_) {
      show(box, "pending", "Platbu ešte overujeme", "Objednávka " + orderNumber + " je uložená. Potvrdenie vám pošleme e-mailom.");
    } finally {
      history.replaceState(null, document.title, location.pathname + "?order=" + encodeURIComponent(orderNumber));
    }
  }

  var style = document.createElement("style");
  style.textContent = ".ctrax-payment-result{position:relative;z-index:35;margin:12px auto;width:min(1180px,calc(100% - 24px));border:1px solid #bfdbfe;background:#eff6ff;color:#172033;border-radius:8px}.ctrax-payment-result-inner{display:flex;align-items:center;gap:14px;padding:16px 18px}.ctrax-payment-result strong{display:block;font-size:1.05rem}.ctrax-payment-result p{margin:3px 0 0;color:#475569}.ctrax-payment-icon{display:grid;place-items:center;flex:0 0 42px;height:42px;border-radius:50%;background:#2563eb;color:#fff;font-weight:900}.ctrax-payment-result.paid{border-color:#86efac;background:#f0fdf4}.ctrax-payment-result.paid .ctrax-payment-icon{background:#15803d}.ctrax-payment-result.failed{border-color:#fca5a5;background:#fef2f2}.ctrax-payment-result.failed .ctrax-payment-icon{background:#b91c1c}@media(max-width:600px){.ctrax-payment-result-inner{align-items:flex-start;padding:14px}.ctrax-payment-result p{font-size:.9rem}}";
  document.head.appendChild(style);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", verify, { once: true });
  else verify();
})();
