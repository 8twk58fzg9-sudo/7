(function () {
  "use strict";

  var config = window.COMPUTRAX_CONFIG || {};
  var base = String(config.SUPABASE_URL || "").replace(/\/$/, "");
  var key = String(config.SUPABASE_ANON_KEY || "");
  var liveNames = new Set();
  var liveProducts = [];
  var loaded = false;
  var enforceFrame = 0;
  var loadingStyle = document.createElement("style");
  loadingStyle.id = "ctrax-live-catalog-loading-style";
  loadingStyle.textContent = "body:not(.ctrax-live-catalog-ready) #products-grid [data-product-card],body:not(.ctrax-live-catalog-ready) #advisor-result .advisor-match{visibility:hidden!important}";
  document.head.appendChild(loadingStyle);

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function cardName(card) {
    return clean(card.getAttribute("data-product-name") || card.getAttribute("data-name") ||
      card.querySelector(".advisor-match-head strong, h3, strong")?.textContent);
  }

  function setVisible(card, visible) {
    card.hidden = !visible;
    card.setAttribute("aria-hidden", String(!visible));
    card.toggleAttribute("data-ctrax-live-hidden", !visible);
  }

  function removeUnavailableCartItems() {
    var names = Array.from(document.querySelectorAll('#cart-items [data-action="cart-remove"][data-name]'))
      .map(function (button) { return button.dataset.name; })
      .filter(function (name) { return name && !liveNames.has(clean(name)); });
    if (typeof window.removeFromCart === "function") {
      names.forEach(function (name) { window.removeFromCart(name); });
    }
    try {
      var stored = JSON.parse(localStorage.getItem("ctrax_cart") || "[]");
      if (Array.isArray(stored)) {
        var available = stored.filter(function (item) {
          return liveNames.has(clean(typeof item === "string" ? item : item && item.name));
        });
        if (available.length !== stored.length) localStorage.setItem("ctrax_cart", JSON.stringify(available));
      }
    } catch (_) {
      localStorage.removeItem("ctrax_cart");
    }
  }

  function updateStatus(visibleCount) {
    var status = document.querySelector("#products-live-status span:last-child");
    if (status) {
      status.textContent = visibleCount
        ? "Aktuálny sklad · " + visibleCount + (visibleCount === 1 ? " dostupný počítač" : " dostupné počítače")
        : "Aktuálny sklad · nové počítače pripravujeme";
    }
    document.body.classList.toggle("ctrax-live-catalog-empty", visibleCount === 0);
  }

  function enforce() {
    if (!loaded) return;
    document.querySelectorAll("[data-product-card], .top-pick-card").forEach(function (card) {
      setVisible(card, liveNames.has(cardName(card)));
    });

    document.querySelectorAll("#advisor-result .advisor-match, #advisor-result .advisor-result-card, #advisor-result article").forEach(function (card) {
      setVisible(card, liveNames.has(cardName(card)));
    });

    var advisor = document.getElementById("advisor-result");
    if (advisor) {
      var matches = Array.from(advisor.querySelectorAll(".advisor-match, .advisor-result-card, article"));
      if (matches.length && !matches.some(function (card) { return !card.hidden; })) {
        advisor.innerHTML = '<div class="advisor-empty"><strong>Momentálne nemáme vhodný skladový PC.</strong><p>Poradca zobrazuje iba reálne dostupné a zverejnené kusy. Skúste výber znovu po naskladnení alebo si nastavte upozornenie.</p><button type="button" class="add-cart-btn" data-product-alert="1" data-product-name="vhodný skladový PC">Upozorniť ma</button></div>';
      }
    }

    var grid = document.getElementById("products-grid");
    if (!grid) return;
    var visibleCount = Array.from(grid.querySelectorAll("[data-product-card]")).filter(function (card) {
      return !card.hidden;
    }).length;
    var empty = document.getElementById("ctrax-live-empty");
    if (!visibleCount && !empty) {
      empty = document.createElement("div");
      empty.id = "ctrax-live-empty";
      empty.className = "ctrax-live-empty";
      empty.innerHTML = "<strong>Nové skladové počítače práve pripravujeme.</strong><span>V ponuke zobrazujeme iba reálne dostupné kusy. Zanechajte kontakt a dáme vám vedieť po naskladnení.</span><button type=\"button\" data-product-alert=\"1\" data-product-name=\"nové skladové PC\">Upozorniť ma na nové PC</button>";
      grid.appendChild(empty);
    } else if (empty) {
      empty.hidden = visibleCount > 0;
    }
    var count = document.getElementById("results-count");
    if (count) count.textContent = String(visibleCount);
    updateStatus(visibleCount);
    removeUnavailableCartItems();
  }

  function scheduleEnforce() {
    if (!loaded || enforceFrame) return;
    enforceFrame = requestAnimationFrame(function () {
      enforceFrame = 0;
      enforce();
    });
  }

  async function load() {
    if (!base || !key) {
      loaded = true;
      enforce();
      document.body.classList.add("ctrax-live-catalog-ready");
      return;
    }
    try {
      var response = await fetch(base + "/rest/v1/storefront_products?select=*&order=id.asc", {
        cache: "no-store",
        headers: { apikey: key, Authorization: "Bearer " + key }
      });
      if (!response.ok) throw new Error("catalog " + response.status);
      var rows = await response.json();
      liveProducts = (Array.isArray(rows) ? rows : []).filter(function (row) {
        return Number(row.stock || 0) > 0;
      });
      liveNames = new Set(liveProducts.map(function (row) { return clean(row.name); }));
    } catch (error) {
      console.warn("Live catalog unavailable", error);
      liveNames = new Set();
      liveProducts = [];
    }
    loaded = true;
    window.ComputraxLiveCatalog = Object.freeze({
      names: Array.from(liveNames),
      products: liveProducts.map(function (product) { return Object.freeze(product); })
    });
    enforce();
    document.body.classList.add("ctrax-live-catalog-ready");
    [250, 1000, 3000, 6000].forEach(function (delay) {
      window.setTimeout(enforce, delay);
    });
    [document.getElementById("products-grid"), document.getElementById("advisor-result")]
      .filter(Boolean)
      .forEach(function (root) {
        new MutationObserver(scheduleEnforce).observe(root, { childList: true, subtree: true });
      });
  }

  document.addEventListener("click", function (event) {
    if (!loaded) return;
    var action = event.target.closest('[data-action="add-cart"], [data-action="open-detail"]');
    if (!action) return;
    var name = clean(action.dataset.name || action.closest("[data-product-card]")?.dataset.productName);
    if (!name || liveNames.has(name)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    document.getElementById("ctrax-live-empty")?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (typeof window.showToast === "function") window.showToast("Tento počítač už nie je v aktuálnom sklade.");
  }, true);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", load);
  else load();
})();
