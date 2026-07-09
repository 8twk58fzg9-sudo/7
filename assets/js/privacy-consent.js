(function () {
  "use strict";

  var storageKey = "ctrax_privacy_consent_v1";
  var isAdmin = /admin_2\.html(?:$|[?#])/i.test(location.pathname);

  function readConsent() {
    try {
      var raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed.analytics === "boolean" ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function hasAnalyticsConsent() {
    return Boolean(readConsent() && readConsent().analytics === true);
  }

  function deleteAnalyticsCookies() {
    document.cookie.split(";").forEach(function (entry) {
      var name = entry.split("=")[0].trim();
      if (!/^_(ga|gid|gat)/i.test(name)) return;
      ["/", location.pathname].forEach(function (path) {
        document.cookie = name + "=; Max-Age=0; path=" + path + "; SameSite=Lax";
      });
    });
  }

  function saveConsent(analytics) {
    var consent = { analytics: Boolean(analytics), updatedAt: new Date().toISOString(), version: 1 };
    localStorage.setItem(storageKey, JSON.stringify(consent));
    if (consent.analytics) loadClarity();
    else deleteAnalyticsCookies();
    window.dispatchEvent(new CustomEvent("ctrax:analytics-consent", { detail: consent }));
    return consent;
  }

  function loadClarity() {
    var config = window.COMPUTRAX_CONFIG || {};
    var id = String(config.CLARITY_PROJECT_ID || "").trim();
    if (!id || !/^[a-z0-9]{4,}$/i.test(id) || document.getElementById("ctrax-clarity-loader")) return;
    var script = document.createElement("script");
    script.id = "ctrax-clarity-loader";
    script.async = true;
    script.src = "https://www.clarity.ms/tag/" + encodeURIComponent(id);
    document.head.appendChild(script);
  }

  function ensureStyles() {
    if (document.getElementById("ctrax-privacy-style")) return;
    var style = document.createElement("style");
    style.id = "ctrax-privacy-style";
    style.textContent = ".ctrax-cookie-banner{position:fixed;z-index:10050;left:16px;right:16px;bottom:16px;margin:auto;width:min(680px,calc(100% - 32px));background:#fff;color:#0f172a;border:1px solid #cbd5e1;border-radius:12px;padding:18px;box-shadow:0 20px 60px rgba(15,23,42,.28);font:14px/1.5 Inter,Arial,sans-serif}.ctrax-cookie-banner h2{font-size:18px;margin:0 0 7px}.ctrax-cookie-banner p{margin:0;color:#475569}.ctrax-cookie-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.ctrax-cookie-actions button,.ctrax-cookie-link{min-height:42px;border-radius:8px;padding:10px 14px;font:700 14px/1 Inter,Arial,sans-serif;cursor:pointer}.ctrax-cookie-accept{background:#2563eb;color:#fff;border:1px solid #2563eb}.ctrax-cookie-reject{background:#fff;color:#0f172a;border:1px solid #64748b}.ctrax-cookie-link{display:inline-flex;align-items:center;color:#1d4ed8;text-decoration:underline;background:transparent;border:0;padding-left:0}.ctrax-cookie-settings{margin-left:12px;color:inherit;text-decoration:underline;font:inherit;background:none;border:0;cursor:pointer}@media(max-width:540px){.ctrax-cookie-banner{left:10px;right:10px;width:calc(100% - 20px);bottom:10px}.ctrax-cookie-actions button{flex:1}}";
    document.head.appendChild(style);
  }

  function openBanner(force) {
    if (isAdmin || (!force && readConsent())) return;
    ensureStyles();
    var old = document.getElementById("ctrax-cookie-banner");
    if (old) old.remove();
    var banner = document.createElement("section");
    banner.id = "ctrax-cookie-banner";
    banner.className = "ctrax-cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Nastavenie cookies");
    banner.innerHTML = '<h2>Cookies a analytika</h2><p>Nevyhnutné úložisko používame na fungovanie košíka. Voliteľná analytika nám pomáha zlepšovať web a spúšťa sa len po súhlase.</p><div class="ctrax-cookie-actions"><button type="button" class="ctrax-cookie-reject">Odmietnuť analytiku</button><button type="button" class="ctrax-cookie-accept">Prijať analytiku</button><a class="ctrax-cookie-link" href="pravne.html#cookies">Viac informácií</a></div>';
    document.body.appendChild(banner);
    banner.querySelector(".ctrax-cookie-reject").addEventListener("click", function () {
      saveConsent(false);
      banner.remove();
    });
    banner.querySelector(".ctrax-cookie-accept").addEventListener("click", function () {
      saveConsent(true);
      banner.remove();
    });
  }

  function installSettingsLink() {
    if (isAdmin || document.getElementById("ctrax-cookie-settings")) return;
    var footer = document.querySelector("footer");
    if (!footer) return;
    var button = document.createElement("button");
    button.id = "ctrax-cookie-settings";
    button.type = "button";
    button.className = "ctrax-cookie-settings";
    button.textContent = "Nastavenia cookies";
    button.addEventListener("click", function () { openBanner(true); });
    footer.appendChild(button);
  }

  window.ctraxHasAnalyticsConsent = hasAnalyticsConsent;
  window.ctraxPrivacy = { getConsent: readConsent, setAnalyticsConsent: saveConsent, openSettings: function () { openBanner(true); } };
  if (hasAnalyticsConsent()) loadClarity();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      installSettingsLink();
      openBanner(false);
    }, { once: true });
  } else {
    installSettingsLink();
    openBanner(false);
  }
})();
