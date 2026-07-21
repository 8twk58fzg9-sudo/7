(function () {
  "use strict";

  var placeholderName = /^(?:test|test\s*\d+|demo|demo\s*\d+|sample|sk[uú][šs]ka|do\s+not\s+publish)$/i;

  function itemName(item) {
    return typeof item === "string" ? item : item && (item.name || item.product_name) || "";
  }

  function cleanStoredList(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return;
      var list = JSON.parse(raw);
      if (!Array.isArray(list)) return;
      var clean = list.filter(function (item) {
        return !placeholderName.test(String(itemName(item)).replace(/\s+/g, " ").trim());
      });
      if (clean.length !== list.length) localStorage.setItem(key, JSON.stringify(clean));
    } catch (error) {
      localStorage.removeItem(key);
    }
  }

  cleanStoredList("ctrax_cart");
  cleanStoredList("ctrax_wish");
  cleanStoredList("ctrax_recent_products");

  try {
    var configuredSiteUrl = String(window.COMPUTRAX_CONFIG && window.COMPUTRAX_CONFIG.PUBLIC_SITE_URL || "").trim();
    var parsedSiteUrl = new URL(configuredSiteUrl);
    if (parsedSiteUrl.protocol === "https:" && parsedSiteUrl.hostname === "computrax.sk") {
      localStorage.setItem("ctrax_public_site_url", "https://computrax.sk");
    }
  } catch (error) {
    // Keep the existing value when no valid public domain is configured.
  }

  var nativeFetch = window.fetch && window.fetch.bind(window);
  if (nativeFetch) {
    window.fetch = async function (input, init) {
      var response = await nativeFetch(input, init);
      var url = typeof input === "string" ? input : input && input.url || "";
      var method = String(init && init.method || "GET").toUpperCase();
      if (method !== "GET" || !url.includes("/rest/v1/products?") || !response.ok) return response;
      try {
        var rows = await response.clone().json();
        if (!Array.isArray(rows)) return response;
        var cleanRows = rows.filter(function (item) {
          return !placeholderName.test(String(itemName(item)).replace(/\s+/g, " ").trim());
        });
        if (cleanRows.length === rows.length) return response;
        var headers = new Headers(response.headers);
        headers.delete("content-length");
        return new Response(JSON.stringify(cleanRows), {
          status: response.status,
          statusText: response.statusText,
          headers: headers
        });
      } catch (error) {
        return response;
      }
    };
  }
})();
