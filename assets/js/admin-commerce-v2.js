(function () {
  "use strict";
  var config = window.COMPUTRAX_CONFIG || {};
  var base = String(config.SUPABASE_URL || "").replace(/\/$/, "");
  var key = String(config.SUPABASE_ANON_KEY || "");
  var products = new Map();
  var busy = new Set();

  function session() {
    try { return JSON.parse(sessionStorage.getItem("ctrax_admin_auth_session") || "null"); }
    catch (_) { return null; }
  }

  function token() { return session()?.access_token || ""; }

  function request(path, options) {
    var access = token();
    if (!access) return Promise.reject(new Error("Najprv sa prihláste cez Supabase admin účet."));
    options = options || {};
    return fetch(base + path, Object.assign({}, options, { headers: Object.assign({
      apikey: key, Authorization: "Bearer " + access, "Content-Type": "application/json"
    }, options.headers || {}) })).then(async function (response) {
      var text = await response.text();
      var data = text ? JSON.parse(text) : null;
      if (!response.ok) throw new Error(data?.message || data?.error || text || "Operácia zlyhala");
      return data;
    });
  }

  function toast(message, error) {
    var element = document.getElementById("toast");
    var text = document.getElementById("toast-msg");
    if (!element || !text) return;
    text.textContent = message;
    element.classList.toggle("error", Boolean(error));
    element.classList.add("show");
    setTimeout(function () { element.classList.remove("show"); }, 3500);
  }

  function publishable(product) {
    var placeholder = /^(test|test\s*\d+|demo|sample|skúška)$/i.test(String(product.name || "").trim());
    return !placeholder && Number(product.stock || 0) > 0 && Number(product.price || 0) > 0 &&
      Boolean(String(product.sku || product.warehouse_sku || "").trim()) &&
      Boolean(String(product.image_url || "").trim()) && String(product.status || "") === "active";
  }

  async function loadProducts() {
    if (!token()) return;
    var rows = await request("/rest/v1/products?select=id,name,price,stock,status,sku,warehouse_sku,image_url,published&order=id.asc");
    products = new Map((rows || []).map(function (item) { return [Number(item.id), item]; }));
    enhanceProducts();
  }

  async function togglePublished(button) {
    var id = Number(button.dataset.productId || 0);
    var product = products.get(id);
    if (!product || busy.has("p" + id)) return;
    var next = !product.published;
    if (next && !publishable(product)) {
      toast("Produkt nemožno publikovať: potrebuje reálny názov, cenu, sklad, SKU, fotku a aktívny stav.", true);
      return;
    }
    busy.add("p" + id);
    button.disabled = true;
    try {
      await request("/rest/v1/products?id=eq." + id, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ published: next, updated_at: new Date().toISOString() }) });
      product.published = next;
      toast(next ? "Produkt je zverejnený v reálnom sklade." : "Produkt bol skrytý z verejného katalógu.");
      enhanceProducts();
    } catch (error) { toast(error.message, true); }
    finally { busy.delete("p" + id); button.disabled = false; }
  }

  function enhanceProducts() {
    document.querySelectorAll(".pc-admin-card").forEach(function (card) {
      var anchor = card.querySelector('[data-admin-action="openEdit"][data-id]');
      if (!anchor) return;
      var id = Number(anchor.dataset.id);
      var product = products.get(id);
      if (!product) return;
      var button = card.querySelector("[data-ctrax-publish]");
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-sm";
        button.dataset.ctraxPublish = "1";
        button.dataset.productId = String(id);
        button.addEventListener("click", function () { togglePublished(button); });
        card.querySelector(".card-actions")?.prepend(button);
      }
      button.classList.toggle("btn-success", Boolean(product.published));
      button.classList.toggle("btn-primary", !product.published);
      button.textContent = product.published ? "Zverejnené" : "Zverejniť";
      button.title = product.published ? "Skryť produkt z verejného katalógu" : "Zobraziť produkt iba ak spĺňa podmienky reálneho skladu";
    });
  }

  async function generateInvoice(button) {
    var id = Number(button.dataset.orderId || 0);
    var kind = button.dataset.invoiceKind === "credit_note" ? "credit_note" : "invoice";
    var busyKey = "i" + id + kind;
    if (!id || busy.has(busyKey)) return;
    busy.add(busyKey);
    var old = button.textContent;
    button.disabled = true;
    button.textContent = "Vystavujem...";
    try {
      var result = await request("/functions/v1/generate-invoice", { method: "POST", body: JSON.stringify({ order_id: id, kind: kind }) });
      var path = result?.invoice?.pdf_path;
      if (!path) throw new Error("Faktúra nemá PDF súbor.");
      var signed = await request("/storage/v1/object/sign/invoice-documents/" + path.split("/").map(encodeURIComponent).join("/"), {
        method: "POST", body: JSON.stringify({ expiresIn: 120 })
      });
      var href = signed?.signedURL || signed?.signedUrl;
      if (!href) throw new Error("PDF sa nepodarilo sprístupniť.");
      window.open(base + "/storage/v1" + href, "_blank", "noopener");
      var credit = kind === "credit_note";
      button.textContent = result.existing ? (credit ? "Otvoriť dobropis" : "Otvoriť faktúru") : (credit ? "Dobropis vystavený" : "Faktúra vystavená");
      toast(result.existing ? (credit ? "Otvorený už vystavený dobropis." : "Otvorená už vystavená faktúra.") : (credit ? "Dobropis bol vystavený a naviazaný na faktúru." : "Faktúra bola bezpečne vystavená a uložená."));
    } catch (error) {
      button.textContent = old;
      toast(error.message, true);
    } finally { busy.delete(busyKey); button.disabled = false; }
  }

  async function editBillingSnapshot(button) {
    var id = Number(button.dataset.orderId || 0);
    if (!id || busy.has("b" + id)) return;
    busy.add("b" + id);
    button.disabled = true;
    try {
      var invoices = await request("/rest/v1/invoices?select=id,status&order_id=eq." + id + "&kind=eq.invoice&limit=1");
      if (invoices?.[0]?.status === "issued") throw new Error("Vystavená faktúra je nemenná. Oprava sa robí opravným dokladom.");
      if (invoices?.[0]?.status === "draft") throw new Error("Faktúra sa práve generuje. Počkajte alebo skúste znova o päť minút.");
      var rows = await request("/rest/v1/orders?select=id,customer_name,customer_email,address,billing_snapshot&id=eq." + id + "&limit=1");
      var order = rows?.[0];
      if (!order) throw new Error("Objednávka sa nenašla.");
      var current = order.billing_snapshot || {};
      var company = prompt("Firma (prázdne pre súkromnú osobu):", current.company || "");
      if (company === null) return;
      var ico = prompt("IČO:", current.ico || "");
      if (ico === null) return;
      var dic = prompt("DIČ:", current.dic || "");
      if (dic === null) return;
      var icDph = prompt("IČ DPH:", current.ic_dph || "");
      if (icDph === null) return;
      var address = prompt("Fakturačná adresa:", current.address || order.address || "");
      if (address === null) return;
      var clean = function (value, max) { return String(value || "").trim().slice(0, max); };
      var snapshot = {
        company: clean(company, 140), ico: clean(ico, 20), dic: clean(dic, 24), ic_dph: clean(icDph, 24),
        name: clean(current.name || order.customer_name, 120), address: clean(address, 300),
        email: clean(current.email || order.customer_email, 254)
      };
      await request("/rest/v1/orders?id=eq." + id, {
        method: "PATCH", headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ billing_snapshot: snapshot, updated_at: new Date().toISOString() })
      });
      toast("Fakturačné údaje boli uložené pred vystavením dokladu.");
    } catch (error) { toast(error.message, true); }
    finally { busy.delete("b" + id); button.disabled = false; }
  }

  function enhanceOrders() {
    document.querySelectorAll("#orders-grid .order-card").forEach(function (card) {
      var source = card.querySelector('[data-admin-action="copyOrderSummary"][data-id], [data-admin-action="advanceOrderStatus"][data-id]');
      var actions = source?.closest(".order-actions");
      if (!source || !actions) return;
      actions.querySelectorAll('[data-admin-action="downloadOrderInvoiceHtml"], [data-admin-action="copyOrderInvoiceDraft"], [data-admin-action="editOrderInvoiceData"]').forEach(function (item) { item.remove(); });
      if (!actions.querySelector("[data-ctrax-billing]")) {
        var billing = document.createElement("button");
        billing.type = "button";
        billing.className = "btn btn-ghost btn-sm";
        billing.dataset.ctraxBilling = "1";
        billing.dataset.orderId = source.dataset.id;
        billing.textContent = "Fakturačné údaje";
        billing.addEventListener("click", function () { editBillingSnapshot(billing); });
        actions.appendChild(billing);
      }
      if (actions.querySelector("[data-ctrax-invoice]")) return;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-primary btn-sm";
      button.dataset.ctraxInvoice = "1";
      button.dataset.orderId = source.dataset.id;
      button.dataset.invoiceKind = "invoice";
      button.textContent = "Vystaviť PDF faktúru";
      button.addEventListener("click", function () { generateInvoice(button); });
      actions.appendChild(button);
      var credit = document.createElement("button");
      credit.type = "button";
      credit.className = "btn btn-ghost btn-sm";
      credit.dataset.ctraxCreditNote = "1";
      credit.dataset.orderId = source.dataset.id;
      credit.dataset.invoiceKind = "credit_note";
      credit.textContent = "Vystaviť dobropis";
      credit.title = "Vytvorí plný opravný doklad k vystavenej PDF faktúre";
      credit.addEventListener("click", function () {
        if (confirm("Vystaviť plný dobropis k tejto faktúre? Vystavený doklad už nebude možné prepísať.")) generateInvoice(credit);
      });
      actions.appendChild(credit);
    });
  }

  function installInfo() {
    var grid = document.getElementById("pc-grid");
    if (!grid || document.getElementById("ctrax-publication-note")) return;
    var note = document.createElement("div");
    note.id = "ctrax-publication-note";
    note.className = "order-card";
    note.style.gridColumn = "1/-1";
    note.innerHTML = "<div class=\"order-num\">Verejný katalóg: iba reálny sklad</div><div class=\"order-meta\">Produkt sa zobrazí zákazníkom až po ručnom zverejnení. Vyžaduje cenu, sklad, SKU, reálnu fotku a aktívny stav.</div>";
    grid.parentNode.insertBefore(note, grid);
  }

  function installAdminUsers() {
    if (document.getElementById("ctrax-admin-users")) return;
    var host = Array.from(document.querySelectorAll('[data-admin-section~="settings"]')).pop();
    if (!host) return;
    var panel = document.createElement("div");
    panel.id = "ctrax-admin-users";
    panel.className = "order-card";
    panel.style.marginTop = "1rem";
    panel.innerHTML = '<div class="order-num">Admin používatelia</div><div class="order-meta" style="margin:.4rem 0 .8rem">Owner môže pozvať používateľa a nastaviť rolu. Heslá spravuje výhradne Supabase Auth.</div><div style="display:grid;grid-template-columns:minmax(180px,1fr) 150px auto;gap:.6rem"><input class="form-input" id="ctrax-admin-email" type="email" placeholder="email@firma.sk"><select class="form-select" id="ctrax-admin-role"><option value="operator">Operator</option><option value="admin">Admin</option><option value="owner">Owner</option></select><button class="btn btn-primary" id="ctrax-admin-invite" type="button">Pozvať</button></div><div id="ctrax-admin-list" class="order-meta" style="margin-top:.8rem">Načítavam...</div>';
    host.appendChild(panel);
    panel.querySelector("#ctrax-admin-invite").addEventListener("click", async function () {
      var email = panel.querySelector("#ctrax-admin-email").value;
      var role = panel.querySelector("#ctrax-admin-role").value;
      try { await request("/functions/v1/manage-admin-users", { method: "POST", body: JSON.stringify({ action: "invite", email, role }) }); toast("Pozvánka bola odoslaná a rola uložená."); loadAdminUsers(); }
      catch (error) { toast(error.message, true); }
    });
    loadAdminUsers();
  }

  function removeBrowserSecretFields() {
    var keyField = document.getElementById("ctrax-wh-key");
    if (!keyField) return;
    var group = keyField.closest(".form-group");
    if (group) {
      group.innerHTML = '<div class="form-label">API kľúč</div><div class="order-meta">Tajný kľúč sa zadáva iba ako Supabase Edge Function Secret. Admin ho nezobrazuje ani nespracúva.</div>';
    } else keyField.remove();
  }

  async function loadAdminUsers() {
    var target = document.getElementById("ctrax-admin-list");
    if (!target || !token()) return;
    try {
      var result = await request("/functions/v1/manage-admin-users", { method: "POST", body: JSON.stringify({ action: "list" }) });
      target.innerHTML = (result.users || []).map(function (user) { return '<div style="display:flex;justify-content:space-between;gap:1rem;padding:.45rem 0;border-bottom:1px solid var(--border)"><span>' + String(user.email || user.user_id).replace(/[&<>]/g, "") + '</span><strong>' + String(user.role || "operator") + '</strong></div>'; }).join("") || "Žiadni admin používatelia";
    } catch (error) { target.textContent = error.message; }
  }

  function emailStatusLabel(status) {
    return status === "sent" ? "Odoslaný" : status === "skipped" ? "Neposlaný - chýba konfigurácia" : "Zlyhal";
  }

  async function retryEmailAttempt(button) {
    var orderNumber = String(button.dataset.orderNumber || "");
    var status = String(button.dataset.templateKey || "confirmed");
    if (!orderNumber || busy.has("email:" + orderNumber + ":" + status)) return;
    var keyName = "email:" + orderNumber + ":" + status;
    busy.add(keyName);
    button.disabled = true;
    var previous = button.textContent;
    button.textContent = "Odosielam...";
    try {
      await request("/functions/v1/notify-order-status", {
        method: "POST", body: JSON.stringify({ order_number: orderNumber, status: status })
      });
      toast("E-mail bol úspešne odoslaný.");
    } catch (error) { toast(error.message, true); }
    finally {
      busy.delete(keyName);
      button.disabled = false;
      button.textContent = previous;
      await loadEmailAttempts();
    }
  }

  async function loadEmailAttempts() {
    var target = document.getElementById("ctrax-email-attempt-list");
    var panel = document.getElementById("ctrax-email-delivery");
    if (!target || !panel || !token()) return;
    panel.dataset.loaded = "loading";
    target.textContent = "Načítavam históriu doručenia...";
    try {
      var rows = await request("/rest/v1/email_delivery_attempts?select=*&order=attempted_at.desc&limit=50");
      target.replaceChildren();
      (rows || []).forEach(function (attempt) {
        var row = document.createElement("div");
        row.className = "order-card";
        row.style.marginTop = ".6rem";
        var heading = document.createElement("div");
        heading.className = "order-num";
        heading.textContent = emailStatusLabel(attempt.status) + " · " + (attempt.order_number || "Testovací e-mail");
        var meta = document.createElement("div");
        meta.className = "order-meta";
        meta.textContent = [attempt.recipient, attempt.template_key, attempt.attempted_at ? new Date(attempt.attempted_at).toLocaleString("sk-SK") : ""].filter(Boolean).join(" · ");
        row.append(heading, meta);
        if (attempt.provider_message) {
          var message = document.createElement("div");
          message.className = "order-meta";
          message.style.marginTop = ".35rem";
          message.textContent = String(attempt.provider_message).slice(0, 500);
          row.appendChild(message);
        }
        if (attempt.status !== "sent" && attempt.order_number) {
          var retry = document.createElement("button");
          retry.type = "button";
          retry.className = "btn btn-primary btn-sm";
          retry.style.marginTop = ".55rem";
          retry.textContent = "Zopakovať odoslanie";
          retry.dataset.orderNumber = attempt.order_number;
          retry.dataset.templateKey = attempt.template_key;
          retry.addEventListener("click", function () { retryEmailAttempt(retry); });
          row.appendChild(retry);
        }
        target.appendChild(row);
      });
      if (!rows?.length) target.textContent = "Zatiaľ nebol zaznamenaný žiadny pokus o objednávkový e-mail.";
      panel.dataset.loaded = "true";
    } catch (error) {
      target.textContent = error.message;
      panel.dataset.loaded = "error";
    }
  }

  function installEmailDeliveryPanel() {
    if (document.getElementById("ctrax-email-delivery")) return;
    var host = Array.from(document.querySelectorAll('[data-admin-section~="emails"]')).pop();
    if (!host) return;
    var panel = document.createElement("div");
    panel.id = "ctrax-email-delivery";
    panel.className = "order-card";
    panel.style.marginTop = "1rem";
    var title = document.createElement("div");
    title.className = "order-num";
    title.textContent = "Doručenie objednávkových e-mailov";
    var description = document.createElement("div");
    description.className = "order-meta";
    description.textContent = "Posledných 50 pokusov. Zlyhaný alebo neposlaný e-mail môžete zopakovať po oprave konfigurácie.";
    var refresh = document.createElement("button");
    refresh.type = "button";
    refresh.className = "btn btn-ghost btn-sm";
    refresh.style.marginTop = ".65rem";
    refresh.textContent = "Obnoviť históriu";
    refresh.addEventListener("click", loadEmailAttempts);
    var list = document.createElement("div");
    list.id = "ctrax-email-attempt-list";
    list.className = "order-meta";
    list.style.marginTop = ".6rem";
    list.textContent = token() ? "Načítavam..." : "Prihláste sa cez Supabase admin účet.";
    panel.append(title, description, refresh, list);
    host.appendChild(panel);
    if (token()) loadEmailAttempts();
  }

  function start() {
    installInfo();
    installAdminUsers();
    installEmailDeliveryPanel();
    removeBrowserSecretFields();
    document.querySelectorAll('[data-admin-action="downloadVisibleInvoicesHtml"]').forEach(function (item) { item.remove(); });
    loadProducts().catch(function () {});
    enhanceOrders();
    var observer = new MutationObserver(function () {
      enhanceProducts(); enhanceOrders(); removeBrowserSecretFields(); installEmailDeliveryPanel();
      var emailPanel = document.getElementById("ctrax-email-delivery");
      if (token() && emailPanel && emailPanel.dataset.loaded !== "true" && emailPanel.dataset.loaded !== "loading") loadEmailAttempts();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("storage", loadProducts);
    window.addEventListener("computrax:warehouse-synced", function () {
      loadProducts().catch(function () {});
      if (typeof loadWarehouses === "function") loadWarehouses(true);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
