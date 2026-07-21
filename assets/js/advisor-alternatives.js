(function () {
  "use strict";

  var scheduled = 0;

  function products() {
    var rows = window.ComputraxLiveCatalog?.products || [];
    return rows.map(function (row) {
      return typeof window.normalizeProduct === "function" ? window.normalizeProduct(row) : row;
    });
  }

  function performance(item) {
    var product = item.product;
    var gpu = typeof window.advisorGpuTier === "function" ? window.advisorGpuTier(product) : 0;
    var cpu = typeof window.advisorCpuTier === "function" ? window.advisorCpuTier(product) : 0;
    var ram = Number(product.ramFilter || parseInt(product.ram, 10) || 0);
    return gpu * 100 + cpu * 25 + Math.min(ram, 128);
  }

  function money(value) {
    return Number(value || 0).toFixed(2).replace(".", ",") + " EUR";
  }

  function choose(all) {
    if (!all.length) return [];
    var best = all[0];
    var selected = [{ role: "best", item: best }];
    var cheaper = all.filter(function (candidate) {
      return candidate.product.name !== best.product.name && Number(candidate.product.price) < Number(best.product.price);
    }).sort(function (a, b) { return b.score - a.score || Number(a.product.price) - Number(b.product.price); })[0];
    if (cheaper) selected.push({ role: "cheaper", item: cheaper });
    var bestPerformance = performance(best);
    var stronger = all.filter(function (candidate) {
      return !selected.some(function (entry) { return entry.item.product.name === candidate.product.name; }) && performance(candidate) > bestPerformance;
    }).sort(function (a, b) { return performance(b) - performance(a) || b.score - a.score; })[0];
    if (stronger) selected.push({ role: "stronger", item: stronger });
    var fallback = all.find(function (candidate) {
      return !selected.some(function (entry) { return entry.item.product.name === candidate.product.name; });
    });
    if (selected.length < 3 && fallback) selected.push({ role: "alternative", item: fallback });
    return selected.slice(0, 3);
  }

  function roleLabel(role) {
    return role === "best" ? "Najlepšia zhoda" : role === "cheaper" ? "Lacnejšia alternatíva" :
      role === "stronger" ? "Výkonnejšia alternatíva" : "Ďalšia skladová možnosť";
  }

  function difference(entry, best) {
    var price = Number(entry.item.product.price || 0);
    var bestPrice = Number(best.product.price || 0);
    if (entry.role === "best") return "Najlepší pomer zhody, rozpočtu, výkonu a požadovaného počtu kusov.";
    if (entry.role === "cheaper") {
      return "Ušetríte " + money(bestPrice - price) + "; zhoda je " + entry.item.match + " %.";
    }
    if (entry.role === "stronger") {
      var delta = price - bestPrice;
      return "Vyššia výkonová rezerva" + (delta > 0 ? " za príplatok " + money(delta) : " bez vyššej ceny") + "; zhoda je " + entry.item.match + " %.";
    }
    return "Ďalšia dostupná konfigurácia s " + entry.item.match + " % zhodou.";
  }

  function enhance() {
    scheduled = 0;
    var result = document.getElementById("advisor-result");
    if (!result || typeof window.advisorAnalyzeProduct !== "function" || typeof window.advisorMatchCard !== "function") return;
    var use = document.getElementById("advisor-use")?.value || "office";
    var budget = Number(document.getElementById("advisor-budget")?.value || 1000);
    var quantity = Number(document.getElementById("advisor-quantity")?.value || 1);
    var programs = String(document.getElementById("advisor-programs")?.value || "").trim().slice(0, 160);
    var needs = Array.from(document.querySelectorAll(".advisor-need:checked")).map(function (input) { return input.value; });
    var all = products().map(function (product) {
      return window.advisorAnalyzeProduct(product, use, budget, needs, programs, quantity);
    }).filter(Boolean).filter(function (item) {
      return Number(item.product.stock || 0) >= quantity;
    }).sort(function (a, b) { return b.score - a.score; });
    if (!all.length) return;
    var selected = choose(all);
    var signature = [use, budget, quantity, programs, needs.join(","), selected.map(function (entry) { return entry.role + ":" + entry.item.product.id; }).join("|")].join("~");
    var list = result.querySelector(".advisor-result-list");
    if (!list) return;
    var expectedLabels = selected.map(function (entry) { return roleLabel(entry.role); });
    var currentLabels = Array.from(list.querySelectorAll(".advisor-rank")).map(function (rank) {
      return rank.textContent.trim();
    });
    if (result.dataset.ctraxAdvisorSignature === signature &&
        currentLabels.length === expectedLabels.length &&
        currentLabels.every(function (label, index) { return label === expectedLabels[index]; }) &&
        list.querySelectorAll(".advisor-difference").length === selected.length) return;
    list.innerHTML = selected.map(function (entry, index) { return window.advisorMatchCard(entry.item, index); }).join("");
    Array.from(list.querySelectorAll(".advisor-match")).forEach(function (card, index) {
      var entry = selected[index];
      var rank = card.querySelector(".advisor-rank");
      if (rank) rank.textContent = roleLabel(entry.role);
      var note = document.createElement("p");
      note.className = "advisor-difference";
      note.textContent = difference(entry, selected[0].item);
      card.querySelector(".advisor-level")?.insertAdjacentElement("afterend", note);
    });
    result.dataset.ctraxAdvisorSignature = signature;
  }

  function schedule() {
    if (scheduled) clearTimeout(scheduled);
    scheduled = window.setTimeout(enhance, 30);
  }

  var result = document.getElementById("advisor-result");
  if (result) new MutationObserver(schedule).observe(result, { childList: true, subtree: true });
  document.addEventListener("click", function (event) {
    if (event.target.closest('[data-action="run-advisor"]')) schedule();
  }, true);
  document.addEventListener("change", function (event) {
    if (event.target.closest('[data-action="advisor-change"]')) schedule();
  }, true);

  var style = document.createElement("style");
  style.textContent = ".advisor-difference{margin:.55rem 0 0!important;padding:.55rem .65rem;border-left:3px solid #60a5fa;background:rgba(59,130,246,.08);color:#dbeafe!important;font-size:.8rem!important}";
  document.head.appendChild(style);
})();
