(function () {
  'use strict';

  if (window.__COMPUTRAX_ENHANCEMENTS__) return;
  window.__COMPUTRAX_ENHANCEMENTS__ = true;

  const FEATURED_ID_KEY = 'ctrax_featured_product_id';
  const FEATURED_NAME_KEY = 'ctrax_featured_product_name';
  let featuredSettingsCache = null;
  let featuredHeroRefreshTimer = null;

  function addResponsiveStyles() {
    if (document.getElementById('ctrax-enhancement-styles')) return;
    const style = document.createElement('style');
    style.id = 'ctrax-enhancement-styles';
    style.textContent = `
      html{scroll-padding-top:7rem}
      body.ctrax-premium{--ctrax-premium-shadow:0 28px 90px rgba(15,23,42,.12);--ctrax-soft-border:rgba(15,23,42,.1)}
      body.ctrax-premium :is(.btn-primary,.add-cart-btn,.wizard-btn){border-radius:999px;box-shadow:0 12px 28px rgba(37,99,235,.18);font-weight:850;letter-spacing:-.01em}
      body.ctrax-premium .detail-btn,body.ctrax-premium .btn-ghost{border-radius:999px}
      body.ctrax-premium nav{backdrop-filter:saturate(1.45) blur(22px);-webkit-backdrop-filter:saturate(1.45) blur(22px);box-shadow:0 1px 0 rgba(15,23,42,.05)}
      :root[data-theme="light"] body.ctrax-premium nav{background:rgba(255,255,255,.78)}
      body.ctrax-premium .hero{min-height:min(760px,calc(100vh - 74px));padding-top:clamp(7rem,10vw,9rem);padding-bottom:clamp(2.4rem,6vw,5rem);align-items:center}
      body.ctrax-premium .hero::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 78% 16%,rgba(96,165,250,.22),transparent 35%),radial-gradient(circle at 18% 7%,rgba(37,99,235,.12),transparent 29%);pointer-events:none}
      body.ctrax-premium .badge{border-radius:999px;background:rgba(37,99,235,.1);border:1px solid rgba(37,99,235,.18);padding:.45rem .75rem;box-shadow:none}
      body.ctrax-premium .hero h1{font-size:clamp(3rem,8vw,6.85rem);line-height:.88;letter-spacing:-.075em;max-width:790px}
      body.ctrax-premium .hero p{font-size:clamp(1rem,1.65vw,1.35rem);max-width:680px;color:var(--muted)}
      body.ctrax-premium .hero-paths{display:flex;gap:.75rem;align-items:stretch;max-width:720px;margin-top:1.7rem}
      body.ctrax-premium .hero-path{flex:1;border-radius:24px;background:rgba(255,255,255,.62);border:1px solid rgba(15,23,42,.08);box-shadow:0 12px 34px rgba(15,23,42,.06);padding:1.15rem 1.2rem;overflow:hidden;position:relative}
      body.ctrax-premium .hero-path::after{content:"";position:absolute;inset:auto 1rem 0;height:2px;border-radius:999px;background:linear-gradient(90deg,transparent,rgba(37,99,235,.6),transparent);opacity:0;transition:opacity .2s ease}
      body.ctrax-premium .hero-path:hover::after{opacity:1}
      body.ctrax-premium .hero-path-or{align-self:center;color:var(--muted);font-size:.72rem}
      body.ctrax-premium .hero-path-icon{font-size:1.55rem}
      :root:not([data-theme="light"]) body.ctrax-premium .hero-path{background:rgba(15,23,42,.55);border-color:rgba(148,163,184,.18)}
      .mobile-filter-toggle{display:none;width:100%;min-height:48px;align-items:center;justify-content:space-between;gap:.75rem;margin-top:1rem;padding:.8rem 1rem;border:1px solid var(--border);border-radius:16px;background:rgba(255,255,255,.04);color:var(--text);font-weight:850;cursor:pointer}
      .mobile-filter-toggle .filter-toggle-icon{color:var(--accent);font-size:1.1rem;transition:transform .2s ease}
      .mobile-filter-toggle[aria-expanded="true"] .filter-toggle-icon{transform:rotate(180deg)}
      .ctrax-topbar{position:fixed;top:0;left:0;right:0;z-index:1001;min-height:34px;display:flex;align-items:center;justify-content:center;gap:.7rem;padding:.38rem 6%;font-size:.78rem;font-weight:750;color:#0f172a;background:rgba(255,255,255,.86);border-bottom:1px solid rgba(15,23,42,.08);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
      .ctrax-topbar b{color:#1d4ed8}.ctrax-topbar span{display:inline-flex;align-items:center;gap:.35rem}.ctrax-topbar .dot{width:4px;height:4px;border-radius:999px;background:rgba(15,23,42,.26)}
      :root:not([data-theme="light"]) .ctrax-topbar{background:rgba(11,15,26,.88);color:#e5edf7;border-color:rgba(148,163,184,.16)}
      body.ctrax-premium .ctrax-topbar+nav,body.ctrax-premium nav.ctrax-offset{top:34px}
      .ctrax-featured-hero{width:100%;display:grid;grid-template-columns:minmax(0,1fr);gap:1rem;align-items:center;border:1px solid rgba(96,165,250,.18);border-radius:34px;background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(248,250,252,.78));box-shadow:0 38px 110px rgba(15,23,42,.14);padding:clamp(1.05rem,2.4vw,1.85rem);overflow:hidden;position:relative;isolation:isolate}
      .ctrax-featured-hero::before{content:"";position:absolute;inset:-48% -25% auto auto;width:78%;height:78%;background:radial-gradient(circle,rgba(37,99,235,.22),transparent 66%);pointer-events:none;z-index:-1}
      .ctrax-featured-hero::after{content:"";position:absolute;left:12%;right:12%;bottom:-22px;height:44px;border-radius:999px;background:rgba(15,23,42,.14);filter:blur(22px);z-index:-1}
      .ctrax-featured-copy{min-width:0;position:relative;z-index:2}
      .ctrax-featured-eyebrow{display:inline-flex;align-items:center;gap:.45rem;width:max-content;border:1px solid rgba(37,99,235,.22);border-radius:999px;background:#eff6ff;color:#1d4ed8;padding:.42rem .75rem;font-size:.72rem;font-weight:950;text-transform:uppercase;letter-spacing:.08em}
      .ctrax-featured-name{font-family:Outfit,Inter,sans-serif;font-size:clamp(1.95rem,4.4vw,4.45rem);line-height:.9;font-weight:950;letter-spacing:-.075em;margin:.65rem 0 0;color:var(--text)}
      .ctrax-featured-sub{color:var(--muted);font-size:1rem;line-height:1.55;max-width:560px;margin:.75rem 0 0}
      .ctrax-featured-device{min-height:260px;border-radius:30px;background:radial-gradient(circle at 50% 18%,rgba(255,255,255,.9),rgba(219,234,254,.7) 45%,rgba(226,232,240,.72));border:1px solid rgba(148,163,184,.2);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:1.25rem}
      .ctrax-featured-device::before{content:"";position:absolute;width:75%;aspect-ratio:1;border-radius:999px;background:linear-gradient(135deg,rgba(59,130,246,.22),rgba(14,165,233,.05));filter:blur(4px)}
      .ctrax-featured-device img{width:min(100%,560px);max-height:390px;object-fit:contain;filter:drop-shadow(0 34px 34px rgba(15,23,42,.25));position:relative;z-index:2;transform:translateY(2px)}
      .ctrax-featured-fallback{width:min(86%,420px);aspect-ratio:4/3;border-radius:28px;background:linear-gradient(160deg,#0f172a,#1e3a8a 58%,#60a5fa);box-shadow:0 32px 76px rgba(15,23,42,.28);display:grid;place-items:center;color:white;font-family:Outfit,Inter,sans-serif;font-size:3rem;font-weight:950;letter-spacing:-.08em;position:relative;z-index:2}
      .ctrax-featured-fallback::after{content:"";position:absolute;left:18%;right:18%;bottom:-18px;height:14px;border-radius:999px;background:rgba(15,23,42,.34);filter:blur(8px)}
      .ctrax-featured-specs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem;margin:1.15rem 0}
      .ctrax-featured-spec{border:1px solid rgba(148,163,184,.18);background:rgba(255,255,255,.68);border-radius:18px;padding:.75rem .85rem;min-width:0;box-shadow:0 10px 24px rgba(15,23,42,.04)}
      .ctrax-featured-spec span{display:block;color:var(--muted);font-size:.68rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.16rem}
      .ctrax-featured-spec b{display:block;color:var(--text);font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ctrax-featured-actions{display:flex;gap:.7rem;flex-wrap:wrap;align-items:center;margin-top:.95rem}
      .ctrax-featured-price{font-family:Outfit,Inter,sans-serif;font-size:clamp(1.75rem,3vw,2.65rem);font-weight:950;color:var(--text);letter-spacing:-.055em;margin-right:auto}
      .ctrax-featured-actions .btn-primary,.ctrax-featured-actions .detail-btn{min-height:48px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;padding:.8rem 1.12rem}
      .ctrax-featured-note{display:flex;gap:.55rem;flex-wrap:wrap;color:var(--muted);font-size:.8rem;margin-top:.85rem}.ctrax-featured-note span{display:inline-flex;align-items:center;gap:.25rem}
      :root:not([data-theme="light"]) .ctrax-featured-hero{background:linear-gradient(180deg,rgba(15,23,42,.88),rgba(15,23,42,.64));border-color:rgba(148,163,184,.2);box-shadow:0 38px 110px rgba(0,0,0,.28)}
      :root:not([data-theme="light"]) .ctrax-featured-eyebrow{background:rgba(37,99,235,.14);color:#bfdbfe;border-color:rgba(96,165,250,.28)}
      :root:not([data-theme="light"]) .ctrax-featured-device{background:radial-gradient(circle at 50% 18%,rgba(30,41,59,.9),rgba(30,64,175,.18) 45%,rgba(15,23,42,.65))}
      :root:not([data-theme="light"]) .ctrax-featured-spec{background:rgba(255,255,255,.045);border-color:rgba(148,163,184,.18)}
      .ctrax-premium-strip{width:min(1180px,88%);margin:clamp(1rem,3vw,2.2rem) auto 0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.85rem;position:relative;z-index:2}
      .ctrax-premium-pill{border:1px solid rgba(15,23,42,.08);background:rgba(255,255,255,.78);border-radius:22px;padding:1rem 1.05rem;box-shadow:0 16px 38px rgba(15,23,42,.06);min-height:94px;display:flex;flex-direction:column;gap:.25rem}.ctrax-premium-pill span{font-size:1.25rem}.ctrax-premium-pill b{font-family:Outfit,Inter,sans-serif;font-size:1rem;line-height:1.1}.ctrax-premium-pill small{color:var(--muted);line-height:1.35}
      :root:not([data-theme="light"]) .ctrax-premium-pill{background:rgba(15,23,42,.62);border-color:rgba(148,163,184,.16)}
      .ctrax-marketplace-assist{border:1px solid rgba(15,23,42,.09);background:linear-gradient(180deg,rgba(255,255,255,.9),rgba(248,250,252,.82));border-radius:28px;padding:1rem;margin:0 0 1rem;box-shadow:0 18px 50px rgba(15,23,42,.06)}
      .ctrax-marketplace-head{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;flex-wrap:wrap;margin-bottom:.8rem}.ctrax-marketplace-head strong{font-family:Outfit,Inter,sans-serif;font-size:1.25rem;letter-spacing:-.03em}.ctrax-marketplace-head p{color:var(--muted);margin:.2rem 0 0;font-size:.88rem}
      .ctrax-marketplace-stats{display:flex;gap:.55rem;flex-wrap:wrap}.ctrax-marketplace-stat{border:1px solid rgba(15,23,42,.08);background:#fff;border-radius:999px;padding:.52rem .75rem;font-size:.82rem;color:var(--muted)}.ctrax-marketplace-stat b{color:var(--text)}
      .ctrax-marketplace-chips{display:flex;gap:.55rem;overflow-x:auto;padding:.12rem .05rem .15rem;scrollbar-width:thin}.ctrax-marketplace-chip{flex:0 0 auto;border:1px solid rgba(37,99,235,.16);background:#fff;color:var(--text);border-radius:999px;padding:.7rem .92rem;font-size:.86rem;font-weight:850;text-decoration:none;box-shadow:0 8px 22px rgba(15,23,42,.04)}.ctrax-marketplace-chip:hover{border-color:var(--accent);transform:translateY(-1px)}
      :root:not([data-theme="light"]) .ctrax-marketplace-assist{background:rgba(15,23,42,.72);border-color:rgba(148,163,184,.16)}:root:not([data-theme="light"]) .ctrax-marketplace-stat,:root:not([data-theme="light"]) .ctrax-marketplace-chip{background:rgba(255,255,255,.055);border-color:rgba(148,163,184,.16)}
      body.ctrax-premium #ponuka{padding-top:clamp(2.5rem,5vw,4rem)}
      body.ctrax-premium .filter-panel{border-radius:28px;box-shadow:0 16px 42px rgba(15,23,42,.06);position:relative;z-index:5}
      body.ctrax-premium .products-grid{gap:clamp(1rem,2vw,1.35rem)}
      body.ctrax-premium .pc-card{border-radius:28px;box-shadow:0 18px 48px rgba(15,23,42,.07);overflow:hidden;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease;background:rgba(255,255,255,.92)}
      body.ctrax-premium .pc-card:hover{transform:translateY(-6px);box-shadow:0 28px 70px rgba(15,23,42,.13)}
      body.ctrax-premium .pc-card .pc-image,body.ctrax-premium .pc-image{border-radius:22px;background:linear-gradient(135deg,#f8fafc,#eef6ff);min-height:230px}
      body.ctrax-premium .pc-card img[data-product-image]{object-fit:contain;filter:drop-shadow(0 22px 24px rgba(15,23,42,.18))}
      body.ctrax-premium .pc-name{font-family:Outfit,Inter,sans-serif;font-size:1.35rem;letter-spacing:-.035em;line-height:1.05}
      body.ctrax-premium .pc-price{font-family:Outfit,Inter,sans-serif;font-size:1.85rem;letter-spacing:-.045em}
      body.ctrax-premium .spec-chip{border-radius:14px}
      body.ctrax-premium .card-guarantee{border-radius:16px;background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.16);padding:.58rem .7rem}
      :root:not([data-theme="light"]) body.ctrax-premium .pc-card{background:rgba(15,23,42,.82)}:root:not([data-theme="light"]) body.ctrax-premium .pc-image{background:linear-gradient(135deg,rgba(15,23,42,.9),rgba(30,64,175,.18))}
      .ctrax-mobile-commerce{position:fixed;left:50%;bottom:calc(.75rem + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:990;width:min(94vw,520px);display:none;gap:.55rem;padding:.55rem;border:1px solid rgba(15,23,42,.1);border-radius:999px;background:rgba(255,255,255,.92);box-shadow:0 20px 60px rgba(15,23,42,.22);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}.ctrax-mobile-commerce a,.ctrax-mobile-commerce button{flex:1;border:none;border-radius:999px;min-height:44px;display:flex;align-items:center;justify-content:center;text-decoration:none;font-weight:900;color:var(--text);background:#f1f5f9}.ctrax-mobile-commerce button{background:var(--action);color:white}.ctrax-mobile-commerce small{font-size:.7rem;color:inherit;opacity:.82;margin-left:.25rem}
      .ctrax-featured-admin{border:1px solid rgba(96,165,250,.35);background:rgba(59,130,246,.08);border-radius:18px;padding:1rem;margin-bottom:1rem}.ctrax-featured-admin-head{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;flex-wrap:wrap;margin-bottom:.85rem}.ctrax-featured-admin strong{font-family:Outfit,Inter,sans-serif;font-size:1.05rem;color:var(--text)}.ctrax-featured-admin p{color:var(--muted);font-size:.82rem;margin:.15rem 0 0}.ctrax-featured-admin-controls{display:flex;gap:.65rem;align-items:center;flex-wrap:wrap}.ctrax-featured-admin select{min-width:min(100%,360px);background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:10px;color:var(--text);padding:.62rem .8rem;font:inherit;font-size:.86rem}.ctrax-featured-admin-status{color:var(--muted);font-size:.78rem;margin-top:.65rem}
      @media(min-width:980px){.ctrax-featured-hero{grid-template-columns:minmax(0,.92fr) minmax(380px,1.08fr)}}
      @media(max-width:1320px){html{scroll-padding-top:11.5rem}}
      @media(max-width:900px){.ctrax-premium-strip{grid-template-columns:repeat(2,minmax(0,1fr));width:min(92%,1180px)}body.ctrax-premium .hero-paths{flex-direction:column}.ctrax-topbar{font-size:.72rem;gap:.45rem;overflow:hidden;white-space:nowrap}.ctrax-topbar .hide-sm{display:none}.ctrax-mobile-commerce{display:flex}}
      @media(max-width:720px){html{scroll-padding-top:13.5rem}.mobile-filter-toggle{display:flex}.filter-details:not(.mobile-open){display:none}.filter-details.mobile-open{display:grid}.ctrax-featured-specs{grid-template-columns:1fr}.ctrax-featured-actions{align-items:stretch}.ctrax-featured-actions a,.ctrax-featured-actions button{width:100%;justify-content:center;text-align:center}.ctrax-featured-price{width:100%;text-align:center;margin-right:0}.ctrax-featured-device{min-height:210px}.ctrax-premium-strip{grid-template-columns:1fr}.ctrax-marketplace-assist{border-radius:22px}.ctrax-marketplace-head strong{font-size:1.08rem}body.ctrax-premium .hero h1{font-size:clamp(2.65rem,16vw,4.5rem)}}
      @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important}.mobile-filter-toggle .filter-toggle-icon{transition:none}.ctrax-marketplace-chip:hover,body.ctrax-premium .pc-card:hover{transform:none!important}}
    `;
    document.head.appendChild(style);
  }

  function enhanceProductCard(card) {
    if (!(card instanceof HTMLElement) || !card.matches('[data-product-card]')) return;
    card.setAttribute('role', 'article');
    card.setAttribute('tabindex', '0');
    const name = card.getAttribute('data-product-name') || 'Produkt';
    card.setAttribute('aria-label', name + '. Stlačením Enter otvoríte detail produktu.');
  }

  function associateFormLabels(root) {
    (root || document).querySelectorAll('.form-group, .filter-item, .auth-field').forEach(function (group) {
      const control = group.querySelector('input:not([type="hidden"]), select, textarea');
      const label = group.querySelector('label');
      const textLabel = group.querySelector('.form-label, .filter-label');
      if (!control) return;
      if (label && control.id) label.htmlFor = control.id;
      if (!label && !control.getAttribute('aria-label') && textLabel) {
        const text = String(textLabel.textContent || '').trim();
        if (text) control.setAttribute('aria-label', text);
      }
    });
  }

  function safeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function safeImage(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^data:image\/(png|jpe?g|webp);base64,/i.test(raw)) return raw.length <= 1500000 ? raw : '';
    try {
      const url = new URL(raw, location.href);
      const local = url.protocol === 'http:' && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname);
      return (url.protocol === 'https:' || local) ? url.href : '';
    } catch (e) {
      return '';
    }
  }

  function money(value) {
    const amount = Number(value || 0);
    return Number.isFinite(amount) ? Math.round(amount) + '€' : '—';
  }

  function readProducts() {
    const candidates = [];
    try { if (typeof activeProducts !== 'undefined' && Array.isArray(activeProducts)) candidates.push(activeProducts); } catch (e) {}
    try { if (typeof allProducts !== 'undefined' && Array.isArray(allProducts)) candidates.push(allProducts); } catch (e) {}
    try { if (Array.isArray(window.PRODUCTS_DATA)) candidates.push(window.PRODUCTS_DATA); } catch (e) {}
    try { if (typeof getBundledProducts === 'function') candidates.push(getBundledProducts()); } catch (e) {}
    const found = candidates.find(list => Array.isArray(list) && list.length);
    return found ? found.filter(Boolean) : [];
  }

  function productId(product) {
    const id = product && product.id != null ? String(product.id) : '';
    return id || String(product?.name || '').trim();
  }

  function normalizeFeaturedSettings(settings) {
    const source = settings || featuredSettingsCache || {};
    const id = String(source.featuredProductId || source.featured_product_id || localStorage.getItem(FEATURED_ID_KEY) || '').trim();
    const name = String(source.featuredProductName || source.featured_product_name || localStorage.getItem(FEATURED_NAME_KEY) || '').trim();
    return { id, name };
  }

  function chooseFeaturedProduct(list, settings) {
    const products = (Array.isArray(list) ? list : readProducts()).filter(product => product && product.name && String(product.status || 'active') !== 'sold' && Number(product.stock || 0) > 0);
    if (!products.length) return null;
    const wanted = normalizeFeaturedSettings(settings);
    if (wanted.id) {
      const byId = products.find(product => productId(product) === wanted.id || String(product.id || '') === wanted.id);
      if (byId) return byId;
    }
    if (wanted.name) {
      const needle = wanted.name.toLowerCase();
      const byName = products.find(product => String(product.name || '').toLowerCase() === needle) || products.find(product => String(product.name || '').toLowerCase().includes(needle));
      if (byName) return byName;
    }
    return products.slice().sort(function (a, b) {
      return Number(b.popular || 0) - Number(a.popular || 0) || Number(b.newest || b.id || 0) - Number(a.newest || a.id || 0);
    })[0];
  }

  async function fetchFeaturedSettingsPublic() {
    if (featuredSettingsCache) return featuredSettingsCache;
    try {
      if (typeof SB_URL === 'undefined' || typeof SB_KEY === 'undefined' || !SB_URL || !SB_KEY) return {};
      const headers = { apikey: SB_KEY, 'Cache-Control': 'no-cache' };
      if (String(SB_KEY).startsWith('eyJ')) headers.Authorization = 'Bearer ' + SB_KEY;
      const res = await fetch(SB_URL + '/rest/v1/site_settings?select=settings&key=eq.main&limit=1', { cache: 'no-store', headers });
      const rows = await res.json();
      featuredSettingsCache = Array.isArray(rows) && rows[0]?.settings ? rows[0].settings : {};
      return featuredSettingsCache;
    } catch (e) {
      return {};
    }
  }

  function productImageHtml(product) {
    const src = safeImage(product?.imageUrl || product?.image_url || '');
    if (src) return '<img src="' + safeHtml(src) + '" alt="' + safeHtml(product.name) + '" width="1000" height="750" loading="eager" decoding="async">';
    const initials = String(product?.name || 'PC').split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase() || 'PC';
    return '<div class="ctrax-featured-fallback" aria-hidden="true">' + safeHtml(initials) + '</div>';
  }

  function renderFeaturedHero(product) {
    const heroVisual = document.querySelector('.hero-visual');
    if (!heroVisual || !product) return;
    const safeName = safeHtml(product.name || 'Odporúčaný počítač');
    const safePrice = Number(product.price || 0);
    heroVisual.innerHTML = '';
    heroVisual.classList.add('reveal');
    heroVisual.innerHTML = '<div class="ctrax-featured-hero" aria-label="Odporúčaný počítač Computrax">' +
      '<div class="ctrax-featured-copy">' +
        '<div class="ctrax-featured-eyebrow">★ Odporúčaný kus skladom</div>' +
        '<h2 class="ctrax-featured-name">' + safeName + '</h2>' +
        '<p class="ctrax-featured-sub">Jeden vybraný počítač dostane pozornosť ako Apple produkt. Zvyšok ponuky ostáva v plnom katalógu s filtrami, detailom, košíkom a objednávkou.</p>' +
        '<div class="ctrax-featured-specs">' +
          '<div class="ctrax-featured-spec"><span>Procesor</span><b>' + safeHtml(product.cpu || 'Neuvedené') + '</b></div>' +
          '<div class="ctrax-featured-spec"><span>Grafika</span><b>' + safeHtml(product.gpu || 'Neuvedené') + '</b></div>' +
          '<div class="ctrax-featured-spec"><span>RAM</span><b>' + safeHtml(product.ram || 'Neuvedené') + '</b></div>' +
          '<div class="ctrax-featured-spec"><span>Disk</span><b>' + safeHtml(product.ssd || 'Neuvedené') + '</b></div>' +
        '</div>' +
        '<div class="ctrax-featured-actions">' +
          '<div class="ctrax-featured-price">' + money(safePrice) + '</div>' +
          '<button type="button" class="btn-primary" data-action="add-cart" data-name="' + safeName + '" data-price="' + safePrice + '">Pridať do košíka</button>' +
          '<button type="button" class="detail-btn" data-action="open-detail" data-name="' + safeName + '">Detail PC</button>' +
          '<a class="detail-btn" href="#ponuka">Viac počítačov</a>' +
        '</div>' +
        '<div class="ctrax-featured-note"><span>🛡️ 12 mesiacov záruka</span><span>✅ Otestované</span><span>🚚 ' + safeHtml(product.delivery || 'Doprava po Slovensku') + '</span></div>' +
      '</div>' +
      '<div class="ctrax-featured-device">' + productImageHtml(product) + '</div>' +
    '</div>';
  }

  async function refreshFeaturedHero() {
    clearTimeout(featuredHeroRefreshTimer);
    const settings = await fetchFeaturedSettingsPublic();
    const product = chooseFeaturedProduct(readProducts(), settings);
    if (product) renderFeaturedHero(product);
  }

  function scheduleFeaturedHeroRefresh(delay) {
    clearTimeout(featuredHeroRefreshTimer);
    featuredHeroRefreshTimer = setTimeout(function () { refreshFeaturedHero(); updateMarketplaceStats(); }, Number(delay || 120));
  }

  function installFeaturedHeroHooks() {
    scheduleFeaturedHeroRefresh(250);
    scheduleFeaturedHeroRefresh(900);
    scheduleFeaturedHeroRefresh(1800);
    try {
      if (typeof renderProducts === 'function' && !renderProducts.__ctraxFeaturedWrapped) {
        const originalRenderProducts = renderProducts;
        renderProducts = function () {
          const result = originalRenderProducts.apply(this, arguments);
          scheduleFeaturedHeroRefresh(80);
          return result;
        };
        renderProducts.__ctraxFeaturedWrapped = true;
      }
    } catch (e) {}
    window.addEventListener('storage', function (event) {
      if ([FEATURED_ID_KEY, FEATURED_NAME_KEY, 'ctrax_products_updated_at', 'ctrax_site_settings'].includes(event.key)) {
        featuredSettingsCache = null;
        scheduleFeaturedHeroRefresh(80);
      }
    });
  }

  function installPremiumModeClass() {
    document.body?.classList.add('ctrax-premium');
  }

  function installPremiumTopBar() {
    if (document.getElementById('ctrax-topbar')) return;
    const nav = document.querySelector('nav');
    const bar = document.createElement('div');
    bar.id = 'ctrax-topbar';
    bar.className = 'ctrax-topbar';
    bar.innerHTML = '<span><b>Computrax Premium</b></span><span class="dot" aria-hidden="true"></span><span>Testované PC skladom</span><span class="dot hide-sm" aria-hidden="true"></span><span class="hide-sm">12 mesiacov záruka</span><span class="dot hide-sm" aria-hidden="true"></span><span class="hide-sm">Doručenie po Slovensku</span>';
    if (nav) {
      nav.before(bar);
      nav.classList.add('ctrax-offset');
    } else {
      document.body.prepend(bar);
    }
  }

  function upgradeHeroCopy() {
    const title = document.getElementById('hero-title');
    const text = document.getElementById('hero-text');
    const badge = document.getElementById('hero-badge-text');
    if (badge && !badge.dataset.ctraxPremiumText) {
      badge.textContent = 'Prémiové repasované počítače';
      badge.dataset.ctraxPremiumText = '1';
    }
    if (title && !title.dataset.ctraxPremiumText) {
      title.innerHTML = 'Build Your Next <span>PC.</span>';
      title.dataset.ctraxPremiumText = '1';
    }
    if (text && !text.dataset.ctraxPremiumText) {
      text.textContent = 'Vyber si počítač, ktorý pôsobí ako nový — otestovaný, pripravený na používanie a jasne popísaný pred kúpou.';
      text.dataset.ctraxPremiumText = '1';
    }
    const firstPath = document.querySelector('.hero-path[href="#ponuka"]');
    if (firstPath && !firstPath.dataset.ctraxPremiumText) {
      firstPath.querySelector('strong') && (firstPath.querySelector('strong').textContent = 'Pozrieť počítače');
      firstPath.querySelector('.hero-path-sub') && (firstPath.querySelector('.hero-path-sub').textContent = 'Viac modelov v katalógu, filtre, porovnanie a košík.');
      firstPath.querySelector('.hero-path-cta') && (firstPath.querySelector('.hero-path-cta').textContent = 'Otvoriť katalóg →');
      firstPath.dataset.ctraxPremiumText = '1';
    }
  }

  function installPremiumTrustBand() {
    if (document.getElementById('ctrax-premium-strip')) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const strip = document.createElement('div');
    strip.id = 'ctrax-premium-strip';
    strip.className = 'ctrax-premium-strip';
    strip.innerHTML = '' +
      '<div class="ctrax-premium-pill"><span>🛡️</span><b>Computrax Tested</b><small>Každý PC má kontrolu parametrov, disku, RAM a teplôt.</small></div>' +
      '<div class="ctrax-premium-pill"><span>🚚</span><b>Rýchle doručenie</b><small>Kuriér alebo Packeta podľa dostupnosti a objednávky.</small></div>' +
      '<div class="ctrax-premium-pill"><span>↩️</span><b>14 dní vrátenie</b><small>Jasné pravidlá vrátenia a reklamácie priamo na webe.</small></div>' +
      '<div class="ctrax-premium-pill"><span>💬</span><b>Výber na mieru</b><small>Nevieš ktorý PC? Napíš použitie a rozpočet.</small></div>';
    hero.after(strip);
  }

  function updateMarketplaceStats() {
    const stats = document.getElementById('ctrax-marketplace-stats');
    if (!stats) return;
    const products = readProducts().filter(product => product && product.name && String(product.status || 'active') !== 'sold');
    const stock = products.reduce((sum, product) => sum + Math.max(0, Number(product.stock || 0)), 0);
    const gaming = products.filter(product => product.cat === 'gaming').length;
    const office = products.filter(product => product.cat === 'office').length;
    const prices = products.map(product => Number(product.price || 0)).filter(Number.isFinite).filter(Boolean);
    const min = prices.length ? Math.min(...prices) : 0;
    stats.innerHTML = '<span class="ctrax-marketplace-stat"><b>' + products.length + '</b> modelov</span>' +
      '<span class="ctrax-marketplace-stat"><b>' + stock + '</b> kusov skladom</span>' +
      '<span class="ctrax-marketplace-stat"><b>' + gaming + '</b> herné</span>' +
      '<span class="ctrax-marketplace-stat"><b>' + office + '</b> office</span>' +
      (min ? '<span class="ctrax-marketplace-stat">od <b>' + money(min) + '</b></span>' : '');
  }

  function installMarketplaceAssist() {
    if (document.getElementById('ctrax-marketplace-assist')) {
      updateMarketplaceStats();
      return;
    }
    const catalog = document.getElementById('ponuka');
    if (!catalog) return;
    const target = catalog.querySelector('.filter-panel') || catalog.querySelector('#products-grid') || catalog.firstElementChild;
    if (!target) return;
    const box = document.createElement('div');
    box.id = 'ctrax-marketplace-assist';
    box.className = 'ctrax-marketplace-assist reveal';
    box.innerHTML = '<div class="ctrax-marketplace-head">' +
      '<div><strong>Katalóg ako marketplace, pocit ako premium obchod.</strong><p>Rýchlo nájdi PC podľa použitia — herný, pracovný, školský alebo najlepší pomer cena/výkon.</p></div>' +
      '<div class="ctrax-marketplace-stats" id="ctrax-marketplace-stats" aria-live="polite"></div>' +
      '</div>' +
      '<div class="ctrax-marketplace-chips" aria-label="Rýchle výbery produktov">' +
      '<a class="ctrax-marketplace-chip" href="#ponuka" data-action="quick-filter" data-filter-type="cat" data-filter-value="gaming">🎮 Herné PC</a>' +
      '<a class="ctrax-marketplace-chip" href="#ponuka" data-action="quick-filter" data-filter-type="cat" data-filter-value="office">💼 Do práce a školy</a>' +
      '<a class="ctrax-marketplace-chip" href="#ponuka" data-action="quick-filter" data-filter-type="stock" data-filter-value="skladom">🟢 Skladom</a>' +
      '<a class="ctrax-marketplace-chip" href="#ponuka" onclick="document.getElementById(\'sort-select\')&&(document.getElementById(\'sort-select\').value=\'value\'); if(typeof applyFilters===\'function\') applyFilters();">⚡ Cena / výkon</a>' +
      '<a class="ctrax-marketplace-chip" href="#poradca">◎ Pomôž mi vybrať</a>' +
      '</div>';
    target.before(box);
    updateMarketplaceStats();
  }

  function installMobileCommerceBar() {
    if (document.getElementById('ctrax-mobile-commerce')) return;
    const bar = document.createElement('div');
    bar.id = 'ctrax-mobile-commerce';
    bar.className = 'ctrax-mobile-commerce';
    bar.innerHTML = '<a href="#ponuka">Počítače</a><button type="button" data-action="open-cart">Košík <small id="ctrax-mobile-cart-count">0</small></button>';
    document.body.appendChild(bar);
    const update = function () {
      const target = document.getElementById('ctrax-mobile-cart-count');
      const source = document.getElementById('cart-count');
      if (target && source) target.textContent = source.textContent || '0';
    };
    update();
    const source = document.getElementById('cart-count');
    if (source) new MutationObserver(update).observe(source, { childList: true, subtree: true, characterData: true });
    window.addEventListener('storage', update);
  }

  function premiumProductCardMicrocopy(card) {
    if (!(card instanceof HTMLElement) || card.dataset.ctraxPremiumCopy) return;
    const footer = card.querySelector('.pc-footer');
    if (footer && !card.querySelector('.ctrax-premium-card-note')) {
      const note = document.createElement('div');
      note.className = 'ctrax-premium-card-note';
      note.style.cssText = 'display:flex;gap:.45rem;flex-wrap:wrap;color:var(--muted);font-size:.75rem;margin:.55rem 0 -.15rem;';
      note.innerHTML = '<span>✅ testované</span><span>🛡️ záruka</span><span>↩️ 14 dní</span>';
      footer.before(note);
    }
    card.dataset.ctraxPremiumCopy = '1';
  }

  function enhanceAllProductCardsPremium(root) {
    (root || document).querySelectorAll?.('[data-product-card], .pc-card').forEach(function (card) {
      enhanceProductCard(card);
      premiumProductCardMicrocopy(card);
    });
  }

  function enhanceStorefront() {
    installPremiumModeClass();
    installPremiumTopBar();
    upgradeHeroCopy();
    installPremiumTrustBand();
    installMobileCommerceBar();
    const catalog = document.getElementById('ponuka');
    const hero = document.querySelector('.hero');
    if (catalog && hero && hero.nextElementSibling !== catalog) {
      hero.after(catalog);
    }

    installFeaturedHeroHooks();
    installMarketplaceAssist();

    const details = document.getElementById('detailed-product-filters') ||
      document.querySelector('#ponuka .filter-details');
    let toggle = document.querySelector('#ponuka .mobile-filter-toggle');
    if (details && !details.id) details.id = 'detailed-product-filters';
    if (details && !toggle) {
      toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'mobile-filter-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', details.id);
      toggle.innerHTML = '<span>Podrobne filtre</span><span class="filter-toggle-icon" aria-hidden="true">&#8964;</span>';
      details.before(toggle);
      toggle.addEventListener('click', function () {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        details.classList.toggle('mobile-open', !expanded);
      });
    }

    enhanceAllProductCardsPremium(document);
    associateFormLabels(document);
    const grid = document.getElementById('products-grid');
    if (grid) {
      new MutationObserver(function (entries) {
        let changed = false;
        entries.forEach(function (entry) {
          entry.addedNodes.forEach(function (node) {
            if (!(node instanceof HTMLElement)) return;
            enhanceProductCard(node);
            node.querySelectorAll?.('[data-product-card], .pc-card').forEach(function (card) { enhanceProductCard(card); premiumProductCardMicrocopy(card); });
            if (node.matches?.('[data-product-card], .pc-card')) { enhanceProductCard(node); premiumProductCardMicrocopy(node); }
            if (node.matches?.('[data-product-card], .pc-card') || node.querySelector?.('[data-product-card], .pc-card')) changed = true;
          });
        });
        if (changed) { scheduleFeaturedHeroRefresh(120); updateMarketplaceStats(); }
      }).observe(grid, { childList: true, subtree: true });
    }

    if (catalog && location.hash === '#ponuka') {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          catalog.scrollIntoView({ block: 'start' });
        });
      });
    }
  }

  function adminImageReadyMessage() {
    if (!document.getElementById('img-status') || typeof setImageStatus !== 'function') return;
    if (typeof useLocalStorage !== 'undefined' && useLocalStorage) {
      setImageStatus('Lokálny režim: fotka zostane iba v tomto prehliadači. Pre verejný web použite Supabase režim.');
    } else if (typeof hasSupabaseWriteAuth === 'function' && !hasSupabaseWriteAuth()) {
      setImageStatus('Pred nahratím fotky pripojte hore „Supabase admin zápis“. Potom sa fotka bezpečne uloží do product-images a zobrazí sa všetkým návštevníkom.');
    } else {
      setImageStatus('Supabase admin je pripojený. Fotku môžete nahrať zo súboru.');
    }
  }

  async function secureProductImageUpload(file, productName) {
    if (typeof ensureSupabaseWriteAuth !== 'function' || !(await ensureSupabaseWriteAuth(false))) {
      throw new Error('Najprv pripojte Supabase admin zápis.');
    }
    const extension = PRODUCT_IMAGE_TYPES[file.type];
    if (!extension || file.size > PRODUCT_IMAGE_MAX_BYTES) {
      throw new Error('Povolené sú JPG, PNG alebo WebP súbory do 10 MB.');
    }
    const token = String(authSession?.access_token || '');
    if (!token) throw new Error('Supabase admin relácia chýba alebo vypršala.');
    const base = String(productName || 'produkt')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '')
      .toLowerCase().slice(0, 70) || 'produkt';
    const path = base + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.' + extension;
    const response = await fetchWithTimeout(
      SB_URL + '/storage/v1/object/product-images/' + encodeURIComponent(path),
      {
        method: 'POST',
        headers: {
          apikey: SB_KEY,
          Authorization: 'Bearer ' + token,
          'Content-Type': file.type,
          'x-upsert': 'false'
        },
        body: file
      }
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error('Storage ' + response.status + ': ' + text.slice(0, 400));
    }
    return SB_URL + '/storage/v1/object/public/product-images/' + encodeURIComponent(path);
  }

  function adminProductsForFeatured() {
    return readProducts().filter(product => product && product.name && String(product.status || 'active') !== 'sold');
  }

  function selectedFeaturedId() {
    const settings = normalizeFeaturedSettings({});
    return settings.id || settings.name;
  }

  function renderFeaturedAdminOptions() {
    const select = document.getElementById('ctrax-featured-select');
    if (!select) return;
    const products = adminProductsForFeatured();
    const selected = selectedFeaturedId();
    const options = ['<option value="">Automaticky najlepší skladový kus</option>'].concat(products.map(function (product) {
      const id = productId(product);
      const label = product.name + ' · ' + money(product.price) + ' · sklad ' + Number(product.stock || 0);
      return '<option value="' + safeHtml(id) + '" data-name="' + safeHtml(product.name) + '">' + safeHtml(label) + '</option>';
    }));
    const currentMarkup = options.join('');
    if (select.dataset.lastOptions !== currentMarkup) {
      select.innerHTML = currentMarkup;
      select.dataset.lastOptions = currentMarkup;
    }
    if ([...select.options].some(option => option.value === selected)) select.value = selected;
    updateFeaturedAdminPreview();
  }

  function updateFeaturedAdminPreview() {
    const status = document.getElementById('ctrax-featured-status');
    if (!status) return;
    const select = document.getElementById('ctrax-featured-select');
    const product = chooseFeaturedProduct(adminProductsForFeatured(), { featuredProductId: select?.value || '', featuredProductName: select?.selectedOptions?.[0]?.dataset?.name || '' });
    status.textContent = product
      ? 'Na úvode sa zobrazí: ' + product.name + ' · ' + money(product.price) + '. Tlačidlo „Viac počítačov“ necháva celý katalóg a košík pôvodný.'
      : 'Zatiaľ nie je dostupný aktívny produkt na zobrazenie.';
  }

  async function saveFeaturedProductChoice() {
    const select = document.getElementById('ctrax-featured-select');
    const value = String(select?.value || '').trim();
    const name = String(select?.selectedOptions?.[0]?.dataset?.name || '').trim();
    if (value) localStorage.setItem(FEATURED_ID_KEY, value); else localStorage.removeItem(FEATURED_ID_KEY);
    if (name) localStorage.setItem(FEATURED_NAME_KEY, name); else localStorage.removeItem(FEATURED_NAME_KEY);
    localStorage.setItem('ctrax_site_settings', Date.now().toString());

    let savedPublic = false;
    try {
      if (typeof ensureSupabaseWriteAuth === 'function' && await ensureSupabaseWriteAuth(false)) {
        const token = String(authSession?.access_token || '');
        const headers = { apikey: SB_KEY, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
        const res = await fetch(SB_URL + '/rest/v1/site_settings?select=settings&key=eq.main&limit=1', { cache: 'no-store', headers });
        const rows = await res.json();
        const current = Array.isArray(rows) && rows[0]?.settings ? rows[0].settings : {};
        const next = { ...current, featuredProductId: value, featuredProductName: name };
        const patch = await fetch(SB_URL + '/rest/v1/site_settings?key=eq.main', {
          method: 'PATCH',
          headers: { ...headers, Prefer: 'return=minimal' },
          body: JSON.stringify({ settings: next })
        });
        if (!patch.ok) throw new Error(await patch.text());
        savedPublic = true;
      }
    } catch (error) {
      console.warn('Featured product public save failed:', error);
    }
    updateFeaturedAdminPreview();
    if (typeof showToast === 'function') {
      showToast(savedPublic
        ? '⭐ Hlavný PC uložený verejne. Zobrazí sa návštevníkom na úvode.'
        : '⭐ Hlavný PC uložený lokálne. Pre verejný web pripoj Supabase admin zápis a ulož znova.', !savedPublic);
    }
  }

  function installFeaturedAdminPanel() {
    if (document.getElementById('ctrax-featured-admin')) return;
    const dashboard = document.querySelector('.orders-wrap.admin-section[data-admin-section~="dashboard"]');
    const settings = document.querySelector('.admin-section[data-admin-section~="settings"]');
    const anchor = dashboard || settings || document.querySelector('.stats-bar') || document.querySelector('main') || document.body;
    const panel = document.createElement('div');
    panel.id = 'ctrax-featured-admin';
    panel.className = 'ctrax-featured-admin admin-section active-admin-section';
    panel.setAttribute('data-admin-section', 'dashboard products settings');
    panel.innerHTML = '<div class="ctrax-featured-admin-head">' +
      '<div><strong>Apple štýl úvodu — 1 hlavný PC</strong><p>Vyber jeden počítač, ktorý bude hore na stránke. Katalóg, košík, objednávky a ostatné funkcie zostávajú pôvodné.</p></div>' +
      '<div class="ctrax-featured-admin-controls">' +
        '<select id="ctrax-featured-select" aria-label="Odporúčaný počítač na úvod"></select>' +
        '<button type="button" class="btn btn-primary btn-sm" data-ctrax-featured-action="save">Nastaviť na úvod</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-ctrax-featured-action="refresh">Obnoviť</button>' +
      '</div>' +
    '</div><div class="ctrax-featured-admin-status" id="ctrax-featured-status">Načítavam produkty...</div>';
    anchor.before(panel);
    panel.addEventListener('change', function (event) {
      if (event.target && event.target.id === 'ctrax-featured-select') updateFeaturedAdminPreview();
    });
    panel.addEventListener('click', function (event) {
      const action = event.target.closest?.('[data-ctrax-featured-action]')?.dataset.ctraxFeaturedAction;
      if (!action) return;
      event.preventDefault();
      if (action === 'save') saveFeaturedProductChoice();
      if (action === 'refresh') renderFeaturedAdminOptions();
    });
    renderFeaturedAdminOptions();
    let runs = 0;
    const timer = setInterval(function () {
      renderFeaturedAdminOptions();
      runs += 1;
      if (runs > 20) clearInterval(timer);
    }, 800);
  }

  function enhanceAdmin() {
    installFeaturedAdminPanel();
    if (typeof saveProduct === 'function' && !window.__COMPUTRAX_IMAGE_SAVE_GUARD__) {
      window.__COMPUTRAX_IMAGE_SAVE_GUARD__ = true;
      const originalSaveProduct = saveProduct;

      saveProduct = async function () {
        const file = typeof pendingImageFile !== 'undefined' ? pendingImageFile : null;
        const localMode = typeof useLocalStorage !== 'undefined' && useLocalStorage;
        if (file && !localMode) {
          const name = String(document.getElementById('f-name')?.value || '').trim();
          const price = Number(document.getElementById('f-price')?.value);
          if (name.length < 3 || !Number.isFinite(price) || price < 0) {
            return originalSaveProduct();
          }
          try {
            setImageStatus('Nahrávam fotku do Supabase Storage...');
            const imageUrl = await secureProductImageUpload(file, name);
            document.getElementById('f-image-url').value = imageUrl;
            pendingImageFile = null;
            setImageStatus('Fotka bola nahraná. Ukladám produkt...');
          } catch (error) {
            const message = typeof productImageUploadErrorMessage === 'function'
              ? productImageUploadErrorMessage(error)
              : String(error?.message || error);
            setImageStatus(message + ' Fotka aj údaje zostali zachované; skúste to znova.', true);
            if (typeof showToast === 'function') showToast('Fotku sa nepodarilo nahrať: ' + message, true);
            return;
          }
        }
        const result = await originalSaveProduct();
        setTimeout(renderFeaturedAdminOptions, 300);
        return result;
      };
    }

    document.addEventListener('click', function (event) {
      const action = event.target.closest?.('[data-admin-action]')?.dataset.adminAction;
      if (action === 'openModal' || action === 'openEdit') {
        setTimeout(adminImageReadyMessage, 80);
      }
      if (['saveProduct', 'deleteProduct', 'confirmDelete', 'loadProducts', 'renderList'].includes(action)) {
        setTimeout(renderFeaturedAdminOptions, 500);
      }
    }, true);
  }

  addResponsiveStyles();
  function initializeEnhancements() {
    enhanceStorefront();
    enhanceAdmin();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancements, { once: true });
  } else {
    initializeEnhancements();
  }
}());
