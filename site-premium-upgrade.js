(function(){
  'use strict';
  if (window.__CTRX_PREMIUM_UPGRADE__) return;
  window.__CTRX_PREMIUM_UPGRADE__ = true;

  var cfg = window.COMPUTRAX_CONFIG || {};
  function qs(s,r){ return (r||document).querySelector(s); }
  function qsa(s,r){ return Array.from((r||document).querySelectorAll(s)); }
  function isAdmin(){ return /admin_2\.html(?:$|[?#])/i.test(location.pathname); }
  function isProducts(){ return /\/produkty\/?(?:index\.html)?$/i.test(location.pathname); }
  function isHome(){ var p = location.pathname.replace(/\/+/g,'/'); return /\/$/.test(p) || /\/index\.html$/i.test(p) || p === ''; }
  function safeText(v){ return String(v == null ? '' : v).trim(); }
  function getProducts(){
    try { if (typeof activeProducts !== 'undefined' && Array.isArray(activeProducts) && activeProducts.length) return activeProducts; } catch(e) {}
    try { if (Array.isArray(window.allProducts) && window.allProducts.length) return window.allProducts; } catch(e) {}
    try { if (Array.isArray(window.PRODUCTS_DATA) && window.PRODUCTS_DATA.length) return window.PRODUCTS_DATA; } catch(e) {}
    return [];
  }
  function addStyle(){
    if (qs('#ctrax-premium-upgrade-style')) return;
    var st = document.createElement('style');
    st.id = 'ctrax-premium-upgrade-style';
    st.textContent = [
      ':root{--ctrax-premium-blue:#2563eb;--ctrax-premium-ink:#0f172a;--ctrax-premium-soft:#f8fbff}',
      'body:not(.ctrax-admin-page){text-rendering:optimizeLegibility}',
      'body:not(.ctrax-admin-page) nav{border-bottom:1px solid rgba(15,23,42,.08)!important;background:rgba(255,255,255,.82)!important;backdrop-filter:blur(20px)!important}',
      'body:not(.ctrax-admin-page) .nav-cta,body:not(.ctrax-admin-page) .hero a,body:not(.ctrax-admin-page) .wizard-btn{box-shadow:0 12px 34px rgba(37,99,235,.22)}',
      'body:not(.ctrax-admin-page) .pc-card,body:not(.ctrax-admin-page) .card,body:not(.ctrax-admin-page) .hero-path-card{border-color:rgba(15,23,42,.08)!important}',
      'body:not(.ctrax-admin-page) .pc-card{transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease!important}',
      'body:not(.ctrax-admin-page) .pc-card:hover{box-shadow:0 24px 70px rgba(15,23,42,.16)!important;border-color:rgba(37,99,235,.28)!important}',
      '.ctrax-premium-hero{width:min(1180px,calc(100% - 32px));margin:1.05rem auto 1rem;padding:clamp(1.2rem,4vw,3.2rem);border-radius:34px;background:radial-gradient(circle at 82% 15%,rgba(37,99,235,.18),transparent 34%),linear-gradient(135deg,#ffffff,#eef6ff);box-shadow:0 28px 90px rgba(15,23,42,.10);display:grid;grid-template-columns:minmax(0,1.06fr) minmax(280px,.94fr);gap:clamp(1rem,3vw,2rem);align-items:center;overflow:hidden}',
      '.ctrax-premium-copy{display:grid;gap:.8rem}.ctrax-premium-kicker{display:inline-flex;width:max-content;border-radius:999px;background:#dbeafe;color:#1d4ed8;padding:.42rem .72rem;font-weight:950;font-size:.78rem}.ctrax-premium-hero h1{font-size:clamp(2.35rem,6vw,5.8rem);letter-spacing:-.08em;line-height:.92;margin:0;color:#0f172a}.ctrax-premium-hero p{font-size:clamp(1rem,1.45vw,1.18rem);line-height:1.62;color:#475569;max-width:720px;margin:0}.ctrax-premium-actions{display:flex;gap:.65rem;flex-wrap:wrap}.ctrax-premium-actions a,.ctrax-premium-actions button{border:0;border-radius:999px;padding:.92rem 1.12rem;font-weight:950;text-decoration:none;cursor:pointer}.ctrax-premium-actions a{background:#2563eb;color:white}.ctrax-premium-actions button{background:#0f172a;color:white}',
      '.ctrax-premium-visual{display:grid;gap:.75rem}.ctrax-premium-device{border-radius:30px;background:linear-gradient(150deg,#111827,#1e293b);color:#fff;padding:1.1rem;min-height:260px;display:grid;align-content:end;position:relative;overflow:hidden}.ctrax-premium-device:before{content:"";position:absolute;inset:18px;border-radius:22px;border:1px solid rgba(255,255,255,.13);background:linear-gradient(135deg,rgba(96,165,250,.22),rgba(255,255,255,.04));}.ctrax-premium-device:after{content:"PC";position:absolute;right:24px;top:20px;font-size:5rem;line-height:1;font-weight:950;color:rgba(255,255,255,.08)}.ctrax-premium-device b,.ctrax-premium-device span{position:relative}.ctrax-premium-device b{font-size:1.35rem}.ctrax-premium-device span{color:#cbd5e1;margin-top:.35rem;display:block}.ctrax-premium-mini{display:grid;grid-template-columns:repeat(3,1fr);gap:.65rem}.ctrax-premium-mini div{background:#fff;border:1px solid rgba(15,23,42,.08);border-radius:18px;padding:.8rem;box-shadow:0 12px 36px rgba(15,23,42,.06)}.ctrax-premium-mini b{display:block;color:#0f172a}.ctrax-premium-mini span{display:block;color:#64748b;font-size:.78rem;margin-top:.18rem}',
      '.ctrax-premium-proof{width:min(1180px,calc(100% - 32px));margin:1rem auto 1.4rem;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.75rem}.ctrax-premium-proof article{background:#fff;border:1px solid rgba(15,23,42,.08);border-radius:22px;padding:1rem;box-shadow:0 14px 42px rgba(15,23,42,.06)}.ctrax-premium-proof b{display:block;color:#0f172a}.ctrax-premium-proof span{display:block;color:#64748b;font-size:.86rem;line-height:1.45;margin-top:.35rem}',
      '.ctrax-premium-process{width:min(1180px,calc(100% - 32px));margin:1rem auto 2rem;padding:clamp(1rem,3vw,1.5rem);border-radius:28px;background:#0f172a;color:#fff}.ctrax-premium-process h2{font-size:clamp(1.7rem,3vw,3rem);letter-spacing:-.055em;margin:.1rem 0 .8rem}.ctrax-premium-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.7rem}.ctrax-premium-steps div{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:.95rem}.ctrax-premium-steps strong{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#2563eb;margin-bottom:.55rem}.ctrax-premium-steps b{display:block}.ctrax-premium-steps span{display:block;color:#cbd5e1;font-size:.84rem;line-height:1.45;margin-top:.28rem}',
      '.ctrax-premium-admin{border:1px solid rgba(59,130,246,.28);border-radius:16px;background:rgba(59,130,246,.07);padding:1rem;margin:1rem 2rem;color:var(--text)}.ctrax-premium-admin h3{margin:0 0 .45rem;font-family:Outfit,Inter,sans-serif}.ctrax-premium-admin-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.6rem;margin-top:.7rem}.ctrax-premium-admin-grid div{border:1px solid rgba(148,163,184,.18);border-radius:12px;padding:.7rem;background:rgba(255,255,255,.035);color:var(--muted);font-size:.82rem}.ctrax-premium-admin-grid b{display:block;color:var(--text);margin-bottom:.2rem}',
      'body.ctrax-products-premium .hero{position:relative;overflow:hidden}body.ctrax-products-premium .hero:after{content:"";position:absolute;right:-80px;top:-90px;width:260px;height:260px;border-radius:999px;background:rgba(37,99,235,.16)}body.ctrax-products-premium .toolbar{position:sticky;top:72px;z-index:20;padding:.75rem;border-radius:22px;background:rgba(255,255,255,.84);backdrop-filter:blur(18px);box-shadow:0 18px 50px rgba(15,23,42,.08)}body.ctrax-products-premium .card{transition:transform .22s ease,box-shadow .22s ease}body.ctrax-products-premium .card:hover{transform:translateY(-4px);box-shadow:0 26px 74px rgba(15,23,42,.13)}body.ctrax-products-premium .img{background:radial-gradient(circle at 60% 10%,#dbeafe,transparent 36%),linear-gradient(135deg,#f8fafc,#eef2ff)}',
      '@media(max-width:900px){.ctrax-premium-hero{grid-template-columns:1fr}.ctrax-premium-proof{grid-template-columns:1fr 1fr}.ctrax-premium-steps{grid-template-columns:1fr 1fr}body.ctrax-products-premium .toolbar{position:relative;top:auto}}',
      '@media(max-width:560px){.ctrax-premium-hero{width:calc(100% - 20px);border-radius:24px}.ctrax-premium-hero h1{font-size:2.45rem}.ctrax-premium-mini,.ctrax-premium-proof,.ctrax-premium-steps{grid-template-columns:1fr}.ctrax-premium-actions a,.ctrax-premium-actions button{width:100%;text-align:center}.ctrax-premium-admin{margin:1rem}.ctrax-premium-process{width:calc(100% - 20px);border-radius:22px}}',
      '@media(prefers-reduced-motion:reduce){.ctrax-premium-hero *,body.ctrax-products-premium .card,.pc-card{transition:none!important;animation:none!important}}'
    ].join('\n');
    document.head.appendChild(st);
  }
  function premiumHero(){
    if (!isHome() || qs('#ctrax-premium-hero')) return;
    var nav = qs('nav');
    var hero = document.createElement('section');
    hero.id = 'ctrax-premium-hero';
    hero.className = 'ctrax-premium-hero';
    hero.innerHTML = '<div class="ctrax-premium-copy"><span class="ctrax-premium-kicker">Repasované PC bez bazárového rizika</span><h1>Výkonný počítač, ktorý dáva zmysel.</h1><p>Vyberte si otestovaný skladový kus so zárukou, faktúrou a jasnými parametrami. Keď neviete, čo kúpiť, AI poradca odporučí najvhodnejší model podľa rozpočtu.</p><div class="ctrax-premium-actions"><a href="produkty/">Vybrať počítač</a><button type="button" data-open-ai-bot>Pomôž mi vybrať</button></div></div><div class="ctrax-premium-visual"><div class="ctrax-premium-device"><b>Konkrétny kus zo skladu</b><span>stav, parametre, záruka a dostupnosť pred objednávkou</span></div><div class="ctrax-premium-mini"><div><b>12M</b><span>záruka</span></div><div><b>Test</b><span>pred odoslaním</span></div><div><b>SK</b><span>doručenie</span></div></div></div>';
    if (nav && nav.parentNode) nav.parentNode.insertBefore(hero, nav.nextSibling); else document.body.prepend(hero);
  }
  function trustBlocks(){
    if (!isHome() || qs('#ctrax-premium-proof')) return;
    var target = qs('#ctrax-home-product-teaser') || qs('#ponuka') || qs('main') || document.body.lastElementChild;
    var proof = document.createElement('section');
    proof.id = 'ctrax-premium-proof';
    proof.className = 'ctrax-premium-proof';
    proof.innerHTML = '<article><b>Reálne fotky</b><span>Pri každom produkte dopĺňajte fotky konkrétneho kusu, portov a stavu.</span></article><article><b>Testovanie</b><span>RAM, disk, teploty, Windows a základná funkčnosť pred odoslaním.</span></article><article><b>Jasná cena</b><span>Cena produktu, dopravy a služieb je viditeľná pred objednávkou.</span></article><article><b>Podpora</b><span>E-mailové stavy objednávky, vrátenie a pomoc s výberom.</span></article>';
    if (target && target.parentNode) target.parentNode.insertBefore(proof, target); else document.body.appendChild(proof);

    var process = document.createElement('section');
    process.id = 'ctrax-premium-process';
    process.className = 'ctrax-premium-process';
    process.innerHTML = '<h2>Ako má pôsobiť prémiový repas.</h2><div class="ctrax-premium-steps"><div><strong>1</strong><b>Vyberiete kus</b><span>Produkt má parametre, stav, cenu a sklad.</span></div><div><strong>2</strong><b>Overíme objednávku</b><span>Sklad sa skontroluje pred vybavením.</span></div><div><strong>3</strong><b>Pripravíme PC</b><span>Čistenie, test a bezpečné balenie.</span></div><div><strong>4</strong><b>Dostanete info</b><span>E-mail pri zmene stavu objednávky.</span></div></div>';
    if (proof.parentNode) proof.parentNode.insertBefore(process, proof.nextSibling);
  }
  function productPageUpgrade(){
    if (!isProducts()) return;
    document.body.classList.add('ctrax-products-premium');
    var heroTitle = qs('.hero h1');
    if (heroTitle) heroTitle.textContent = 'Vyberte si konkrétny overený počítač.';
    var heroP = qs('.hero p');
    if (heroP) heroP.textContent = 'Filtrujte podľa rozpočtu, výkonu a dostupnosti. Každý produkt má byť konkrétny skladový kus s jasným stavom, fotkami, zárukou a pripravenosťou na odoslanie.';
    var meta = qs('.meta');
    if (meta && !qs('#ctrax-products-trustline')) {
      var line = document.createElement('div');
      line.id = 'ctrax-products-trustline';
      line.className = 'trust';
      line.innerHTML = '<span>✅ Testované kusy</span><span>🧾 Faktúra</span><span>🛡️ Záruka</span><span>🚚 Doručenie po Slovensku</span>';
      meta.parentNode.insertBefore(line, meta.nextSibling);
    }
  }
  function adminUpgrade(){
    if (!isAdmin() || qs('#ctrax-premium-admin')) return;
    var anchor = qs('#admin') || document.body;
    var panel = document.createElement('section');
    panel.id = 'ctrax-premium-admin';
    panel.className = 'ctrax-premium-admin';
    panel.innerHTML = '<h3>Premium checklist pred publikovaním produktu</h3><p style="color:var(--muted);margin:0">Toto drží e-shop na profesionálnej úrovni: menej otázok od zákazníkov, viac dôvery a menej reklamácií.</p><div class="ctrax-premium-admin-grid"><div><b>Fotky</b>predok, zadok, porty, vnútro, zapnutý PC</div><div><b>Stav</b>kozmetika, príslušenstvo, Windows, záruka</div><div><b>Parametre</b>CPU, GPU, RAM, SSD, generácia, sklad</div><div><b>Predaj</b>porovnávacia cena, doprava, služby, jasný CTA</div></div>';
    anchor.prepend(panel);
  }
  function openAiBinding(){
    document.addEventListener('click', function(e){
      var btn = e.target.closest('[data-open-ai-bot]');
      if (!btn) return;
      e.preventDefault();
      var botButton = qs('#ctraxBotButton');
      var panel = qs('#ctraxBotPanel');
      if (panel && !panel.classList.contains('open') && botButton) botButton.click();
      else if (panel) panel.classList.add('open');
      setTimeout(function(){ qs('#ctraxBotText')?.focus({preventScroll:true}); }, 80);
    }, {capture:false});
  }
  function publishProductStats(){
    var products = getProducts();
    if (!products.length) return;
    qsa('[data-ctrax-product-count]').forEach(function(el){ el.textContent = String(products.length); });
  }
  function boot(){
    addStyle();
    document.body.classList.toggle('ctrax-admin-page', isAdmin());
    premiumHero();
    trustBlocks();
    productPageUpgrade();
    adminUpgrade();
    openAiBinding();
    publishProductStats();
    setTimeout(function(){ trustBlocks(); productPageUpgrade(); adminUpgrade(); publishProductStats(); }, 1000);
    setTimeout(function(){ trustBlocks(); productPageUpgrade(); adminUpgrade(); publishProductStats(); }, 2600);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
