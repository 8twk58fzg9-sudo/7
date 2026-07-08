(() => {
  "use strict";

  const KEY = "computrax.featured.pc.v2";
  const OLD_KEY = "computrax.one.pc.product.v1";

  const DEFAULT_FEATURED_PRODUCT = {
    active: true,
    name: "Dell OptiPlex 7050 SFF",
    price: 249,
    oldPrice: 319,
    category: "Odporúčaný PC",
    tag: "TOP PONUKA",
    stock: 1,
    condition: "Repasované – veľmi dobrý stav",
    cpu: "Intel Core i5",
    gpu: "Intel HD Graphics",
    ram: "16 GB DDR4",
    storage: "512 GB SSD",
    os: "Windows 11 Pro",
    warranty: "12 mesiacov záruka",
    delivery: "Doručenie po Slovensku",
    tested: "Vyčistený, otestovaný a pripravený na používanie",
    description: "Spoľahlivý repasovaný počítač vhodný do domácnosti, kancelárie alebo školy. Pripravený na internet, dokumenty, faktúry a bežnú prácu.",
    image: ""
  };

  const DEFAULT_CATALOG_PRODUCTS = [
    {
      active: true,
      name: "HP EliteDesk 800 G3 SFF",
      price: 229,
      oldPrice: 289,
      category: "Kancelársky PC",
      tag: "SKLADOM",
      stock: 3,
      condition: "Repasované – dobrý stav",
      cpu: "Intel Core i5-6500",
      gpu: "Intel HD Graphics 530",
      ram: "16 GB DDR4",
      storage: "512 GB SSD",
      os: "Windows 11 Pro",
      warranty: "12 mesiacov záruka",
      delivery: "Odoslanie 1–2 dni",
      tested: "Otestovaný a pripravený na prácu",
      description: "Rýchly kancelársky počítač pre dokumenty, internet, účtovníctvo a školu.",
      image: ""
    },
    {
      active: true,
      name: "Lenovo ThinkCentre M720q Tiny",
      price: 199,
      oldPrice: 249,
      category: "Mini PC",
      tag: "MALÝ FORMÁT",
      stock: 2,
      condition: "Repasované – veľmi dobrý stav",
      cpu: "Intel Core i5-8500T",
      gpu: "Intel UHD Graphics 630",
      ram: "8 GB DDR4",
      storage: "256 GB SSD",
      os: "Windows 11 Pro",
      warranty: "12 mesiacov záruka",
      delivery: "Doručenie po Slovensku",
      tested: "Tichý, úsporný a kompletne otestovaný",
      description: "Kompaktný mini počítač za monitor, do kancelárie, recepcie alebo školy.",
      image: ""
    },
    {
      active: true,
      name: "Computrax Gaming Ryzen 5",
      price: 549,
      oldPrice: 649,
      category: "Herný PC",
      tag: "GAMING",
      stock: 1,
      condition: "Repasované komponenty + nový SSD",
      cpu: "AMD Ryzen 5",
      gpu: "NVIDIA GTX 1660",
      ram: "16 GB DDR4",
      storage: "1 TB SSD",
      os: "Windows 11 Home",
      warranty: "12 mesiacov záruka",
      delivery: "Možnosť osobného odberu",
      tested: "Záťažovo testovaný v hrách a benchmarkoch",
      description: "Výhodná herná zostava pre Fortnite, CS2, GTA V, Roblox a bežné hry vo Full HD.",
      image: ""
    },
    {
      active: true,
      name: "Dell Precision Workstation",
      price: 399,
      oldPrice: 499,
      category: "Workstation",
      tag: "NA PRÁCU",
      stock: 1,
      condition: "Repasované – profesionálna trieda",
      cpu: "Intel Xeon",
      gpu: "NVIDIA Quadro",
      ram: "32 GB DDR4",
      storage: "1 TB SSD",
      os: "Windows 11 Pro",
      warranty: "12 mesiacov záruka",
      delivery: "Doručenie po dohode",
      tested: "Stabilný výkon pre CAD, grafiku a multitasking",
      description: "Silnejšia pracovná stanica pre náročnejšiu prácu, grafiku a viac programov naraz.",
      image: ""
    }
  ];

  function toStr(value, max = 500) {
    return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max);
  }

  function toNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function normalize(product, fallback = DEFAULT_FEATURED_PRODUCT) {
    const p = product || {};
    return {
      active: p.active !== false,
      name: toStr(p.name, 90) || fallback.name,
      price: Math.max(0, toNumber(p.price, fallback.price)),
      oldPrice: Math.max(0, toNumber(p.oldPrice, 0)),
      category: toStr(p.category, 50) || fallback.category,
      tag: toStr(p.tag, 40) || fallback.tag,
      stock: Math.max(0, Math.round(toNumber(p.stock, fallback.stock ?? 1))),
      condition: toStr(p.condition, 90) || fallback.condition,
      cpu: toStr(p.cpu, 80),
      gpu: toStr(p.gpu, 80),
      ram: toStr(p.ram, 60),
      storage: toStr(p.storage, 70),
      os: toStr(p.os, 60),
      warranty: toStr(p.warranty, 80) || fallback.warranty,
      delivery: toStr(p.delivery, 80) || fallback.delivery,
      tested: toStr(p.tested, 120) || fallback.tested,
      description: toStr(p.description, 900) || fallback.description,
      image: String(p.image || "").startsWith("data:image/") ? String(p.image) : ""
    };
  }

  function canUseLocalStorage() {
    try {
      const test = "__computrax_test__";
      localStorage.setItem(test, "1");
      localStorage.removeItem(test);
      return true;
    } catch (err) {
      return false;
    }
  }

  function readStorage(key) {
    if (!canUseLocalStorage()) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (err) { return null; }
  }

  function loadFeaturedProduct() {
    const local = readStorage(KEY) || readStorage(OLD_KEY);
    if (local) return normalize(local);
    if (window.COMPUTRAX_FEATURED_PRODUCT) return normalize(window.COMPUTRAX_FEATURED_PRODUCT);
    if (window.COMPUTRAX_PRODUCT) return normalize(window.COMPUTRAX_PRODUCT);
    return normalize(DEFAULT_FEATURED_PRODUCT);
  }

  function loadDraftOrDefault() {
    return loadFeaturedProduct() || { ...DEFAULT_FEATURED_PRODUCT };
  }

  function saveFeaturedProduct(product) {
    const clean = normalize(product);
    if (!canUseLocalStorage()) throw new Error("Prehliadač nepovolil lokálne úložisko. Použi export product-data.js.");
    localStorage.setItem(KEY, JSON.stringify(clean));
    window.dispatchEvent(new CustomEvent("computrax-featured-updated", { detail: clean }));
    return clean;
  }

  function deleteFeaturedProduct() {
    if (canUseLocalStorage()) {
      localStorage.removeItem(KEY);
      localStorage.removeItem(OLD_KEY);
    }
    window.dispatchEvent(new CustomEvent("computrax-featured-updated"));
  }

  function loadCatalogProducts() {
    const source = Array.isArray(window.COMPUTRAX_CATALOG_PRODUCTS) ? window.COMPUTRAX_CATALOG_PRODUCTS : DEFAULT_CATALOG_PRODUCTS;
    return source.map((item, index) => normalize(item, DEFAULT_CATALOG_PRODUCTS[index] || DEFAULT_FEATURED_PRODUCT)).filter(p => p.active);
  }

  function money(value) {
    return new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(toNumber(value));
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
  }

  function productDataJs(product) {
    return "// Hlavný odporúčaný počítač na úvode stránky.\n" +
      "window.COMPUTRAX_FEATURED_PRODUCT = " + JSON.stringify(normalize(product), null, 2) + ";\n\n" +
      "// Katalóg vieš neskôr upraviť ručne v tomto poli, alebo ho nechaj ako null a použijú sa predvolené PC v computrax-store.js.\n" +
      "window.COMPUTRAX_CATALOG_PRODUCTS = null;\n";
  }

  window.ComputraxStore = {
    KEY,
    DEFAULT_PRODUCT: DEFAULT_FEATURED_PRODUCT,
    DEFAULT_FEATURED_PRODUCT,
    DEFAULT_CATALOG_PRODUCTS,
    normalize,
    loadProduct: loadFeaturedProduct,
    loadFeaturedProduct,
    loadDraftOrDefault,
    saveProduct: saveFeaturedProduct,
    saveFeaturedProduct,
    deleteProduct: deleteFeaturedProduct,
    deleteFeaturedProduct,
    loadCatalogProducts,
    money,
    escapeHtml,
    productDataJs,
    canUseLocalStorage
  };
})();
