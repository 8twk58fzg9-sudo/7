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
      /* FINAL 2026 POLISH: clean logo, balanced nav, better customer hero */
      body.ctrax-premium nav{padding:.72rem max(5vw,2rem);gap:1.15rem;align-items:center}
      body.ctrax-premium nav .logo{display:flex;align-items:center;justify-content:flex-start;min-width:178px;max-width:210px;overflow:hidden}
      body.ctrax-premium nav .logo img{width:190px!important;max-width:100%!important;height:auto!important;max-height:66px!important;object-fit:contain!important;background:transparent!important;border-radius:0!important;filter:none!important}
      body.ctrax-premium .nav-right{gap:.72rem;align-items:center}
      body.ctrax-premium .nav-search input{height:48px;border-radius:999px;background:rgba(255,255,255,.86);border:1px solid rgba(15,23,42,.12);box-shadow:0 8px 24px rgba(15,23,42,.05)}
      body.ctrax-premium .cart-btn{height:48px;border-radius:999px;padding:.62rem 1.08rem;font-weight:850}
      body.ctrax-premium nav ul a{font-size:.95rem;font-weight:800;color:#475569}
      body.ctrax-premium nav ul a:hover{color:#1d4ed8}
      body:not(.ctrax-admin-page) .ctrax-featured-admin{display:none!important}
      body.ctrax-premium .hero{position:relative;display:grid!important;grid-template-columns:minmax(420px,1fr) minmax(360px,.92fr);gap:clamp(2rem,4vw,4.8rem);min-height:calc(100vh - 118px);padding-inline:max(6vw,3rem);padding-top:clamp(8rem,10vw,9.5rem)}
      body.ctrax-premium .hero-content{position:relative;z-index:2;align-self:center;min-width:0;display:block!important}
      body.ctrax-premium .hero-visual{align-self:center;min-width:0;width:100%;max-width:680px;justify-self:end}
      body.ctrax-premium .ctrax-featured-hero{grid-template-columns:1fr!important;padding:clamp(1.15rem,2vw,1.7rem);border-radius:30px}
      body.ctrax-premium .ctrax-featured-name{font-size:clamp(2.1rem,4.2vw,4.6rem);word-break:normal;overflow-wrap:anywhere}
      body.ctrax-premium .ctrax-featured-device{min-height:300px;background:linear-gradient(145deg,rgba(255,255,255,.86),rgba(225,237,255,.82))}
      body.ctrax-premium .ctrax-featured-sub{font-size:1rem;max-width:610px}
      body.ctrax-premium .ctrax-topbar{font-size:.8rem}
      @media(max-width:1180px){body.ctrax-premium nav{padding-inline:1.2rem}body.ctrax-premium nav .logo{min-width:148px;max-width:170px}body.ctrax-premium nav .logo img{width:164px!important}body.ctrax-premium nav ul{gap:.85rem}.nav-search input{width:150px!important}.nav-search input:focus{width:190px!important}}
      @media(max-width:980px){body.ctrax-premium .hero{grid-template-columns:1fr;min-height:auto;padding-inline:1.25rem;padding-top:8.5rem}.ctrax-featured-hero{max-width:760px;margin-inline:auto}body.ctrax-premium .hero-visual{justify-self:stretch;max-width:none}}
      @media(max-width:760px){body.ctrax-premium nav .logo{min-width:116px;max-width:140px}body.ctrax-premium nav .logo img{width:132px!important;max-height:52px!important}.ctrax-topbar{display:none!important}body.ctrax-premium .ctrax-topbar+nav,body.ctrax-premium nav.ctrax-offset{top:0}.nav-search input{width:100%!important}.nav-right{width:100%;justify-content:flex-start;overflow-x:auto;padding-bottom:.25rem}body.ctrax-premium .hero{padding-top:6.8rem}.ctrax-featured-device{min-height:220px!important}.ctrax-featured-fallback{font-size:2rem}}

      /* FINAL REQUEST: first-load hero exactly as customer landing page + admin price helper */
      body.ctrax-premium{background:linear-gradient(180deg,#f8fbff 0%,#edf5ff 46%,#f9fbff 100%)!important;color:#0f172a}
      body.ctrax-premium .hero{background:radial-gradient(circle at 82% 20%,rgba(96,165,250,.22),transparent 34%),linear-gradient(90deg,#f8fbff 0%,#f2f7ff 51%,#e8f2ff 100%);overflow:hidden}
      body.ctrax-premium .hero h1{font-size:clamp(4.2rem,8.7vw,7.7rem)!important;line-height:.88!important;letter-spacing:-.085em!important;color:#0b1226;text-wrap:balance;margin-bottom:1.35rem!important}
      body.ctrax-premium .hero p{color:#526174!important;font-size:clamp(1.05rem,1.55vw,1.55rem)!important;line-height:1.35!important;max-width:720px!important}
      body.ctrax-premium .hero-path{border-radius:24px!important;background:rgba(255,255,255,.74)!important;border:1px solid rgba(15,23,42,.08)!important;box-shadow:0 18px 48px rgba(15,23,42,.07)!important}
      body.ctrax-premium .hero-path strong{font-family:Outfit,Inter,sans-serif;color:#0f172a;font-size:1.05rem}
      body.ctrax-premium .hero-path-sub{color:#526174!important}
      body.ctrax-premium .trust-row.hero-cols .trust-item{font-size:.92rem;color:#526174!important}
      body.ctrax-premium .trust-row.hero-cols .trust-item span:first-child{width:18px;height:18px;border-radius:999px;background:#0d9488;color:transparent;display:inline-flex;box-shadow:0 0 0 4px rgba(13,148,136,.08)}
      body.ctrax-premium .ctrax-featured-hero{background:rgba(255,255,255,.84)!important;border-color:rgba(96,165,250,.16)!important;box-shadow:0 30px 80px rgba(15,23,42,.10)!important}
      body.ctrax-premium .ctrax-featured-sub{color:#526174!important}.ctrax-featured-note{color:#526174!important}
      .ctrax-featured-price-wrap{display:flex;align-items:baseline;gap:.65rem;flex-wrap:wrap;margin-right:auto}
      .ctrax-featured-price-old{font-family:Inter,system-ui,sans-serif;font-size:1rem;font-weight:800;color:#64748b;text-decoration:line-through}
      .ctrax-featured-save{display:inline-flex;align-items:center;border-radius:999px;padding:.28rem .55rem;background:#ecfeff;color:#0f766e;border:1px solid rgba(13,148,136,.2);font-size:.72rem;font-weight:950;letter-spacing:.02em}
      .ctrax-price-helper{grid-column:1/-1;border:1px solid rgba(37,99,235,.22);border-radius:16px;background:linear-gradient(180deg,rgba(37,99,235,.08),rgba(37,99,235,.035));padding:.9rem;margin-top:.15rem}
      .ctrax-price-helper-title{display:flex;align-items:center;gap:.45rem;font-weight:900;color:var(--text);font-family:Outfit,Inter,sans-serif;margin-bottom:.3rem}
      .ctrax-price-helper-text{color:var(--muted);font-size:.78rem;line-height:1.45;margin-bottom:.7rem}
      .ctrax-price-helper-actions{display:flex;gap:.45rem;flex-wrap:wrap;align-items:center}.ctrax-price-helper-actions .btn{min-height:38px;padding:.48rem .72rem;font-size:.78rem}
      .ctrax-price-helper-status{color:var(--muted);font-size:.76rem;line-height:1.45;margin-top:.65rem}.ctrax-price-helper-status strong{color:#93c5fd}
      .ctrax-price-helper-query{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#bfdbfe;word-break:break-word}
      @media(max-width:980px){body.ctrax-premium .hero h1{font-size:clamp(3.1rem,14vw,5.2rem)!important}.ctrax-featured-price-wrap{width:100%;justify-content:center}.ctrax-price-helper-actions .btn{flex:1 1 150px}}


      /* production polish: fixed nav, stronger cards, cleaner invoice UI */
      body.ctrax-premium nav .logo{background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important}
      body.ctrax-premium nav .logo img{object-fit:contain!important;background:transparent!important;border-radius:0!important;filter:none!important}
      body.ctrax-premium .nav-cta{display:inline-flex!important;align-items:center!important;justify-content:center!important;white-space:nowrap!important;min-width:max-content!important;width:auto!important;padding:.72rem 1.05rem!important;border-radius:18px!important;line-height:1.1!important;box-shadow:0 12px 28px rgba(37,99,235,.18)!important}
      body.ctrax-premium nav ul{align-items:center!important}
      body.ctrax-premium .pc-card{box-shadow:0 22px 52px rgba(15,23,42,.08)!important}
      body.ctrax-premium .pc-card .add-cart-btn{min-height:48px}
      body.ctrax-premium .product-category-badge,.ctrax-featured-eyebrow{letter-spacing:.09em}
      .ctrax-invoice-preview-modal{position:fixed;inset:0;z-index:1300;display:none;align-items:center;justify-content:center;padding:1rem;background:rgba(2,6,23,.74);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
      .ctrax-invoice-preview-modal.open{display:flex}.ctrax-invoice-preview-box{width:min(1120px,96vw);height:min(860px,92vh);background:#fff;color:#0f172a;border-radius:22px;box-shadow:0 40px 120px rgba(0,0,0,.44);display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(148,163,184,.24)}
      .ctrax-invoice-preview-head{display:flex;align-items:center;justify-content:space-between;gap:.8rem;padding:.85rem 1rem;border-bottom:1px solid #e5e7eb;background:#f8fafc}.ctrax-invoice-preview-title{font-family:Outfit,Inter,sans-serif;font-weight:900;letter-spacing:-.02em}.ctrax-invoice-preview-actions{display:flex;gap:.5rem;flex-wrap:wrap}.ctrax-invoice-preview-frame{flex:1;width:100%;border:0;background:white}.ctrax-invoice-primary{background:#2563eb!important;color:#fff!important;border-color:#2563eb!important}.ctrax-invoice-good{background:rgba(34,197,94,.1)!important;color:#16a34a!important;border-color:rgba(34,197,94,.25)!important}.ctrax-invoice-admin-note{border:1px solid rgba(37,99,235,.18);background:rgba(37,99,235,.06);border-radius:12px;padding:.65rem .75rem;margin-top:.65rem;color:var(--muted);font-size:.76rem;line-height:1.45}
      @media(max-width:760px){.ctrax-invoice-preview-box{height:92vh;border-radius:16px}.ctrax-invoice-preview-head{align-items:flex-start;flex-direction:column}.ctrax-invoice-preview-actions .btn{flex:1 1 auto}.ctrax-invoice-preview-actions{width:100%}}

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
    const comparePrice = Math.max(0, Number(product.compareAt || product.compare_at_price || product.oldPrice || 0));
    const featuredSavings = comparePrice > safePrice ? Math.round(comparePrice - safePrice) : 0;
    const featuredPriceHtml = '<div class="ctrax-featured-price-wrap"><div class="ctrax-featured-price">' + money(safePrice) + '</div>' +
      (featuredSavings ? '<span class="ctrax-featured-price-old">' + money(comparePrice) + '</span><span class="ctrax-featured-save">Ušetríte ' + money(featuredSavings) + '</span>' : '') + '</div>';
    heroVisual.innerHTML = '';
    heroVisual.classList.add('reveal');
    heroVisual.innerHTML = '<div class="ctrax-featured-hero" aria-label="Odporúčaný počítač Computrax">' +
      '<div class="ctrax-featured-copy">' +
        '<div class="ctrax-featured-eyebrow">★ Odporúčaný kus skladom</div>' +
        '<h2 class="ctrax-featured-name">' + safeName + '</h2>' +
        '<p class="ctrax-featured-sub">Odporúčaný skladový kus s jasnými parametrami, zárukou a rýchlym nákupom. Celý katalóg, filtre, detail, košík aj objednávka ostávajú dostupné nižšie.</p>' +
        '<div class="ctrax-featured-specs">' +
          '<div class="ctrax-featured-spec"><span>Procesor</span><b>' + safeHtml(product.cpu || 'Neuvedené') + '</b></div>' +
          '<div class="ctrax-featured-spec"><span>Grafika</span><b>' + safeHtml(product.gpu || 'Neuvedené') + '</b></div>' +
          '<div class="ctrax-featured-spec"><span>RAM</span><b>' + safeHtml(product.ram || 'Neuvedené') + '</b></div>' +
          '<div class="ctrax-featured-spec"><span>Disk</span><b>' + safeHtml(product.ssd || 'Neuvedené') + '</b></div>' +
        '</div>' +
        '<div class="ctrax-featured-actions">' +
          featuredPriceHtml +
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
    if (!isComputraxAdminPage()) return;
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


  function fieldValue(id) {
    return String(document.getElementById(id)?.value || '').trim();
  }

  function productDraftFromAdminForm() {
    return {
      name: fieldValue('f-name'),
      price: Number(String(fieldValue('f-price')).replace(/[^\d.]/g, '')) || 0,
      cpu: fieldValue('f-cpu'),
      gpu: fieldValue('f-gpu'),
      ram: fieldValue('f-ram'),
      ssd: fieldValue('f-ssd'),
      cat: fieldValue('f-cat')
    };
  }

  function storageGbFromText(text) {
    const raw = String(text || '').toLowerCase().replace(',', '.');
    const tb = raw.match(/(\d+(?:\.\d+)?)\s*tb/);
    if (tb) return Math.round(Number(tb[1]) * 1024);
    const gb = raw.match(/(\d+)\s*gb/);
    return gb ? Number(gb[1]) : 0;
  }

  function ramGbFromText(text) {
    const match = String(text || '').match(/(\d+)\s*(?:gb|g\b)?/i);
    return match ? Number(match[1]) : 0;
  }

  function roundToNearest(value, step) {
    return Math.max(step, Math.round(Number(value || 0) / step) * step);
  }

  function estimateNewComparablePrice(draft) {
    const price = Math.max(0, Number(draft.price || 0));
    const gpu = String(draft.gpu || '').toUpperCase();
    const cpu = String(draft.cpu || '').toLowerCase();
    const cat = String(draft.cat || '').toLowerCase();
    let base = cat === 'gaming' ? 900 : cat === 'office' ? 520 : 420;

    const gpuRules = [
      [/RTX\s*5090/, 4300], [/RTX\s*5080/, 3200], [/RTX\s*5070/, 2400], [/RTX\s*4090/, 3300],
      [/RTX\s*4080/, 2550], [/RTX\s*4070/, 1850], [/RTX\s*4060/, 1250], [/RTX\s*3090/, 2200],
      [/RTX\s*3080/, 1650], [/RTX\s*3070/, 1350], [/RTX\s*3060/, 1100], [/RTX\s*2080/, 1150],
      [/GTX\s*1660|GTX\s*1650/, 760], [/RX\s*7900/, 2300], [/RX\s*7800/, 1700], [/RX\s*7700/, 1350],
      [/RX\s*6800|RX\s*6700/, 1250], [/UHD|IRIS|INTEGROVAN/, 560]
    ];
    for (const [re, value] of gpuRules) { if (re.test(gpu)) { base = Math.max(base, value); break; } }

    if (/ryzen\s*9|\bi9\b|i9-/.test(cpu)) base += 420;
    else if (/ryzen\s*7|\bi7\b|i7-/.test(cpu)) base += 260;
    else if (/ryzen\s*5|\bi5\b|i5-/.test(cpu)) base += 140;
    else if (/ryzen\s*3|\bi3\b|i3-/.test(cpu)) base += 80;

    const ram = ramGbFromText(draft.ram);
    if (ram >= 64) base += 260; else if (ram >= 32) base += 150; else if (ram >= 16) base += 80;
    const storage = storageGbFromText(draft.ssd);
    if (storage >= 2000) base += 180; else if (storage >= 1000) base += 110; else if (storage >= 512) base += 70;

    let estimate = Math.max(base, price ? price * 1.45 : 0);
    if (price && estimate < price + 150) estimate = price * 1.35;
    return Math.min(100000, roundToNearest(estimate, 50));
  }

  function buildNewPriceQuery(draft) {
    const parts = [draft.name, draft.cpu, draft.gpu, draft.ram, draft.ssd]
      .map(value => String(value || '').trim())
      .filter(Boolean);
    const core = parts.length ? parts.join(' ') : 'počítač';
    return (core + ' nový cena Slovensko').replace(/\s+/g, ' ').trim();
  }

  function priceSearchUrl(provider, query) {
    const encoded = encodeURIComponent(query);
    if (provider === 'google') return 'https://www.google.com/search?q=' + encoded;
    if (provider === 'heureka') return 'https://www.heureka.sk/?h%5Bfraze%5D=' + encoded;
    if (provider === 'alza') return 'https://www.alza.sk/search.htm?exps=' + encoded;
    if (provider === 'nay') return 'https://www.nay.sk/vyhladavanie?q=' + encoded;
    return 'https://www.google.com/search?q=' + encoded;
  }

  function setCompareField(value, sourceLabel) {
    const input = document.getElementById('f-compare');
    if (!input) return;
    input.value = String(Math.max(0, Math.round(Number(value || 0))));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    const status = document.getElementById('ctrax-price-helper-status');
    if (status) status.innerHTML = '<strong>Nastavené:</strong> cena nového/orientačný pôvodný stav ' + safeHtml(input.value) + '€. Zdroj: ' + safeHtml(sourceLabel || 'odhad') + '. Pred ostrým predajom porovnaj aspoň 1–2 zdroje.';
  }

  async function copyAdminPriceQuery(query) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(query);
      else throw new Error('Clipboard unavailable');
      if (typeof showToast === 'function') showToast('🔎 Vyhľadávací dotaz skopírovaný');
    } catch (e) {
      window.prompt('Skopíruj dotaz:', query);
    }
  }

  function refreshPriceHelperStatus() {
    const status = document.getElementById('ctrax-price-helper-status');
    if (!status) return;
    const draft = productDraftFromAdminForm();
    const query = buildNewPriceQuery(draft);
    const estimate = estimateNewComparablePrice(draft);
    status.innerHTML = 'Dotaz: <span class="ctrax-price-helper-query">' + safeHtml(query) + '</span><br>Orientačný odhad podľa parametrov: <strong>' + money(estimate) + '</strong>. Toto nie je automaticky overená trhová cena; tlačidlá otvoria zdroje na kontrolu.';
  }

  function installNewPriceHelper() {
    if (!isComputraxAdminPage()) return;
    const compare = document.getElementById('f-compare');
    if (!compare || document.getElementById('ctrax-price-helper')) return;
    const group = compare.closest('.form-group') || compare.parentElement;
    if (!group) return;
    const helper = document.createElement('div');
    helper.id = 'ctrax-price-helper';
    helper.className = 'ctrax-price-helper';
    helper.innerHTML = '<div class="ctrax-price-helper-title">💶 Cena nového PC / pôvodná cena</div>' +
      '<div class="ctrax-price-helper-text">Admin vie rýchlo pripraviť porovnávaciu cenu. Použi odhad podľa parametrov alebo otvor zdroje a prepíš presnú cenu do poľa „Cena nového / porovnávacia“.</div>' +
      '<div class="ctrax-price-helper-actions">' +
        '<button type="button" class="btn btn-primary btn-sm" data-ctrax-price-action="estimate">Odhadnúť a vložiť</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-ctrax-price-action="google">Google</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-ctrax-price-action="heureka">Heureka</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-ctrax-price-action="alza">Alza</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-ctrax-price-action="nay">Nay</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-ctrax-price-action="copy">Kopírovať dotaz</button>' +
      '</div>' +
      '<div class="ctrax-price-helper-status" id="ctrax-price-helper-status"></div>';
    group.after(helper);
    helper.addEventListener('click', function (event) {
      const action = event.target.closest?.('[data-ctrax-price-action]')?.dataset.ctraxPriceAction;
      if (!action) return;
      event.preventDefault();
      const draft = productDraftFromAdminForm();
      const query = buildNewPriceQuery(draft);
      if (action === 'estimate') {
        setCompareField(estimateNewComparablePrice(draft), 'automatický odhad podľa parametrov');
        return;
      }
      if (action === 'copy') {
        copyAdminPriceQuery(query);
        return;
      }
      window.open(priceSearchUrl(action, query), '_blank', 'noopener,noreferrer');
      refreshPriceHelperStatus();
    });
    ['f-name','f-price','f-cpu','f-gpu','f-ram','f-ssd','f-cat'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', refreshPriceHelperStatus);
      if (el) el.addEventListener('change', refreshPriceHelperStatus);
    });
    refreshPriceHelperStatus();
  }



  // ============================================================
  //  AUTOMATIC INVOICES FOR ADMIN
  // ============================================================
  const AUTO_INVOICE_SETTINGS_KEY = 'ctrax_auto_invoice_settings_v1';
  let autoInvoiceBusy = false;
  let autoInvoiceInitialized = false;

  function autoInvoiceDefaultSettings() {
    return {
      enabled: true,
      trigger: 'paid_or_confirmed',
      markStatus: 'created'
    };
  }

  function readAutoInvoiceSettings() {
    try {
      const raw = localStorage.getItem(AUTO_INVOICE_SETTINGS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return { ...autoInvoiceDefaultSettings(), ...(parsed && typeof parsed === 'object' ? parsed : {}) };
    } catch (e) {
      localStorage.removeItem(AUTO_INVOICE_SETTINGS_KEY);
      return autoInvoiceDefaultSettings();
    }
  }

  function saveAutoInvoiceSettings(settings) {
    const clean = {
      enabled: Boolean(settings.enabled),
      trigger: ['paid_or_confirmed', 'paid', 'confirmed', 'manual'].includes(settings.trigger) ? settings.trigger : 'paid_or_confirmed',
      markStatus: ['created', 'draft'].includes(settings.markStatus) ? settings.markStatus : 'created'
    };
    localStorage.setItem(AUTO_INVOICE_SETTINGS_KEY, JSON.stringify(clean));
    return clean;
  }

  function autoInvoiceStatusText(message, isError) {
    const el = document.getElementById('ctrax-auto-invoice-status');
    if (!el) return;
    el.textContent = message || '';
    el.style.color = isError ? '#dc2626' : '#4b5563';
  }

  function autoInvoiceCanRun() {
    return typeof invoiceNumber === 'function' &&
      typeof allOrders !== 'undefined' && Array.isArray(allOrders) &&
      typeof renderOrders === 'function';
  }

  function autoInvoiceOrderKey(order) {
    return String(order?.id ?? order?.order_number ?? '');
  }

  function autoInvoiceAlreadyExists(order) {
    const status = String(order?.invoice_status || 'not_created');
    return Boolean(order?.invoice_reference) || status === 'created' || status === 'sent';
  }

  function autoInvoiceOrderQualifies(order, settings) {
    if (!order || autoInvoiceAlreadyExists(order)) return false;
    if (String(order.status || 'new') === 'cancelled') return false;
    if (!Array.isArray(order.items) || !order.items.length) return false;
    if (Number(order.total || 0) <= 0) return false;
    const status = String(order.status || 'new');
    const payment = String(order.payment_status || 'pending');
    const isConfirmed = ['confirmed', 'packed', 'sent', 'done'].includes(status);
    const isPaid = payment === 'paid';
    if (settings.trigger === 'manual') return false;
    if (settings.trigger === 'paid') return isPaid;
    if (settings.trigger === 'confirmed') return isConfirmed;
    return isPaid || isConfirmed;
  }

  function autoInvoiceCandidateCounts(settings = readAutoInvoiceSettings()) {
    if (!autoInvoiceCanRun()) return { total: 0, candidates: 0, created: 0 };
    const created = allOrders.filter(autoInvoiceAlreadyExists).length;
    const candidates = allOrders.filter(order => autoInvoiceOrderQualifies(order, settings)).length;
    return { total: allOrders.length, candidates, created };
  }

  function renderAutoInvoicePanel() {
    const settings = readAutoInvoiceSettings();
    const enabled = document.getElementById('ctrax-auto-invoice-enabled');
    const trigger = document.getElementById('ctrax-auto-invoice-trigger');
    const mark = document.getElementById('ctrax-auto-invoice-status-select');
    if (enabled) enabled.checked = settings.enabled;
    if (trigger) trigger.value = settings.trigger;
    if (mark) mark.value = settings.markStatus;
    const counts = autoInvoiceCandidateCounts(settings);
    autoInvoiceStatusText(
      `Faktúry vytvorené: ${counts.created}/${counts.total}. Čaká na automatické vytvorenie: ${counts.candidates}.`,
      false
    );
  }

  async function autoInvoicePatchOrder(order, settings) {
    const reference = order.invoice_reference || invoiceNumber(order);
    const patch = {
      invoice_status: settings.markStatus || 'created',
      invoice_reference: reference,
      updated_at: new Date().toISOString()
    };
    const isLocal = (typeof useLocalStorage !== 'undefined' && useLocalStorage) || order.sync_status === 'pending';
    const key = autoInvoiceOrderKey(order);
    if (isLocal) {
      allOrders = allOrders.map(function (existing) {
        return autoInvoiceOrderKey(existing) === key ? { ...existing, ...patch } : existing;
      });
      try {
        localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(allOrders));
        localStorage.setItem('ctrax_orders_updated_at', String(Date.now()));
      } catch (e) {}
      return { ...order, ...patch };
    }
    if (typeof sb !== 'function') throw new Error('Supabase zápis nie je dostupný v admine.');
    if (typeof ensureSupabaseWriteAuth === 'function') {
      const ok = await ensureSupabaseWriteAuth(false);
      if (!ok) throw new Error('Najprv pripoj Supabase admin zápis hore v admine.');
    }
    await sb('PATCH', `orders?id=eq.${encodeURIComponent(order.id)}`, patch);
    allOrders = allOrders.map(function (existing) {
      return autoInvoiceOrderKey(existing) === key ? { ...existing, ...patch } : existing;
    });
    if (typeof logAdminEvent === 'function') {
      try {
        await logAdminEvent('auto_invoice_create', 'order', order.id, `Automatická faktúra ${order.order_number || order.id}: ${reference}`, patch);
      } catch (e) {}
    }
    return { ...order, ...patch };
  }

  async function runAutoInvoiceSweep(manual) {
    if (autoInvoiceBusy || !autoInvoiceCanRun()) return 0;
    const settings = readAutoInvoiceSettings();
    if (!manual && !settings.enabled) return 0;
    const candidates = allOrders.filter(order => autoInvoiceOrderQualifies(order, settings));
    if (!candidates.length) {
      if (manual) autoInvoiceStatusText('Žiadne objednávky momentálne nepotrebujú novú faktúru.', false);
      renderAutoInvoicePanel();
      return 0;
    }
    autoInvoiceBusy = true;
    autoInvoiceStatusText(`Vytváram faktúry: 0/${candidates.length}...`, false);
    let done = 0;
    try {
      for (const order of candidates) {
        await autoInvoicePatchOrder(order, settings);
        done += 1;
        autoInvoiceStatusText(`Vytváram faktúry: ${done}/${candidates.length}...`, false);
      }
      renderOrders();
      renderAutoInvoicePanel();
      if (typeof showToast === 'function') showToast(`🧾 Automaticky vytvorených faktúr: ${done}`);
      return done;
    } catch (error) {
      autoInvoiceStatusText(String(error?.message || error), true);
      if (typeof showToast === 'function') showToast('⚠️ Automatické faktúry: ' + String(error?.message || error), true);
      return done;
    } finally {
      autoInvoiceBusy = false;
    }
  }

  function installAutomaticInvoicePanel() {
    if (!isComputraxAdminPage() || document.getElementById('ctrax-auto-invoice-panel')) return;
    const ordersSection = document.querySelector('.orders-wrap[data-admin-section="orders"]');
    if (!ordersSection) return;
    const panel = document.createElement('div');
    panel.id = 'ctrax-auto-invoice-panel';
    panel.className = 'ctrax-auto-invoice-panel';
    panel.innerHTML = `
      <div class="ctrax-auto-invoice-copy">
        <strong>Automatické faktúry</strong>
        <span>Keď objednávka splní pravidlo, admin jej automaticky doplní číslo faktúry a stav. HTML faktúru vieš hneď stiahnuť alebo vytlačiť.</span>
        <small>Pre plne odoslané účtovné faktúry cez iDoklad/SuperFaktúru treba backend/API secrets. Toto je bezpečná GitHub Pages automatizácia v admine.</small>
      </div>
      <div class="ctrax-auto-invoice-controls">
        <label><input type="checkbox" id="ctrax-auto-invoice-enabled"> Zapnúť automatiku</label>
        <select id="ctrax-auto-invoice-trigger" aria-label="Kedy vytvoriť faktúru">
          <option value="paid_or_confirmed">Po zaplatení alebo potvrdení</option>
          <option value="paid">Iba po zaplatení</option>
          <option value="confirmed">Po potvrdení objednávky</option>
          <option value="manual">Iba ručne tlačidlom</option>
        </select>
        <select id="ctrax-auto-invoice-status-select" aria-label="Stav vytvorenej faktúry">
          <option value="created">Vytvorená</option>
          <option value="draft">Koncept</option>
        </select>
        <button type="button" class="btn btn-primary btn-sm" data-auto-invoice-action="run-now">Vytvoriť chýbajúce</button>
        <button type="button" class="btn btn-ghost btn-sm" data-auto-invoice-action="preview-first">Náhľad prvej faktúry</button>
        <button type="button" class="btn btn-ghost btn-sm" data-auto-invoice-action="download-visible">Stiahnuť viditeľné faktúry</button>
      </div>
      <div id="ctrax-auto-invoice-status" class="ctrax-auto-invoice-status" role="status" aria-live="polite"></div>`;
    const bulk = document.getElementById('bulk-order-bar');
    const grid = document.getElementById('orders-grid');
    ordersSection.insertBefore(panel, bulk || grid || null);
    renderAutoInvoicePanel();
  }

  function readAutoInvoiceForm() {
    const settings = readAutoInvoiceSettings();
    settings.enabled = Boolean(document.getElementById('ctrax-auto-invoice-enabled')?.checked);
    settings.trigger = document.getElementById('ctrax-auto-invoice-trigger')?.value || settings.trigger;
    settings.markStatus = document.getElementById('ctrax-auto-invoice-status-select')?.value || settings.markStatus;
    saveAutoInvoiceSettings(settings);
    renderAutoInvoicePanel();
    if (settings.enabled) setTimeout(function () { runAutoInvoiceSweep(false); }, 80);
  }

  function patchAutoInvoiceLifecycle() {
    if (autoInvoiceInitialized) return;
    autoInvoiceInitialized = true;
    const tryPatch = function () {
      if (typeof loadOrders === 'function' && !loadOrders.__ctraxAutoInvoicePatched) {
        const originalLoadOrders = loadOrders;
        loadOrders = async function () {
          const result = await originalLoadOrders.apply(this, arguments);
          installAutomaticInvoicePanel();
          renderAutoInvoicePanel();
          setTimeout(function () { runAutoInvoiceSweep(false); }, 120);
          return result;
        };
        loadOrders.__ctraxAutoInvoicePatched = true;
      }
      if (typeof updateOrderStatus === 'function' && !updateOrderStatus.__ctraxAutoInvoicePatched) {
        const originalUpdateOrderStatus = updateOrderStatus;
        updateOrderStatus = async function () {
          const result = await originalUpdateOrderStatus.apply(this, arguments);
          setTimeout(function () { runAutoInvoiceSweep(false); }, 150);
          return result;
        };
        updateOrderStatus.__ctraxAutoInvoicePatched = true;
      }
      if (typeof updateOrderPaymentStatus === 'function' && !updateOrderPaymentStatus.__ctraxAutoInvoicePatched) {
        const originalUpdateOrderPaymentStatus = updateOrderPaymentStatus;
        updateOrderPaymentStatus = async function () {
          const result = await originalUpdateOrderPaymentStatus.apply(this, arguments);
          setTimeout(function () { runAutoInvoiceSweep(false); }, 150);
          return result;
        };
        updateOrderPaymentStatus.__ctraxAutoInvoicePatched = true;
      }
      installAutomaticInvoicePanel();
      renderAutoInvoicePanel();
    };
    tryPatch();
    setTimeout(tryPatch, 250);
    setTimeout(function () { runAutoInvoiceSweep(false); }, 700);

    document.addEventListener('click', function (event) {
      const action = event.target.closest?.('[data-auto-invoice-action]')?.dataset.autoInvoiceAction;
      if (!action) return;
      event.preventDefault();
      event.stopPropagation();
      if (action === 'run-now') runAutoInvoiceSweep(true);
      if (action === 'preview-first') {
        const orders = typeof getFilteredOrders === 'function' ? getFilteredOrders() : (typeof allOrders !== 'undefined' ? allOrders : []);
        const order = Array.isArray(orders) ? orders.find(function (item) { return item && Array.isArray(item.items) && item.items.length; }) : null;
        if (order) ctraxOpenInvoicePreview(order.id); else if (typeof showToast === 'function') showToast('Nie je dostupná objednávka pre náhľad faktúry.', true);
      }
      if (action === 'download-visible' && typeof downloadVisibleInvoicesHtml === 'function') downloadVisibleInvoicesHtml();
    }, true);

    document.addEventListener('change', function (event) {
      if (event.target && ['ctrax-auto-invoice-enabled', 'ctrax-auto-invoice-trigger', 'ctrax-auto-invoice-status-select'].includes(event.target.id)) {
        readAutoInvoiceForm();
      }
    }, true);
  }


  // ============================================================
  //  INVOICE PREVIEW + DOWNLOAD POLISH
  // ============================================================
  function ctraxAdminOrderById(id) {
    try {
      const list = typeof allOrders !== 'undefined' && Array.isArray(allOrders) ? allOrders : [];
      return list.find(function (order) { return Number(order.id) === Number(id); }) || null;
    } catch (e) {
      return null;
    }
  }

  function ctraxInvoiceFileName(order) {
    try {
      const number = typeof invoiceNumber === 'function' ? invoiceNumber(order) : (order?.invoice_reference || order?.order_number || 'faktura');
      return String(number || 'faktura').replace(/[^a-z0-9_.-]+/gi, '-').replace(/^-+|-+$/g, '') + '.html';
    } catch (e) {
      return 'faktura.html';
    }
  }

  function ctraxInvoiceHtml(order) {
    if (!order) throw new Error('Objednávka sa nenašla.');
    if (typeof invoiceHtml !== 'function') throw new Error('Fakturačný modul nie je dostupný.');
    return invoiceHtml(order);
  }

  function ctraxDownloadInvoice(id) {
    const order = ctraxAdminOrderById(id);
    if (!order) {
      if (typeof showToast === 'function') showToast('Objednávka sa nenašla', true);
      return;
    }
    try {
      const html = ctraxInvoiceHtml(order);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ctraxInvoiceFileName(order);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      if (typeof showToast === 'function') showToast('Faktúra stiahnutá');
    } catch (error) {
      if (typeof showToast === 'function') showToast(String(error?.message || error), true);
    }
  }

  function ctraxEnsureInvoicePreviewModal() {
    let modal = document.getElementById('ctrax-invoice-preview-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'ctrax-invoice-preview-modal';
    modal.className = 'ctrax-invoice-preview-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Náhľad faktúry');
    modal.innerHTML = '<div class="ctrax-invoice-preview-box"><div class="ctrax-invoice-preview-head"><div><div class="ctrax-invoice-preview-title">Náhľad faktúry</div><div id="ctrax-invoice-preview-sub" style="font-size:.82rem;color:#64748b;margin-top:.12rem"></div></div><div class="ctrax-invoice-preview-actions"><button type="button" class="btn btn-primary btn-sm" data-ctrax-invoice-action="download-current">Stiahnuť faktúru</button><button type="button" class="btn btn-ghost btn-sm" data-ctrax-invoice-action="print-current">Tlačiť / uložiť PDF</button><button type="button" class="btn btn-ghost btn-sm" data-ctrax-invoice-action="close-preview">Zavrieť</button></div></div><iframe class="ctrax-invoice-preview-frame" id="ctrax-invoice-preview-frame" title="Náhľad faktúry"></iframe></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function (event) {
      if (event.target === modal) ctraxCloseInvoicePreview();
    });
    return modal;
  }

  function ctraxOpenInvoicePreview(id) {
    const order = ctraxAdminOrderById(id);
    if (!order) {
      if (typeof showToast === 'function') showToast('Objednávka sa nenašla', true);
      return;
    }
    try {
      const modal = ctraxEnsureInvoicePreviewModal();
      modal.dataset.orderId = String(id);
      const sub = document.getElementById('ctrax-invoice-preview-sub');
      if (sub) sub.textContent = (order.order_number || ('Objednávka #' + order.id)) + ' · ' + ctraxInvoiceFileName(order);
      const frame = document.getElementById('ctrax-invoice-preview-frame');
      const html = ctraxInvoiceHtml(order);
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (frame) {
        frame.srcdoc = html;
      } else {
        const win = window.open('', '_blank', 'noopener,noreferrer');
        if (win) { win.document.open(); win.document.write(html); win.document.close(); }
      }
    } catch (error) {
      if (typeof showToast === 'function') showToast(String(error?.message || error), true);
    }
  }

  function ctraxPrintInvoicePreview() {
    const frame = document.getElementById('ctrax-invoice-preview-frame');
    try {
      frame?.contentWindow?.focus();
      frame?.contentWindow?.print();
    } catch (error) {
      if (typeof showToast === 'function') showToast('Tlač z náhľadu nie je dostupná v tomto prehliadači.', true);
    }
  }

  function ctraxCloseInvoicePreview() {
    const modal = document.getElementById('ctrax-invoice-preview-modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function ctraxUpgradeInvoiceButtons(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-admin-action="copyOrderInvoiceDraft"]').forEach(function (button) {
      if (button.dataset.ctraxInvoiceCopyRenamed) return;
      button.dataset.ctraxInvoiceCopyRenamed = '1';
      button.textContent = 'Kopírovať podklad';
      button.title = 'Skopíruje fakturačný podklad do schránky.';
    });
    scope.querySelectorAll('[data-admin-action="downloadOrderInvoiceHtml"]').forEach(function (button) {
      if (button.dataset.ctraxInvoiceDownloadRenamed) return;
      button.dataset.ctraxInvoiceDownloadRenamed = '1';
      button.textContent = 'Stiahnuť faktúru';
      button.classList.add('ctrax-invoice-primary');
      button.title = 'Stiahne faktúru ako HTML súbor. Otvoríš ju v prehliadači a môžeš uložiť ako PDF.';
      const id = button.dataset.id || button.getAttribute('data-id') || '';
      if (id && !button.parentElement?.querySelector('[data-ctrax-invoice-action="preview"][data-id="' + CSS.escape(id) + '"]')) {
        const preview = document.createElement('button');
        preview.type = 'button';
        preview.className = 'btn btn-ghost btn-sm ctrax-invoice-good';
        preview.dataset.ctraxInvoiceAction = 'preview';
        preview.dataset.id = id;
        preview.textContent = 'Náhľad faktúry';
        preview.title = 'Ukáže faktúru presne tak, ako sa stiahne.';
        button.before(preview);
      }
    });
    scope.querySelectorAll('.order-card').forEach(function (card) {
      if (card.dataset.ctraxInvoiceNote) return;
      const download = card.querySelector('[data-admin-action="downloadOrderInvoiceHtml"], [data-ctrax-invoice-action="download"]');
      if (!download) return;
      card.dataset.ctraxInvoiceNote = '1';
      const note = document.createElement('div');
      note.className = 'ctrax-invoice-admin-note';
      note.textContent = 'Faktúru môžeš najprv otvoriť cez Náhľad faktúry a potom ju stiahnuť alebo vytlačiť/uložiť ako PDF.';
      const actions = download.closest('.order-actions') || download.parentElement;
      if (actions) actions.after(note);
    });
  }

  function ctraxPatchInvoiceRenderLifecycle() {
    if (!isComputraxAdminPage() || window.__CTRX_INVOICE_PREVIEW_PATCHED__) return;
    window.__CTRX_INVOICE_PREVIEW_PATCHED__ = true;
    const patch = function () {
      if (typeof renderOrders === 'function' && !renderOrders.__ctraxInvoiceUiPatched) {
        const originalRenderOrders = renderOrders;
        renderOrders = function () {
          const result = originalRenderOrders.apply(this, arguments);
          setTimeout(function () { ctraxUpgradeInvoiceButtons(document); }, 20);
          return result;
        };
        renderOrders.__ctraxInvoiceUiPatched = true;
      }
      ctraxUpgradeInvoiceButtons(document);
    };
    patch();
    setTimeout(patch, 250);
    const grid = document.getElementById('orders-grid');
    if (grid) {
      new MutationObserver(function () { ctraxUpgradeInvoiceButtons(grid); }).observe(grid, { childList: true, subtree: true });
    }
    document.addEventListener('click', function (event) {
      const actionButton = event.target.closest?.('[data-ctrax-invoice-action]');
      if (!actionButton) return;
      const action = actionButton.dataset.ctraxInvoiceAction;
      event.preventDefault();
      event.stopPropagation();
      if (action === 'preview') ctraxOpenInvoicePreview(actionButton.dataset.id || '');
      if (action === 'download') ctraxDownloadInvoice(actionButton.dataset.id || '');
      if (action === 'download-current') {
        const modal = document.getElementById('ctrax-invoice-preview-modal');
        ctraxDownloadInvoice(modal?.dataset.orderId || '');
      }
      if (action === 'print-current') ctraxPrintInvoicePreview();
      if (action === 'close-preview') ctraxCloseInvoicePreview();
    }, true);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && document.getElementById('ctrax-invoice-preview-modal')?.classList.contains('open')) {
        ctraxCloseInvoicePreview();
      }
    });
  }

  function isComputraxAdminPage() {
    return /admin_2(?:\.html)?$/i.test(location.pathname) ||
      Boolean(document.querySelector('[data-admin-action], #gate, .gate, #stats-bar, .admin-nav'));
  }

  function enhanceAdmin() {
    if (!isComputraxAdminPage()) return;
    document.body.classList.add('ctrax-admin-page');
    installFeaturedAdminPanel();
    installNewPriceHelper();
    patchAutoInvoiceLifecycle();
    ctraxPatchInvoiceRenderLifecycle();
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
        setTimeout(function () { adminImageReadyMessage(); installNewPriceHelper(); refreshPriceHelperStatus(); }, 80);
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


/* ============================================================
   COMPUTRAX HIGH LEVEL SALES UX LAYER
   Adds guided entry, stronger product cards/detail, checkout cues,
   B2B route and admin merchandising helpers without removing original code.
   ============================================================ */
(function(){
  'use strict';
  if (window.__CTRX_HIGH_LEVEL_SALES_LAYER__) return;
  window.__CTRX_HIGH_LEVEL_SALES_LAYER__ = true;

  function onReady(fn){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once:true });
    else fn();
  }
  function safe(value){
    return String(value ?? '').replace(/[&<>"']/g, function(ch){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]);});
  }
  function money(value){
    var n = Number(value || 0);
    try { if (typeof window.money === 'function') return window.money(n); } catch(e) {}
    return Math.round(n) + '€';
  }
  function pageIsAdmin(){
    return /admin_2(?:\.html)?$/i.test(location.pathname) || !!document.querySelector('[data-admin-action], #gate, .gate, #stats-bar, .admin-nav');
  }
  function pageIsStore(){ return !pageIsAdmin(); }
  function allPublicProducts(){
    try {
      if (typeof activeProducts !== 'undefined' && Array.isArray(activeProducts) && activeProducts.length) return activeProducts;
    } catch(e) {}
    try {
      if (typeof window.PRODUCTS_DATA !== 'undefined' && Array.isArray(window.PRODUCTS_DATA)) return window.PRODUCTS_DATA;
    } catch(e) {}
    return [];
  }
  function findProductByName(name){
    var key = String(name || '').trim();
    if (!key) return null;
    try { if (typeof products !== 'undefined' && products && products[key]) return products[key]; } catch(e) {}
    var low = key.toLowerCase();
    return allPublicProducts().find(function(p){ return String(p.name || '').toLowerCase() === low; }) || null;
  }
  function productNameFromCard(card){
    return card?.getAttribute('data-product-name') || card?.querySelector('.pc-name')?.textContent?.trim() || '';
  }
  function productCategory(p){
    var cat = String(p?.cat || '').toLowerCase();
    if (cat === 'gaming') return 'Herný výkon';
    if (cat === 'office') return 'Práca a škola';
    if (cat === 'retro') return 'Retro / hobby';
    return 'Univerzálne použitie';
  }
  function performanceLabel(p){
    var text = [p?.gpu, p?.cpu, p?.ram].join(' ').toLowerCase();
    if (/rtx\s*(4090|4080|5090|5080|4070|7900|7800)/i.test(text)) return '1440p / 4K hry';
    if (/rtx\s*(3060|3070|3080|4060|2060|2070|2080)|gtx\s*(1660|1650)|rx\s*(6600|6700|6800)/i.test(text)) return '1080p / 1440p hry';
    if (/uhd|iris|integr/i.test(text)) return 'Office, škola, web';
    if (String(p?.cat || '') === 'office') return 'Office, faktúry, škola';
    return 'Bežné používanie';
  }
  function tomorrowLabel(days){
    var d = new Date();
    d.setDate(d.getDate() + Number(days || 2));
    try { return d.toLocaleDateString('sk-SK', { weekday:'short', day:'numeric', month:'numeric' }); }
    catch(e){ return 'do 2 dní'; }
  }
  function installStyles(){
    if (document.getElementById('ctrax-high-sales-styles')) return;
    var style = document.createElement('style');
    style.id = 'ctrax-high-sales-styles';
    style.textContent = `
      .ctrax-choice-gateway{margin:1.35rem 0 1.65rem;display:grid;gap:.9rem;max-width:930px}
      .ctrax-choice-head{display:flex;justify-content:space-between;gap:1rem;align-items:flex-end;flex-wrap:wrap}.ctrax-choice-head strong{font-family:Outfit,Inter,sans-serif;font-size:1.18rem;color:var(--text);letter-spacing:-.03em}.ctrax-choice-head span{color:var(--muted);font-size:.9rem}
      .ctrax-choice-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.75rem}.ctrax-choice-card{border:1px solid rgba(148,163,184,.18);background:rgba(255,255,255,.72);box-shadow:0 14px 32px rgba(15,23,42,.06);border-radius:18px;padding:1rem;text-align:left;cursor:pointer;color:var(--text);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.ctrax-choice-card:hover{transform:translateY(-3px);border-color:rgba(37,99,235,.45);box-shadow:0 18px 46px rgba(37,99,235,.12)}.ctrax-choice-card b{display:block;font-family:Outfit,Inter,sans-serif;font-size:1.03rem;margin:.35rem 0 .18rem}.ctrax-choice-card span{color:var(--muted);font-size:.82rem;line-height:1.35}.ctrax-choice-ico{font-size:1.45rem}
      :root:not([data-theme="light"]) .ctrax-choice-card{background:rgba(255,255,255,.045)}
      .ctrax-catalog-route{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin:0 0 1rem;padding:1rem 1.1rem;border:1px solid rgba(37,99,235,.22);border-radius:18px;background:linear-gradient(90deg,rgba(37,99,235,.10),rgba(34,197,94,.055));color:var(--muted)}.ctrax-catalog-route strong{color:var(--text);font-family:Outfit,Inter,sans-serif}.ctrax-catalog-route button{border:1px solid rgba(37,99,235,.35);background:#2563eb;color:white;border-radius:999px;padding:.58rem .9rem;font-weight:850;cursor:pointer}
      .ctrax-card-sales{border:1px solid rgba(37,99,235,.16);border-radius:14px;background:linear-gradient(180deg,rgba(37,99,235,.07),rgba(255,255,255,.035));padding:.78rem;margin:.85rem 0 .1rem;display:grid;gap:.55rem}.ctrax-card-sales-top{display:flex;align-items:center;justify-content:space-between;gap:.65rem;flex-wrap:wrap}.ctrax-card-for{font-weight:900;color:var(--text);font-size:.82rem}.ctrax-card-save{border-radius:999px;background:#ecfeff;color:#0f766e;border:1px solid rgba(13,148,136,.18);padding:.22rem .5rem;font-weight:950;font-size:.7rem}.ctrax-card-sales-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.42rem}.ctrax-card-mini{border:1px solid rgba(148,163,184,.15);border-radius:10px;background:rgba(255,255,255,.55);padding:.48rem .52rem;min-width:0}.ctrax-card-mini span{display:block;color:var(--muted);font-size:.62rem;font-weight:900;text-transform:uppercase;letter-spacing:.06em}.ctrax-card-mini b{display:block;color:var(--text);font-size:.76rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ctrax-card-protect{display:flex;gap:.38rem;flex-wrap:wrap;color:var(--muted);font-size:.74rem}.ctrax-card-protect span{display:inline-flex;align-items:center;gap:.18rem}
      :root:not([data-theme="light"]) .ctrax-card-mini{background:rgba(255,255,255,.04)}
      .ctrax-detail-pro{margin-top:1rem;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.8rem}.ctrax-detail-pro-card{border:1px solid rgba(148,163,184,.18);border-radius:14px;background:rgba(255,255,255,.05);padding:1rem}.ctrax-detail-pro-card strong{display:block;font-family:Outfit,Inter,sans-serif;font-size:1rem;margin-bottom:.35rem}.ctrax-detail-pro-card p{color:var(--muted);font-size:.86rem;line-height:1.45;margin:0}.ctrax-detail-pro-card ul{margin:.35rem 0 0;padding-left:1.05rem;color:var(--muted);font-size:.84rem;line-height:1.55}
      .ctrax-checkout-upgrade{border:1px solid rgba(37,99,235,.18);border-radius:16px;background:linear-gradient(180deg,rgba(37,99,235,.08),rgba(255,255,255,.03));padding:1rem;margin:0 0 1rem}.ctrax-checkout-upgrade strong{display:block;font-family:Outfit,Inter,sans-serif;margin-bottom:.45rem}.ctrax-checkout-points{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.55rem}.ctrax-checkout-points span{border:1px solid rgba(148,163,184,.16);border-radius:12px;padding:.62rem;background:rgba(255,255,255,.04);color:var(--muted);font-size:.8rem;line-height:1.35}.ctrax-billing-tip{border:1px solid rgba(34,197,94,.24);border-radius:14px;background:rgba(34,197,94,.06);padding:.8rem;margin:.8rem 0;color:var(--muted);font-size:.84rem}.ctrax-billing-tip b{color:var(--text)}
      .ctrax-b2b-premium{margin:1rem 0;padding:1.1rem;border:1px solid rgba(37,99,235,.22);border-radius:20px;background:linear-gradient(135deg,rgba(37,99,235,.09),rgba(34,197,94,.06));display:grid;grid-template-columns:1.2fr .8fr;gap:1rem;align-items:center}.ctrax-b2b-premium strong{font-family:Outfit,Inter,sans-serif;font-size:1.15rem}.ctrax-b2b-premium p{color:var(--muted);margin:.35rem 0 0}.ctrax-b2b-premium a,.ctrax-b2b-premium button{justify-self:end;border:1px solid rgba(37,99,235,.3);background:#2563eb;color:white;text-decoration:none;border-radius:999px;padding:.72rem 1rem;font-weight:900;cursor:pointer}
      .ctrax-merch-helper{grid-column:1/-1;border:1px solid rgba(37,99,235,.24);border-radius:16px;background:linear-gradient(180deg,rgba(37,99,235,.08),rgba(34,197,94,.035));padding:1rem}.ctrax-merch-helper h4{font-family:Outfit,Inter,sans-serif;margin:0 0 .35rem;font-size:1.05rem}.ctrax-merch-helper p{color:var(--muted);font-size:.8rem;margin:0 0 .75rem}.ctrax-merch-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.55rem}.ctrax-merch-grid button{border:1px solid rgba(148,163,184,.2);background:rgba(255,255,255,.05);color:var(--text);border-radius:12px;padding:.72rem .65rem;font-weight:850;text-align:left;cursor:pointer}.ctrax-merch-grid button:hover{border-color:rgba(37,99,235,.45)}.ctrax-merch-grid button span{display:block;color:var(--muted);font-size:.72rem;font-weight:650;margin-top:.12rem}.ctrax-merch-helper .ctrax-field-row{display:grid;grid-template-columns:1fr 1fr;gap:.65rem;margin-top:.85rem}
      @media(max-width:980px){.ctrax-choice-grid,.ctrax-card-sales-grid,.ctrax-detail-pro,.ctrax-checkout-points,.ctrax-merch-grid{grid-template-columns:1fr 1fr}.ctrax-b2b-premium{grid-template-columns:1fr}.ctrax-b2b-premium a,.ctrax-b2b-premium button{justify-self:start}}
      @media(max-width:640px){.ctrax-choice-grid,.ctrax-card-sales-grid,.ctrax-detail-pro,.ctrax-checkout-points,.ctrax-merch-grid,.ctrax-merch-helper .ctrax-field-row{grid-template-columns:1fr}.ctrax-choice-card{padding:.9rem}.ctrax-card-sales{margin:.75rem 0}.ctrax-choice-head{align-items:flex-start}}
    `;
    document.head.appendChild(style);
  }
  function setChoiceFeedback(path){
    var target = document.getElementById('ctrax-catalog-route');
    if (!target) return;
    var msg = {
      all: 'Zobrazuješ celý katalóg. Použi filtre alebo zoradenie podľa ceny a výkonu.',
      gaming: 'Vybral si herné PC. Zoradili sme ťa k zostavám s dedikovanou grafikou.',
      office: 'Vybral si PC na prácu alebo školu. Zobrazujeme úsporné a spoľahlivé zostavy.',
      b2b: 'Pre firmy a školy je najlepší hromadný dopyt s rozpočtom a počtom kusov.'
    }[path] || 'Vyber si počítač podľa použitia alebo rozpočtu.';
    target.querySelector('span').textContent = msg;
  }
  function applyCustomerPath(path){
    if (path === 'b2b') {
      var b2b = document.getElementById('skoly-firmy') || document.querySelector('[id*="firm"]');
      if (b2b) b2b.scrollIntoView({ behavior:'smooth', block:'start' });
      return;
    }
    if (path === 'gaming' || path === 'office') {
      try { if (typeof quickFilter === 'function') quickFilter('cat', path); } catch(e) {}
      var btn = document.querySelector('[data-action="quick-filter"][data-filter-type="cat"][data-filter-value="' + path + '"]') || document.querySelector('[data-filter-type="cat"][data-filter-value="' + path + '"]');
      if (btn) btn.click();
    } else {
      try { if (typeof resetFilters === 'function') resetFilters(); } catch(e) {}
    }
    var catalog = document.getElementById('ponuka');
    if (catalog) catalog.scrollIntoView({ behavior:'smooth', block:'start' });
    setChoiceFeedback(path || 'all');
  }
  function installGuidedGateway(){
    if (!pageIsStore() || document.getElementById('ctrax-choice-gateway')) return;
    var anchor = document.querySelector('.hero-paths') || document.querySelector('.hero-btns') || document.querySelector('.hero-content .trust-row') || document.querySelector('.hero-content');
    if (!anchor) return;
    var block = document.createElement('div');
    block.id = 'ctrax-choice-gateway';
    block.className = 'ctrax-choice-gateway';
    block.innerHTML = '<div class="ctrax-choice-head"><div><strong>Vyber si cestu. Hneď ťa dovedie k správnym PC.</strong><br><span>Bez čítania celej stránky — najprv si vyber, čo potrebuješ.</span></div></div>'+
      '<div class="ctrax-choice-grid">'+
      '<button type="button" class="ctrax-choice-card" data-ctrax-path="all"><div class="ctrax-choice-ico">🖥️</div><b>Všetky počítače</b><span>Celý katalóg, filtre, porovnanie a košík.</span></button>'+
      '<button type="button" class="ctrax-choice-card" data-ctrax-path="gaming"><div class="ctrax-choice-ico">🎮</div><b>Potrebujem herný PC</b><span>PC s grafikou na hry a výkon.</span></button>'+
      '<button type="button" class="ctrax-choice-card" data-ctrax-path="office"><div class="ctrax-choice-ico">💼</div><b>Na prácu alebo školu</b><span>Rýchly a spoľahlivý PC na Office, web a faktúry.</span></button>'+
      '<button type="button" class="ctrax-choice-card" data-ctrax-path="b2b"><div class="ctrax-choice-ico">🏫</div><b>Firma alebo škola</b><span>Viac kusov, faktúra, rovnaké konfigurácie.</span></button>'+
      '</div>';
    anchor.before(block);
    block.addEventListener('click', function(event){
      var card = event.target.closest('[data-ctrax-path]');
      if (!card) return;
      applyCustomerPath(card.dataset.ctraxPath);
    });
  }
  function installCatalogRoute(){
    if (!pageIsStore() || document.getElementById('ctrax-catalog-route')) return;
    var catalog = document.getElementById('ponuka');
    var filters = catalog?.querySelector('.products-controls, .filters-wrap, .filter-row') || catalog?.firstElementChild;
    if (!catalog || !filters) return;
    var row = document.createElement('div');
    row.id = 'ctrax-catalog-route';
    row.className = 'ctrax-catalog-route';
    row.innerHTML = '<div><strong>Rýchly výber podľa použitia</strong><br><span>Vyber si typ PC a stránka ťa prevedie katalógom.</span></div><div style="display:flex;gap:.5rem;flex-wrap:wrap"><button type="button" data-ctrax-path="gaming">Herné PC</button><button type="button" data-ctrax-path="office">Práca/škola</button><button type="button" data-ctrax-path="all">Všetky</button></div>';
    filters.before(row);
    row.addEventListener('click', function(event){
      var btn = event.target.closest('[data-ctrax-path]');
      if (btn) applyCustomerPath(btn.dataset.ctraxPath);
    });
  }
  function upgradeCards(root){
    if (!pageIsStore()) return;
    var scope = root || document;
    scope.querySelectorAll('[data-product-card]').forEach(function(card){
      if (card.dataset.ctraxSalesUpgraded) return;
      var name = productNameFromCard(card);
      var p = findProductByName(name);
      if (!p) return;
      card.dataset.ctraxSalesUpgraded = '1';
      var price = Number(p.price || card.getAttribute('data-price') || 0);
      var compare = Number(p.compareAt || p.compare_at_price || 0);
      var saving = compare > price ? Math.round(compare - price) : 0;
      var layer = document.createElement('div');
      layer.className = 'ctrax-card-sales';
      layer.innerHTML = '<div class="ctrax-card-sales-top"><span class="ctrax-card-for">'+safe(productCategory(p))+' · '+safe(performanceLabel(p))+'</span>'+(saving ? '<span class="ctrax-card-save">Ušetríš '+money(saving)+'</span>' : '')+'</div>'+
        '<div class="ctrax-card-sales-grid">'+
          '<div class="ctrax-card-mini"><span>Test</span><b>'+(p.testedAt || p.tested_at ? 'Computrax Tested' : 'Pred odoslaním')+'</b></div>'+
          '<div class="ctrax-card-mini"><span>Doručenie</span><b>'+safe(p.delivery || 'do 2 dní')+'</b></div>'+
          '<div class="ctrax-card-mini"><span>Ideálne pre</span><b>'+safe(performanceLabel(p))+'</b></div>'+
        '</div>'+
        '<div class="ctrax-card-protect"><span>🛡️ 12M záruka</span><span>↩️ 14 dní vrátenie</span><span>📦 Odhad '+safe(tomorrowLabel(2))+'</span></div>';
      var footer = card.querySelector('.pc-footer');
      if (footer) footer.before(layer); else card.appendChild(layer);
    });
  }
  function observeCardUpgrades(){
    upgradeCards(document);
    var grid = document.getElementById('products-grid');
    if (!grid || grid.dataset.ctraxSalesObserved) return;
    grid.dataset.ctraxSalesObserved = '1';
    new MutationObserver(function(mutations){
      mutations.forEach(function(m){ m.addedNodes.forEach(function(n){ if (n.nodeType === 1) upgradeCards(n); }); });
    }).observe(grid,{childList:true,subtree:true});
  }
  function detailProductFromModal(){
    var title = document.querySelector('#product-detail-wrap .product-detail-head h3')?.textContent?.trim();
    return findProductByName(title);
  }
  function injectDetailPro(){
    var wrap = document.getElementById('product-detail-wrap');
    if (!wrap || wrap.querySelector('.ctrax-detail-pro')) return;
    var p = detailProductFromModal();
    if (!p) return;
    var pro = document.createElement('div');
    pro.className = 'ctrax-detail-pro';
    pro.innerHTML = '<div class="ctrax-detail-pro-card"><strong>Pre koho je tento PC</strong><p>'+safe(productCategory(p))+' — '+safe(performanceLabel(p))+'. Vyber ho, ak chceš hotový skladový kus bez skladania od nuly.</p></div>'+
      '<div class="ctrax-detail-pro-card"><strong>Computrax Protect</strong><ul><li>12 mesiacov záruka</li><li>14 dní vrátenie</li><li>Kontrola pred odoslaním</li><li>Faktúra k objednávke</li></ul></div>'+
      '<div class="ctrax-detail-pro-card"><strong>Doručenie a príprava</strong><p>Objednávku skontrolujeme, pripravíme na odoslanie a pošleme po Slovensku. Doplnkové služby si vyberieš v košíku.</p></div>';
    var perks = wrap.querySelector('.product-detail-perks') || wrap.querySelector('.product-detail-actions');
    if (perks) perks.before(pro); else wrap.appendChild(pro);
  }
  function patchProductDetail(){
    if (!pageIsStore() || window.__CTRX_DETAIL_PRO_PATCHED__) return;
    window.__CTRX_DETAIL_PRO_PATCHED__ = true;
    function tryPatch(){
      try {
        if (typeof openProductDetail === 'function' && !openProductDetail.__ctraxProPatched) {
          var original = openProductDetail;
          openProductDetail = function(){
            var result = original.apply(this, arguments);
            setTimeout(injectDetailPro, 30);
            return result;
          };
          openProductDetail.__ctraxProPatched = true;
        }
      } catch(e) {}
    }
    tryPatch();
    setTimeout(tryPatch,250);
    var wrap = document.getElementById('product-detail-wrap');
    if (wrap) new MutationObserver(function(){ setTimeout(injectDetailPro, 30); }).observe(wrap,{childList:true,subtree:true});
  }
  function enhanceCheckout(){
    if (!pageIsStore()) return;
    var step1 = document.getElementById('wp-1');
    if (step1 && !document.getElementById('ctrax-checkout-step1')) {
      var b = document.createElement('div'); b.id='ctrax-checkout-step1'; b.className='ctrax-checkout-upgrade';
      b.innerHTML='<strong>Pred pokračovaním</strong><div class="ctrax-checkout-points"><span>Vyberáš konkrétny skladový kus.</span><span>Zásoba sa po objednávke rezervuje.</span><span>Pred odoslaním prebehne kontrola.</span></div>';
      step1.prepend(b);
    }
    var step2 = document.getElementById('wp-2');
    if (step2 && !document.getElementById('ctrax-billing-tip')) {
      var tip = document.createElement('div'); tip.id='ctrax-billing-tip'; tip.className='ctrax-billing-tip';
      tip.innerHTML='<b>Firma alebo škola?</b> Doplň názov firmy a IČO. Faktúru si potom vieš pozrieť a stiahnuť v admine.';
      var billingLabel = Array.from(step2.querySelectorAll('.wizard-label')).find(function(el){return /Fakturačné údaje/i.test(el.textContent||'');});
      if (billingLabel) billingLabel.before(tip); else step2.prepend(tip);
    }
  }
  function enhanceB2B(){
    if (!pageIsStore() || document.getElementById('ctrax-b2b-premium')) return;
    var b2b = document.getElementById('skoly-firmy') || document.querySelector('[id*="firm"]');
    if (!b2b) return;
    var block = document.createElement('div');
    block.id = 'ctrax-b2b-premium'; block.className = 'ctrax-b2b-premium';
    block.innerHTML='<div><strong>Balíky pre firmy a školy</strong><p>Viac kusov naraz, fakturácia, rovnaké konfigurácie, príprava Windows a cenová ponuka podľa rozpočtu.</p></div><a href="#kontakt" data-action="open-info-section" data-info-target="kontakt">Vyžiadať ponuku</a>';
    var header = b2b.querySelector('.section-header') || b2b.firstElementChild;
    if (header) header.after(block); else b2b.prepend(block);
  }
  function insertMerchHelper(){
    if (!pageIsAdmin() || document.getElementById('ctrax-merch-helper')) return;
    var modalGrid = document.querySelector('#product-modal .form-grid');
    if (!modalGrid) return;
    var compareField = document.getElementById('f-compare')?.closest('.form-group') || modalGrid.children[3];
    var helper = document.createElement('div');
    helper.id = 'ctrax-merch-helper'; helper.className = 'ctrax-merch-helper';
    helper.innerHTML = '<h4>Predajné nastavenie produktu</h4><p>Rýchlo nastav, pre koho je PC, doplň dôveryhodný text a priprav kartu tak, aby predávala.</p>'+
      '<div class="ctrax-merch-grid">'+
      '<button type="button" data-ctrax-merch="gaming">🎮 Herný PC<span>Tag, kategória, výkonový text</span></button>'+
      '<button type="button" data-ctrax-merch="office">💼 Práca/škola<span>Office, škola, faktúry</span></button>'+
      '<button type="button" data-ctrax-merch="b2b">🏫 Firma/škola<span>Vhodné do hromadnej ponuky</span></button>'+
      '<button type="button" data-ctrax-merch="qc">🛡️ Test hotový<span>Odškrtne QC checklist</span></button>'+
      '</div><div class="ctrax-field-row"><input class="form-input" id="ctrax-price-source" maxlength="120" placeholder="Zdroj ceny nového, napr. Alza / Heureka"><input class="form-input" id="ctrax-delivery-eta" maxlength="80" placeholder="Odhad doručenia, napr. odošleme do 24h"></div>';
    if (compareField) compareField.after(helper); else modalGrid.prepend(helper);
    helper.addEventListener('click', function(event){
      var btn = event.target.closest('[data-ctrax-merch]');
      if (!btn) return;
      applyMerchPreset(btn.dataset.ctraxMerch);
    });
  }
  function applyMerchPreset(type){
    var set = function(id,v){ var el=document.getElementById(id); if(el) el.value=v; };
    var appendNote = function(text){
      var note = document.getElementById('f-condition-note'); if(!note) return;
      var current = String(note.value || '').trim();
      note.value = current ? (current + '\n' + text) : text;
    };
    var priceSource = document.getElementById('ctrax-price-source')?.value?.trim();
    var eta = document.getElementById('ctrax-delivery-eta')?.value?.trim();
    if (type === 'gaming') { set('f-cat','gaming'); set('f-tag','HERNÝ VÝKON'); appendNote('Odporúčané použitie: hranie, výkonnejšie programy a domáce používanie. Orientačný výkon over podľa konkrétnych hier.'); }
    if (type === 'office') { set('f-cat','office'); set('f-tag','PRÁCA A ŠKOLA'); appendNote('Odporúčané použitie: Office, internet, škola, faktúry, e-mail a bežná firemná agenda.'); }
    if (type === 'b2b') { set('f-tag','PRE FIRMY/ŠKOLY'); appendNote('Vhodné aj pre firemný alebo školský nákup. Pri väčšom odbere odporúčame dopyt na viac kusov a zjednotenie konfigurácie.'); }
    if (type === 'qc') {
      try { if (typeof QC_ITEMS !== 'undefined') QC_ITEMS.forEach(function(item){ var el=document.getElementById('qc-item-'+item.key); if(el) el.checked=true; }); } catch(e) {}
      try { if (typeof updateQcStatusPill === 'function') updateQcStatusPill(); } catch(e) {}
      appendNote('Testovací protokol: Windows aktivovaný, disk/RAM skontrolované, teploty a stabilita overené, zariadenie vyčistené a pripravené na používanie.');
    }
    if (priceSource) appendNote('Cena nového / porovnanie: zdroj ' + priceSource + ', overené ' + new Date().toLocaleDateString('sk-SK') + '.');
    if (eta) set('f-delivery', eta);
    if (typeof showToast === 'function') showToast('Predajné nastavenie doplnené');
  }
  function refreshLoops(){
    installGuidedGateway(); installCatalogRoute(); observeCardUpgrades(); enhanceCheckout(); enhanceB2B(); patchProductDetail(); insertMerchHelper();
  }
  onReady(function(){
    installStyles();
    refreshLoops();
    setTimeout(refreshLoops, 400);
    setTimeout(refreshLoops, 1200);
    document.addEventListener('click', function(event){
      var path = event.target.closest?.('[data-ctrax-path]')?.dataset.ctraxPath;
      if (path) applyCustomerPath(path);
      if (event.target.closest?.('[data-admin-action="openModal"], [data-admin-action="openEdit"]')) setTimeout(insertMerchHelper, 120);
    }, true);
    if (pageIsStore()) {
      var bodyObserver = new MutationObserver(function(){ observeCardUpgrades(); enhanceCheckout(); enhanceB2B(); });
      bodyObserver.observe(document.body, { childList:true, subtree:true });
    }
  });
}());
