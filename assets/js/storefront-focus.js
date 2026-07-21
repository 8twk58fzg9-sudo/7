(function () {
  "use strict";

  var redundantIds = new Set([
    "ctrax-revenue-studio",
    "ctrax-trust-strip",
    "ctrax-shop-safe-band",
    "ctrax-seo-landing",
    "ctrax-marketplace-assist",
    "ctrax-premium-strip",
    "ctrax-buying-guide",
    "ctrax-seo-faq"
  ]);

  function prioritizeCatalog() {
    var catalog = document.getElementById("ponuka");
    var advisor = document.getElementById("poradca");
    if (!catalog || !advisor || !advisor.parentNode || catalog.parentNode !== advisor.parentNode) return;
    var siblings = Array.from(advisor.parentNode.children);
    if (siblings.indexOf(catalog) < siblings.indexOf(advisor)) return;
    advisor.parentNode.insertBefore(catalog, advisor);
    catalog.dataset.ctraxPrioritized = "true";
  }

  function enforcePrimaryHeroCopy() {
    var title = document.getElementById("hero-title");
    var description = document.getElementById("hero-text");
    if (title && title.textContent.trim() !== "Vyber si svoj ďalší PC.") {
      title.innerHTML = 'Vyber si svoj ďalší <span>PC.</span>';
    }
    if (description && description.textContent.trim() !== "Herné a repasované PC — otestované, so zárukou a jasnou cenou.") {
      description.textContent = "Herné a repasované PC — otestované, so zárukou a jasnou cenou.";
    }
  }

  function installReliableSearchClear() {
    var input = document.getElementById("nav-search-input");
    if (!input || input.dataset.ctraxReliableClear === "true") return;
    input.dataset.ctraxReliableClear = "true";
    input.addEventListener("input", function () {
      if (input.value.trim()) return;
      [0, 120, 500, 1100].forEach(function (delay) {
        setTimeout(function () {
          if (input.value.trim()) return;
          input.value = "";
          if (typeof window.searchProducts === "function") window.searchProducts("");
        }, delay);
      });
    }, true);
    input.addEventListener("search", function () {
      if (!input.value.trim() && typeof window.searchProducts === "function") window.searchProducts("");
    }, true);
  }

  function alignInquiryOnlyCards(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll(".pc-card").forEach(function (card) {
      var unavailableButton = card.querySelector(".add-cart-btn[disabled]");
      if (!unavailableButton || card.dataset.ctraxInquiryAligned === "true") return;

      var stockBadge = card.querySelector(".stock-badge");
      if (stockBadge) stockBadge.innerHTML = '<span class="stock-dot"></span> Dostupnosť na overenie';

      unavailableButton.textContent = "Momentálne nedostupné";
      var secondary = card.querySelector(".pc-cta-secondary");
      if (secondary) {
        var links = secondary.querySelectorAll("a");
        if (links[0]) {
          links[0].textContent = "Overiť dostupnosť";
          links[0].setAttribute("aria-label", "Overiť dostupnosť " + (card.dataset.productName || "počítača"));
        }
        if (links[1]) links[1].remove();
      }

      card.querySelectorAll(".g-item").forEach(function (item) {
        if (item.textContent.includes("Otestovaný")) item.textContent = "✅ Test pred odoslaním";
      });
      card.dataset.ctraxInquiryAligned = "true";
    });
  }

  function removeRedundantSections(root) {
    var scope = root && root.querySelectorAll ? root : document;
    redundantIds.forEach(function (id) {
      var element = document.getElementById(id);
      if (element) element.remove();
    });
    prioritizeCatalog();
    enforcePrimaryHeroCopy();
    installReliableSearchClear();
    alignInquiryOnlyCards(scope);
    scope.querySelectorAll("[data-ctrax-redundant]").forEach(function (element) {
      element.remove();
    });
  }

  var style = document.createElement("style");
  style.textContent = Array.from(redundantIds).map(function (id) {
    return "#" + id;
  }).join(",") + "{display:none!important}" +
    "@media(max-width:700px){" +
      ".hero{padding-top:108px!important;padding-bottom:22px!important}" +
      ".hero-stock-card{display:none!important}" +
      ".hero-showcase,.hero-showcase-inner,.hero-visual{height:auto!important;min-height:0!important}" +
      ".buy-confidence-strip{display:none!important}" +
      "#ponuka .filter-group{display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;gap:8px!important;padding-bottom:4px!important;scrollbar-width:none}" +
      "#ponuka .filter-group::-webkit-scrollbar{display:none}" +
      "#ponuka .filter-group>*{flex:0 0 auto!important}" +
      "#ponuka .filter-panel>.filter-row:first-child{gap:12px!important}" +
      "#ponuka .products-live-row{gap:8px!important}" +
    "}";
  document.head.appendChild(style);

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (!(node instanceof Element)) return;
        if (redundantIds.has(node.id)) node.remove();
        else removeRedundantSections(node);
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      removeRedundantSections(document);
      prioritizeCatalog();
      enforcePrimaryHeroCopy();
      installReliableSearchClear();
      alignInquiryOnlyCards(document);
    }, { once: true });
  } else {
    removeRedundantSections(document);
    prioritizeCatalog();
    enforcePrimaryHeroCopy();
    installReliableSearchClear();
    alignInquiryOnlyCards(document);
  }
  window.addEventListener("load", function () {
    removeRedundantSections(document);
    prioritizeCatalog();
    enforcePrimaryHeroCopy();
    installReliableSearchClear();
    alignInquiryOnlyCards(document);
    if ("serviceWorker" in navigator && location.protocol === "https:") {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    }
  }, { once: true });
})();
