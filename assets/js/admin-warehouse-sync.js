(function () {
  "use strict";

  var syncing = new Set();
  var healthCache = null;
  var healthCachedAt = 0;

  function endpoint() {
    var config = window.COMPUTRAX_CONFIG || {};
    return String(config.WAREHOUSE_SYNC_ENDPOINT || "").trim();
  }

  function adminToken() {
    try {
      var raw = sessionStorage.getItem("ctrax_admin_auth_session") ||
        localStorage.getItem("ctrax_admin_auth_session");
      var session = JSON.parse(raw || "null");
      return String(session && session.access_token || "");
    } catch (error) {
      return "";
    }
  }

  function showSyncStatus(card, message, isError) {
    var status = card.querySelector("[data-warehouse-sync-status]");
    if (!status) {
      status = document.createElement("div");
      status.dataset.warehouseSyncStatus = "1";
      status.setAttribute("role", "status");
      status.style.cssText = "margin-top:.65rem;font-size:.78rem;line-height:1.45;color:var(--muted)";
      card.appendChild(status);
    }
    status.textContent = message;
    status.style.color = isError ? "#f87171" : "var(--muted)";
  }

  function warehouseCode(card) {
    return String(card.querySelector(".warehouse-code")?.textContent || "")
      .toUpperCase().replace(/[^A-Z0-9_]/g, "_").slice(0, 24);
  }

  async function loadHealth(force) {
    if (!force && healthCache && Date.now() - healthCachedAt < 30000) return healthCache;
    var url = endpoint();
    var token = adminToken();
    if (!url || !token) return null;
    var response = await fetch(url, {
      headers: {
        apikey: String((window.COMPUTRAX_CONFIG || {}).SUPABASE_ANON_KEY || ""),
        Authorization: "Bearer " + token
      }
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Kontrola skladu zlyhala");
    healthCache = data;
    healthCachedAt = Date.now();
    return data;
  }

  async function showConfiguration(card) {
    if (card.dataset.warehouseConfigurationChecked) return;
    card.dataset.warehouseConfigurationChecked = "1";
    var code = warehouseCode(card);
    var prefix = "WAREHOUSE_" + code;
    showSyncStatus(card, "Secrets pre tento sklad: " + prefix + "_API_URL a " + prefix + "_API_KEY.", false);
    try {
      var health = await loadHealth(false);
      if (!health) return;
      var row = (health.warehouses || []).find(function (item) { return String(item.code || "") === code; });
      if (row) showSyncStatus(card, row.configured
        ? "API konfigurácia je pripravená. Najprv použite Otestovať API."
        : "Chýbajú secrets " + row.secret_prefix + "_API_URL alebo " + row.secret_prefix + "_API_KEY.", !row.configured);
    } catch (error) {
      showSyncStatus(card, "Stav API sa nepodarilo načítať: " + (error.message || String(error)), true);
    }
  }

  function installSyncButtons() {
    document.querySelectorAll(".warehouse-card").forEach(function (card) {
      if (card.querySelector("[data-warehouse-sync]")) return;
      var isApiWarehouse = Array.from(card.querySelectorAll(".order-meta")).some(function (item) {
        return item.textContent.includes("Externé API");
      });
      if (!isApiWarehouse) return;
      var editButton = card.querySelector('[data-admin-action="editWarehouse"][data-id]');
      var actions = card.querySelector(".order-actions");
      if (!editButton || !actions) return;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-primary btn-sm";
      button.dataset.warehouseSync = editButton.dataset.id;
      button.dataset.warehouseSyncMode = "update_stock";
      button.textContent = "Aktualizovať zásoby";
      var preview = document.createElement("button");
      preview.type = "button";
      preview.className = "btn btn-ghost btn-sm";
      preview.dataset.warehouseSync = editButton.dataset.id;
      preview.dataset.warehouseSyncMode = "preview";
      preview.textContent = "Otestovať API";
      actions.prepend(button);
      actions.prepend(preview);
      showConfiguration(card);
    });
  }

  async function syncWarehouse(button) {
    var warehouseId = Number(button.dataset.warehouseSync || 0);
    var mode = button.dataset.warehouseSyncMode === "preview" ? "preview" : "update_stock";
    var card = button.closest(".warehouse-card");
    if (!warehouseId || !card || syncing.has(warehouseId)) return;
    var url = endpoint();
    var token = adminToken();
    if (!url) return showSyncStatus(card, "Chýba verejná adresa WAREHOUSE_SYNC_ENDPOINT v config.js.", true);
    if (!token) return showSyncStatus(card, "Najprv sa prihláste do adminu cez Supabase.", true);
    if (mode === "update_stock" && !window.confirm("Aktualizovať množstvá z externého skladu? Neznáme SKU sa preskočia a existujúce zásoby sa zmenia.")) return;

    syncing.add(warehouseId);
    button.disabled = true;
    button.textContent = mode === "preview" ? "Testujem..." : "Synchronizujem...";
    showSyncStatus(card, mode === "preview" ? "Testujem spojenie a porovnávam SKU bez zmeny zásob..." : "Pripájam externý sklad a aktualizujem zásoby...", false);
    try {
      var response = await fetch(url, {
        method: "POST",
        headers: {
          apikey: String((window.COMPUTRAX_CONFIG || {}).SUPABASE_ANON_KEY || ""),
          Authorization: "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ warehouse_id: warehouseId, mode: mode, replace_missing: false })
      });
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Synchronizácia zlyhala");
      var message = mode === "preview" ? "Test úspešný: " : "Aktualizácia hotová: ";
      message += Number(data.received || 0) + " položiek prijatých, " + Number(data.matched || 0) + " zhodných SKU";
      if (Array.isArray(data.unmatched) && data.unmatched.length) message += ", " + data.unmatched.length + " neznámych SKU";
      showSyncStatus(card, message + ".", false);
      if (mode === "update_stock") {
        window.dispatchEvent(new CustomEvent("computrax:warehouse-synced", {
          detail: { warehouseId: warehouseId }
        }));
      }
    } catch (error) {
      showSyncStatus(card, "Synchronizácia zlyhala: " + (error.message || String(error)), true);
    } finally {
      syncing.delete(warehouseId);
      button.disabled = false;
      button.textContent = mode === "preview" ? "Otestovať API" : "Aktualizovať zásoby";
    }
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-warehouse-sync]");
    if (button) {
      event.preventDefault();
      event.stopPropagation();
      syncWarehouse(button);
    }
  }, true);

  var observer = new MutationObserver(installSyncButtons);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installSyncButtons);
  else installSyncButtons();
})();
