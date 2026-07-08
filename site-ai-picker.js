(function(){
  'use strict';
  if (window.__CTRX_AI_PICKER__) return;
  window.__CTRX_AI_PICKER__ = true;

  function isAdmin(){ return /admin_2\.html(?:$|[?#])/i.test(location.pathname); }
  if (isAdmin()) return;

  var state = { use: 'office', budget: 500, priority: 'value', qty: 1 };
  var lastSignature = '';

  function qs(s,r){ return (r||document).querySelector(s); }
  function qsa(s,r){ return Array.from((r||document).querySelectorAll(s)); }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function money(v){ var n = Number(v || 0); return Number.isFinite(n) ? n.toLocaleString('sk-SK',{maximumFractionDigits:0}) + ' €' : '—'; }
  function getProducts(){
    try { if (typeof activeProducts !== 'undefined' && Array.isArray(activeProducts) && activeProducts.length) return activeProducts; } catch(e) {}
    try { if (Array.isArray(window.PRODUCTS_DATA) && window.PRODUCTS_DATA.length) return window.PRODUCTS_DATA; } catch(e) {}
    try { if (Array.isArray(window.allProducts) && window.allProducts.length) return window.allProducts; } catch(e) {}
    return [];
  }
  function normalize(p){
    p = p || {};
    var image = p.imageUrl || p.image_url || p.image || '';
    return {
      id: p.id || p.sku || p.name,
      name: String(p.name || 'Počítač').trim(),
      price: Math.max(0, Number(p.price || 0)),
      compareAt: Math.max(0, Number(p.compare_at_price || p.compareAt || p.oldPrice || 0)),
      cat: String(p.cat || p.category || 'office').toLowerCase(),
      stock: Math.max(0, Number(p.stock == null ? 1 : p.stock)),
      cpu: String(p.cpu || ''),
      gpu: String(p.gpu || p.gpuFilter || p.gpu_filter || ''),
      ram: String(p.ram || ''),
      ramNumber: Number(String(p.ramFilter || p.ram || '').match(/\d+/)?.[0] || 0),
      ssd: String(p.ssd || p.storage || ''),
      os: String(p.os || ''),
      delivery: String(p.delivery || 'Doprava po Slovensku'),
      imageUrl: image,
      popular: Number(p.popular || 0),
      newest: Number(p.newest || p.id || 0)
    };
  }
  function categoryLabel(cat){ return cat === 'gaming' ? 'herný PC' : cat === 'retro' ? 'retro PC' : 'kancelársky PC'; }
  function scoreProduct(p){
    var score = 0;
    var text = (p.name + ' ' + p.cpu + ' ' + p.gpu + ' ' + p.ram + ' ' + p.ssd).toLowerCase();
    var gpuStrong = /rtx|gtx|radeon|rx\s?\d|arc/i.test(p.gpu);
    var cpuStrong = /i7|i9|ryzen\s?7|ryzen\s?9|xeon/i.test(p.cpu);
    if (p.stock > 0) score += 70; else score -= 500;
    if (p.price && p.price <= state.budget) score += 90;
    if (p.price && p.price > state.budget) score -= Math.min(140, (p.price - state.budget) / 5);
    if (p.price && p.price < state.budget * 0.72) score += 15;
    if (state.use === 'gaming') {
      if (p.cat === 'gaming') score += 125;
      if (gpuStrong) score += 85;
      if (p.ramNumber >= 16) score += 28;
      if (/nvme|ssd/i.test(p.ssd)) score += 12;
    }
    if (state.use === 'office' || state.use === 'home') {
      if (p.cat === 'office') score += 100;
      if (p.price <= 500) score += 40;
      if (p.ramNumber >= 16) score += 22;
      if (/ssd|nvme/i.test(p.ssd)) score += 18;
    }
    if (state.use === 'business') {
      if (p.cat === 'office') score += 110;
      score += Math.min(60, p.stock * 8);
      if (/pro|optiplex|elitedesk|thinkcentre|workstation/i.test(text)) score += 30;
    }
    if (state.use === 'creative') {
      if (cpuStrong) score += 70;
      if (gpuStrong) score += 45;
      if (p.ramNumber >= 32) score += 40;
      else if (p.ramNumber >= 16) score += 18;
    }
    if (state.priority === 'cheap') score += Math.max(0, 70 - p.price / 12);
    if (state.priority === 'power') score += (gpuStrong ? 50 : 0) + (cpuStrong ? 35 : 0) + Math.min(40, p.ramNumber);
    if (state.priority === 'stock') score += Math.min(80, p.stock * 10);
    score += p.popular * 2 + p.newest / 20;
    return score;
  }
  function reasons(p){
    var r = [];
    r.push(categoryLabel(p.cat));
    if (p.price && p.price <= state.budget) r.push('zmestí sa do rozpočtu ' + money(state.budget));
    else if (p.price) r.push('najbližšie k rozpočtu ' + money(state.budget));
    if (p.ramNumber >= 16) r.push(p.ramNumber + ' GB RAM');
    if (/rtx|gtx|radeon|rx/i.test(p.gpu)) r.push('samostatná grafika');
    if (/ssd|nvme/i.test(p.ssd)) r.push('rýchly SSD disk');
    if (p.stock > 0) r.push('skladom');
    return r.slice(0,5).join(' · ');
  }
  function bestProducts(){
    var list = getProducts().map(normalize).filter(function(p){ return p.name && p.price > 0; });
    var underBudget = list.filter(function(p){ return p.price <= state.budget && p.stock > 0; });
    var source = underBudget.length ? underBudget : list;
    return source.map(function(p){ return {product:p, score:scoreProduct(p)}; }).sort(function(a,b){ return b.score - a.score; }).slice(0,3).map(function(x){ return x.product; });
  }
  function syncOriginalAdvisor(){
    var use = qs('#advisor-use'), budget = qs('#advisor-budget'), qty = qs('#advisor-quantity');
    if (use) use.value = state.use === 'business' ? 'business' : state.use === 'creative' ? 'creative' : state.use === 'gaming' ? 'gaming' : 'office';
    if (budget) budget.value = String(state.budget >= 10000 ? 10000 : state.budget <= 300 ? 300 : state.budget <= 500 ? 500 : 800);
    if (qty) qty.value = state.qty >= 6 ? '6' : state.qty >= 2 ? '2' : '1';
  }
  function renderResult(container){
    var picks = bestProducts();
    var result = qs('.ctrax-ai-result', container);
    if (!result) return;
    if (!picks.length) {
      result.innerHTML = '<div class="ctrax-ai-empty"><b>Momentálne nevidím vhodný skladový kus.</b><span>Otvor ponuku alebo pošli dopyt a vyberieme alternatívu podľa rozpočtu.</span><a href="#ponuka">Zobraziť ponuku</a></div>';
      return;
    }
    result.innerHTML = '<div class="ctrax-ai-picked">' + picks.map(function(p, i){
      var saving = p.compareAt && p.compareAt > p.price ? '<span class="ctrax-save">ušetríš približne ' + money(p.compareAt - p.price) + '</span>' : '';
      return '<article class="ctrax-ai-card '+(i===0?'best':'')+'">' +
        '<div class="ctrax-ai-badge">'+(i===0?'Najlepšia zhoda':'Alternatíva')+'</div>' +
        '<h3>'+esc(p.name)+'</h3>' +
        '<p>'+esc(reasons(p))+'</p>' +
        '<div class="ctrax-ai-specs"><span>'+esc(p.cpu || 'CPU podľa produktu')+'</span><span>'+esc(p.gpu || 'grafika podľa produktu')+'</span><span>'+esc(p.ram || 'RAM podľa produktu')+'</span></div>' +
        '<div class="ctrax-ai-price"><b>'+money(p.price)+'</b>'+saving+'</div>' +
        '<div class="ctrax-ai-actions"><button type="button" data-action="open-detail" data-name="'+esc(p.name)+'">Detail</button><button type="button" data-action="add-cart" data-name="'+esc(p.name)+'" data-price="'+Number(p.price||0)+'">Do košíka</button></div>' +
      '</article>';
    }).join('') + '</div>' +
    '<div class="ctrax-ai-service"><b>Služba výberu PC:</b> zákazník nemusí riešiť parametre. Klikne rozpočet a použitie, stránka hneď ukáže najvhodnejšie kusy zo skladu.</div>';
  }
  function setState(key,value){
    if (key === 'budget') state.budget = Number(value || 500); else state[key] = value;
    qsa('[data-ai-key="'+key+'"]').forEach(function(btn){ btn.classList.toggle('active', String(btn.dataset.aiValue) === String(value)); });
    qsa('.ctrax-ai-picker').forEach(renderResult);
    syncOriginalAdvisor();
  }
  function pickerMarkup(idSuffix){
    return '<section class="ctrax-ai-picker" id="ctrax-ai-picker'+idSuffix+'">' +
      '<div class="ctrax-ai-head"><span>Inteligentný výber PC</span><h2>Vyberieme počítač bez formulára.</h2><p>Zákazník iba klikne, na čo PC potrebuje a koľko chce minúť. Odporúčanie sa zmení okamžite podľa skladu a ceny.</p></div>' +
      '<div class="ctrax-ai-choices" aria-label="Výber použitia a rozpočtu">' +
        '<div><b>Na čo?</b><button data-ai-key="use" data-ai-value="office" class="active">Práca / škola</button><button data-ai-key="use" data-ai-value="gaming">Hry</button><button data-ai-key="use" data-ai-value="business">Firma / škola</button><button data-ai-key="use" data-ai-value="creative">Foto / video</button></div>' +
        '<div><b>Rozpočet?</b><button data-ai-key="budget" data-ai-value="300">do 300 €</button><button data-ai-key="budget" data-ai-value="500" class="active">do 500 €</button><button data-ai-key="budget" data-ai-value="800">do 800 €</button><button data-ai-key="budget" data-ai-value="10000">bez limitu</button></div>' +
        '<div><b>Priorita?</b><button data-ai-key="priority" data-ai-value="value" class="active">najlepší pomer</button><button data-ai-key="priority" data-ai-value="cheap">najlacnejšie</button><button data-ai-key="priority" data-ai-value="power">výkon</button><button data-ai-key="priority" data-ai-value="stock">viac kusov</button></div>' +
      '</div><div class="ctrax-ai-result" aria-live="polite"></div></section>';
  }
  function addStyle(){
    if (qs('#ctrax-ai-picker-style')) return;
    var st = document.createElement('style');
    st.id = 'ctrax-ai-picker-style';
    st.textContent = 'body:not(.ctrax-admin-page) .ctrax-ai-picker{width:min(1180px,calc(100% - 32px));margin:1rem auto 1.5rem;padding:1rem;border:1px solid rgba(37,99,235,.16);border-radius:26px;background:linear-gradient(135deg,#fff,#f1f7ff);box-shadow:0 18px 50px rgba(37,99,235,.10)}.ctrax-ai-head{display:grid;gap:.35rem;margin-bottom:.8rem}.ctrax-ai-head span{display:inline-flex;width:max-content;padding:.35rem .65rem;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-weight:950;font-size:.75rem}.ctrax-ai-head h2{font-size:clamp(1.35rem,2.6vw,2.55rem);letter-spacing:-.05em;line-height:1;margin:0;color:#0f172a}.ctrax-ai-head p{margin:0;color:#475569;max-width:780px;line-height:1.45}.ctrax-ai-choices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem;margin:.9rem 0}.ctrax-ai-choices>div{background:#fff;border:1px solid rgba(15,23,42,.08);border-radius:18px;padding:.75rem;display:flex;gap:.45rem;flex-wrap:wrap;align-content:flex-start}.ctrax-ai-choices b{width:100%;font-size:.78rem;color:#475569;text-transform:uppercase;letter-spacing:.08em}.ctrax-ai-choices button{border:1px solid rgba(37,99,235,.15);border-radius:999px;background:#f8fafc;color:#0f172a;padding:.55rem .72rem;font-weight:900;cursor:pointer}.ctrax-ai-choices button.active{background:#2563eb;color:#fff;border-color:#2563eb;box-shadow:0 10px 22px rgba(37,99,235,.24)}.ctrax-ai-picked{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem}.ctrax-ai-card{background:#fff;border:1px solid rgba(15,23,42,.09);border-radius:20px;padding:.85rem;box-shadow:0 12px 30px rgba(15,23,42,.07)}.ctrax-ai-card.best{border-color:rgba(37,99,235,.35);box-shadow:0 18px 45px rgba(37,99,235,.16)}.ctrax-ai-badge{font-size:.72rem;font-weight:950;color:#2563eb;text-transform:uppercase;letter-spacing:.08em}.ctrax-ai-card h3{font-size:1.05rem;margin:.28rem 0;color:#0f172a}.ctrax-ai-card p{font-size:.82rem;line-height:1.4;color:#475569;margin:.35rem 0}.ctrax-ai-specs{display:grid;gap:.28rem;margin:.55rem 0}.ctrax-ai-specs span{font-size:.76rem;color:#334155;background:#f8fafc;border-radius:10px;padding:.32rem .45rem}.ctrax-ai-price{display:flex;align-items:baseline;gap:.45rem;flex-wrap:wrap;margin:.5rem 0}.ctrax-ai-price b{font-size:1.45rem;color:#0f172a}.ctrax-save{font-size:.75rem;color:#059669;font-weight:900}.ctrax-ai-actions{display:grid;grid-template-columns:1fr 1fr;gap:.45rem}.ctrax-ai-actions button,.ctrax-ai-empty a{border:0;border-radius:12px;padding:.68rem .75rem;font-weight:950;cursor:pointer;text-align:center;text-decoration:none}.ctrax-ai-actions button:first-child{background:#eef2ff;color:#1d4ed8}.ctrax-ai-actions button:last-child,.ctrax-ai-empty a{background:#2563eb;color:#fff}.ctrax-ai-service{margin-top:.8rem;padding:.75rem .85rem;background:#ecfdf5;border:1px solid rgba(16,185,129,.22);border-radius:16px;color:#065f46;font-size:.86rem}.ctrax-ai-empty{display:grid;gap:.45rem;background:#fff;border-radius:18px;padding:1rem;border:1px dashed rgba(37,99,235,.3)}.advisor-panel.ctrax-ai-replaced .advisor-tool>.quiz-grid,.advisor-panel.ctrax-ai-replaced .advisor-tool>.quiz-submit,.advisor-panel.ctrax-ai-replaced .advisor-tool>#advisor-result{display:none!important}.advisor-panel.ctrax-ai-replaced .ctrax-ai-picker{width:100%;margin:.85rem 0;padding:.8rem;box-shadow:none}.advisor-panel.ctrax-ai-replaced .ctrax-ai-head h2{font-size:1.45rem}.advisor-panel.ctrax-ai-replaced .ctrax-ai-head p{font-size:.9rem}.advisor-panel.ctrax-ai-replaced .ctrax-ai-service{display:none}@media(max-width:900px){.ctrax-ai-choices{grid-template-columns:1fr}.ctrax-ai-picked{grid-template-columns:1fr}.ctrax-ai-head h2{font-size:1.55rem}}';
    document.head.appendChild(st);
  }
  function installTopPicker(){
    if (qs('#ctrax-ai-picker-top')) return;
    var target = qs('#ponuka') || qs('.products-section') || qs('main') || document.body.firstElementChild;
    var wrap = document.createElement('div');
    wrap.innerHTML = pickerMarkup('-top');
    var el = wrap.firstElementChild;
    el.id = 'ctrax-ai-picker-top';
    if (target && target.parentNode) target.parentNode.insertBefore(el, target); else document.body.prepend(el);
  }
  function replaceAdvisorPanel(){
    var panel = qs('.advisor-panel');
    if (!panel || panel.classList.contains('ctrax-ai-replaced')) return;
    panel.classList.add('ctrax-ai-replaced');
    var tool = qs('.advisor-tool', panel);
    if (!tool) return;
    var div = document.createElement('div');
    div.innerHTML = pickerMarkup('-inline');
    tool.prepend(div.firstElementChild);
  }
  function bind(){
    document.addEventListener('click', function(e){
      var btn = e.target.closest('[data-ai-key]');
      if (!btn) return;
      e.preventDefault();
      setState(btn.dataset.aiKey, btn.dataset.aiValue);
    });
  }
  function signature(){ return getProducts().map(function(p){ return [p.name,p.price,p.stock,p.cat,p.cpu,p.gpu,p.ram,p.ssd].join('|'); }).join('~'); }
  function refresh(force){
    var sig = signature() + JSON.stringify(state);
    if (!force && sig === lastSignature) return;
    lastSignature = sig;
    qsa('.ctrax-ai-picker').forEach(renderResult);
  }
  function boot(){
    addStyle();
    installTopPicker();
    replaceAdvisorPanel();
    bind();
    syncOriginalAdvisor();
    refresh(true);
    setInterval(function(){ refresh(false); }, 1200);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
})();
