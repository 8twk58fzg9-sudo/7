(function () {
  "use strict";
  var selected = null;
  function config() { return window.COMPUTRAX_CONFIG || {}; }
  function endpoint() { return String(config().SUPABASE_URL || "").replace(/\/$/, "") + "/functions/v1/subscribe-product-alert"; }
  function productByName(name) {
    var list = Array.isArray(window.allProducts) && window.allProducts.length ? window.allProducts : (window.PRODUCTS_DATA || []);
    var wanted = String(name || "").trim().toLowerCase();
    return list.find(function (product) { return String(product.name || "").trim().toLowerCase() === wanted; });
  }
  function enhanceCards() {
    document.querySelectorAll("[data-product-card]").forEach(function (card) {
      var button = card.querySelector("[data-ctrax-inquiry-product]");
      var name = card.dataset.productName || button?.dataset.ctraxInquiryProduct || "";
      var product = productByName(name);
      if (!button || !product?.id) return;
      button.dataset.productAlert = "1";
      button.dataset.productId = String(product.id);
      button.dataset.productName = product.name;
      button.textContent = "Upozorniť ma";
      button.setAttribute("aria-label", "Upozorniť na dostupnosť " + product.name);
      button.removeAttribute("style");
    });
  }
  function ensureModal() {
    if (document.getElementById("product-alert-dialog")) return;
    document.body.insertAdjacentHTML("beforeend", '<dialog id="product-alert-dialog" class="product-alert-dialog" aria-labelledby="product-alert-title"><form method="dialog" class="product-alert-box"><button class="product-alert-close" value="cancel" aria-label="Zavrieť">×</button><p class="product-alert-eyebrow">Upozornenie na sklad</p><h2 id="product-alert-title">Dáme vám vedieť</h2><p id="product-alert-copy"></p><label for="product-alert-email">E-mail</label><input id="product-alert-email" type="email" autocomplete="email" required placeholder="vas@email.sk"><p id="product-alert-status" role="status" aria-live="polite"></p><button id="product-alert-submit" class="btn-primary" type="submit">Upozorniť ma</button><small>E-mail použijeme iba na upozornenie k tomuto produktu.</small></form></dialog>');
  }
  function open(product) {
    ensureModal(); selected = product;
    document.getElementById("product-alert-copy").textContent = "Keď bude " + product.name + " opäť dostupný, pošleme vám krátky e-mail.";
    document.getElementById("product-alert-status").textContent = "";
    document.getElementById("product-alert-dialog").showModal();
    document.getElementById("product-alert-email").focus();
  }
  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-product-alert]");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open({ id: Number(button.dataset.productId), name: button.dataset.productName || "tento počítač" });
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", enhanceCards, { once: true });
  else enhanceCards();
  [300, 900, 2000, 4000].forEach(function (delay) { setTimeout(enhanceCards, delay); });
  document.addEventListener("submit", async function (event) {
    if (event.target.closest("#product-alert-dialog") === null) return;
    event.preventDefault();
    var email = document.getElementById("product-alert-email"), status = document.getElementById("product-alert-status"), submit = document.getElementById("product-alert-submit");
    if (!email.reportValidity() || !selected) return;
    submit.disabled = true; status.textContent = "Ukladám upozornenie...";
    try {
      var response = await fetch(endpoint(), { method: "POST", headers: { "Content-Type": "application/json", apikey: config().SUPABASE_ANON_KEY || "" }, body: JSON.stringify({ product_id: selected.id, email: email.value }) });
      var data = await response.json();
      if (!response.ok) throw new Error(data.message || "Odoslanie zlyhalo.");
      status.textContent = "Hotovo. Ozveme sa, keď bude produkt dostupný."; email.value = "";
      setTimeout(function () { document.getElementById("product-alert-dialog").close(); }, 1600);
    } catch (error) { status.textContent = error.message || "Odoslanie zlyhalo."; }
    finally { submit.disabled = false; }
  });
  window.ComputraxProductAlerts = { open: open };
})();
