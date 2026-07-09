(function () {
  "use strict";

  var config = window.COMPUTRAX_CONFIG || {};
  var currency = "EUR";
  var trackingInstalled = false;

  function hasAnalyticsConsent() {
    return typeof window.ctraxHasAnalyticsConsent === "function" && window.ctraxHasAnalyticsConsent();
  }

  function clean(value) {
    return String(value == null ? "" : value).trim();
  }

  function number(value) {
    var n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function getConfig() {
    return {
      gtmId: clean(config.GOOGLE_TAG_MANAGER_ID || config.googleTagManagerId || config.gtmId),
      ga4Id: clean(config.GA4_MEASUREMENT_ID || config.googleAnalyticsId || config.ga4Id || config.measurementId)
    };
  }

  function injectScript(src) {
    if (!src || document.querySelector('script[src="' + src + '"]')) return;
    var script = document.createElement("script");
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }

  function installGoogleTracking() {
    if (!hasAnalyticsConsent() || trackingInstalled) return;
    trackingInstalled = true;
    var ids = getConfig();
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };

    if (ids.gtmId) {
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      injectScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(ids.gtmId));
    }

    if (ids.ga4Id) {
      injectScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ids.ga4Id));
      window.gtag("js", new Date());
      window.gtag("config", ids.ga4Id, { send_page_view: true });
    }
  }

  function itemFromProduct(product, index) {
    if (!product) return null;
    return {
      item_id: clean(product.id || product.sku || product.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      item_name: clean(product.name),
      item_brand: "Computrax",
      item_category: clean(product.cat || product.category || "repasovane-pc"),
      price: number(product.price),
      quantity: number(product.qty || 1) || 1,
      index: index || 0
    };
  }

  function productFromCard(card) {
    if (!card) return null;
    var name = card.getAttribute("data-product-name") || card.getAttribute("data-name") || "";
    var priceText = card.getAttribute("data-price") || card.querySelector(".pc-price, .price, [data-price]")?.textContent || "";
    return {
      id: card.getAttribute("data-id") || name,
      name: name || card.querySelector("h3, .pc-name, .product-title")?.textContent || "",
      price: number(String(priceText).replace(/[^\d.,]/g, "").replace(",", "."))
    };
  }

  function cartItems() {
    try {
      var cart = JSON.parse(localStorage.getItem("ctrax_cart") || "[]");
      return Array.isArray(cart) ? cart.map(itemFromProduct).filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  }

  function track(eventName, params) {
    if (!hasAnalyticsConsent()) return;
    var payload = Object.assign({ event: eventName }, params || {});
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params || {});
    }
  }

  function trackProductList() {
    var products = Array.isArray(window.PRODUCTS_DATA) ? window.PRODUCTS_DATA : [];
    var items = products.map(itemFromProduct).filter(Boolean);
    if (!items.length) {
      items = Array.from(document.querySelectorAll("[data-product-card], .pc-card")).slice(0, 24).map(productFromCard).map(itemFromProduct).filter(Boolean);
    }
    if (items.length) {
      track("view_item_list", {
        currency: currency,
        item_list_name: "Ponuka PC",
        items: items.slice(0, 24)
      });
    }
  }

  function trackCartEvent(eventName) {
    var items = cartItems();
    track(eventName, {
      currency: currency,
      value: items.reduce(function (sum, item) {
        return sum + number(item.price) * number(item.quantity || 1);
      }, 0),
      items: items
    });
  }

  function installEventDelegates() {
    document.addEventListener("click", function (event) {
      var action = event.target.closest("[data-action]")?.getAttribute("data-action") || "";
      var card = event.target.closest("[data-product-card], .pc-card");

      if (/add.*cart|cart.*add|addToCart/i.test(action) || event.target.closest(".add-cart, .add-to-cart")) {
        setTimeout(function () {
          trackCartEvent("add_to_cart");
        }, 80);
      }

      if (/open-cart|go-step/i.test(action) || event.target.closest("#cart-btn, [data-action='open-cart']")) {
        setTimeout(function () {
          trackCartEvent("begin_checkout");
        }, 80);
      }

      if (card && (/detail|select|view/i.test(action) || event.target.closest("button, a"))) {
        var product = itemFromProduct(productFromCard(card));
        if (product) {
          track("select_item", { currency: currency, items: [product] });
        }
      }
    }, true);
  }

  window.ctraxTrack = track;
  window.ctraxTrackCart = trackCartEvent;

  if (hasAnalyticsConsent()) installGoogleTracking();

  window.addEventListener("ctrax:analytics-consent", function (event) {
    if (event.detail && event.detail.analytics) {
      installGoogleTracking();
      trackProductList();
      return;
    }
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "denied", ad_storage: "denied" });
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      installEventDelegates();
      setTimeout(trackProductList, 800);
    });
  } else {
    installEventDelegates();
    setTimeout(trackProductList, 800);
  }
})();
