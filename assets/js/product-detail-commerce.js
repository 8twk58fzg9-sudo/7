(function () {
  "use strict";

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function productFor(name) {
    var products = window.ComputraxLiveCatalog?.products || [];
    return products.find(function (product) { return clean(product.name) === clean(name); });
  }

  function addFact(grid, label, value) {
    var item = document.createElement("div");
    item.className = "product-detail-spec";
    var caption = document.createElement("span");
    caption.textContent = label;
    var content = document.createElement("b");
    content.textContent = String(value || "Neuvedené");
    item.append(caption, content);
    grid.appendChild(item);
  }

  function updateFixedClaims(root, product) {
    root.querySelectorAll(".product-detail-perks span, .detail-trust-row span").forEach(function (item) {
      if (/mesiacov záruka/i.test(item.textContent || "")) {
        item.textContent = "Záruka " + Number(product.warranty_months || 12) + " mesiacov";
      }
      if (/dní na vrátenie/i.test(item.textContent || "")) {
        item.textContent = Number(product.return_days || 14) + " dní na vrátenie";
      }
    });
  }

  function enrich() {
    var root = document.getElementById("product-detail-wrap");
    if (!root || !root.children.length) return;
    var name = root.querySelector(".product-detail-head h3")?.textContent || "";
    var product = productFor(name);
    if (!product) return;
    var previous = root.querySelector("[data-ctrax-commerce-detail]");
    if (previous?.dataset.productId === String(product.id)) return;
    previous?.remove();

    var section = document.createElement("section");
    section.className = "product-detail-services";
    section.dataset.ctraxCommerceDetail = "1";
    section.dataset.productId = String(product.id);
    var title = document.createElement("strong");
    title.textContent = "Údaje konkrétneho skladového kusu";
    var grid = document.createElement("div");
    grid.className = "product-detail-grid";
    grid.style.marginTop = "0.75rem";
    addFact(grid, "SKU", product.sku);
    addFact(grid, "Sklad", product.warehouse_name);
    addFact(grid, "Dostupnosť", Number(product.stock || 0) + " ks");
    addFact(grid, "Cena", Number(product.price || 0).toFixed(2).replace(".", ",") + " EUR s DPH");
    addFact(grid, "Záruka", Number(product.warranty_months || 12) + " mesiacov");
    addFact(grid, "Vrátenie", Number(product.return_days || 14) + " dní");
    section.append(title, grid);
    var packageTitle = document.createElement("strong");
    packageTitle.style.display = "block";
    packageTitle.style.marginTop = "0.9rem";
    packageTitle.textContent = "Obsah balenia";
    var packageText = document.createElement("span");
    packageText.style.display = "block";
    packageText.style.marginTop = "0.3rem";
    packageText.textContent = String(product.package_contents || "Počítač a napájací kábel; presný obsah je uvedený pri konkrétnom kuse.");
    section.append(packageTitle, packageText);
    root.querySelector(".product-detail-grid")?.insertAdjacentElement("afterend", section);
    updateFixedClaims(root, product);
  }

  var root = document.getElementById("product-detail-wrap");
  if (root) new MutationObserver(enrich).observe(root, { childList: true, subtree: true });
  document.addEventListener("click", function (event) {
    if (event.target.closest('[data-action="open-detail"]')) setTimeout(enrich, 0);
  });
})();
