/* Keep section links aligned below the fixed navigation after dynamic content settles. */
(function () {
  "use strict";

  var correctionTimer = 0;
  var delays = [0, 140, 520, 1200, 2400, 3600];

  function targetForHash(hash) {
    if (!hash || hash === "#") return null;
    if (hash === "#kontakt") {
      try {
        if (new URLSearchParams(window.location.search).has("inquiry")) {
          var nameField = document.getElementById("c-name");
          return nameField?.closest(".form-group") || nameField || document.getElementById("kontakt");
        }
      } catch (error) {}
    }
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch (error) {
      return document.getElementById(hash.slice(1));
    }
  }

  function scrollToHash(hash, behavior) {
    var target = targetForHash(hash);
    if (!target) return false;
    var nav = document.querySelector("nav");
    var navHeight = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;
    var top = target.getBoundingClientRect().top + window.scrollY - navHeight - 18;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: behavior || "auto"
    });
    return true;
  }

  function alignHash(hash, smooth) {
    window.clearTimeout(correctionTimer);
    delays.forEach(function (delay, index) {
      correctionTimer = window.setTimeout(function () {
        scrollToHash(hash, index === 0 && smooth ? "smooth" : "auto");
      }, delay);
    });
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a[href]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (error) {
      return;
    }
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash || !targetForHash(url.hash)) return;
    event.preventDefault();
    if (window.location.hash !== url.hash) history.pushState(null, "", url.hash);
    alignHash(url.hash, !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, true);

  window.addEventListener("hashchange", function () {
    alignHash(window.location.hash, false);
  });

  window.addEventListener("load", function () {
    if (window.location.hash) alignHash(window.location.hash, false);
  });
})();
