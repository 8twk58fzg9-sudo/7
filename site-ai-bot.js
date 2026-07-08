(function(){
  'use strict';
  if (window.__CTRX_AI_BOT__) return;
  window.__CTRX_AI_BOT__ = true;
  if (/admin_2\.html(?:$|[?#])/i.test(location.pathname)) return;

  var config = window.COMPUTRAX_CONFIG || {};
  var endpoint = config.PC_ASSISTANT_ENDPOINT || '';
  var state = {
    busy: false,
    history: [],
    openedOnce: false,
    lastSentAt: 0,
    localOnlyNoticeShown: false
  };

  function qs(selector, root){ return (root || document).querySelector(selector); }
  function getProducts(){
    try { if (typeof activeProducts !== 'undefined' && Array.isArray(activeProducts) && activeProducts.length) return activeProducts; } catch(e) {}
    try { if (Array.isArray(window.allProducts) && window.allProducts.length) return window.allProducts; } catch(e) {}
    try { if (Array.isArray(window.PRODUCTS_DATA) && window.PRODUCTS_DATA.length) return window.PRODUCTS_DATA; } catch(e) {}
    return [];
  }
  function money(value){
    var amount = Number(value || 0);
    return Number.isFinite(amount) ? amount.toLocaleString('sk-SK', {maximumFractionDigits:0}) + ' €' : '—';
  }
  function normalize(product){
    product = product || {};
    var ramNumber = Number(String(product.ramFilter || product.ram || '').match(/\d+/)?.[0] || 0);
    return {
      id: product.id || product.sku || product.name,
      name: String(product.name || 'Počítač').trim(),
      price: Math.max(0, Number(product.price || 0)),
      stock: Math.max(0, Number(product.stock == null ? 1 : product.stock)),
      cat: String(product.cat || product.category || 'office').toLowerCase(),
      cpu: String(product.cpu || ''),
      gpu: String(product.gpu || product.gpuFilter || product.gpu_filter || ''),
      ram: String(product.ram || ''),
      ramNumber: ramNumber,
      ssd: String(product.ssd || product.storage || ''),
      os: String(product.os || ''),
      delivery: String(product.delivery || 'Doprava po Slovensku'),
      popular: Number(product.popular || 0),
      newest: Number(product.newest || product.id || 0)
    };
  }
  function productsForPrompt(){
    return getProducts().map(normalize).filter(function(p){ return p.name && p.price > 0; });
  }
  function detectIntent(message){
    var text = String(message || '').toLowerCase();
    var budgetMatch = text.match(/(?:do|max|budget|rozpočet|rozpocet)?\s*(\d{3,5})\s*(?:€|eur)?/i);
    var intent = {
      raw: text,
      budget: budgetMatch ? Math.max(150, Number(budgetMatch[1])) : 700,
      use: 'office',
      priority: 'value',
      qty: 1,
      wantsFaq: null
    };
    var qtyMatch = text.match(/(\d+)\s*(?:ks|kus|kusy|počítač|pocitac|pc)/i);
    if (qtyMatch) intent.qty = Math.max(1, Math.min(50, Number(qtyMatch[1])));
    if (/hra|herny|herný|gaming|fps|fortnite|gta|cs2|valorant|rtx|grafika/.test(text)) intent.use = 'gaming';
    if (/firma|škol|skol|b2b|učebňa|ucebna|kancelári|kancelari|viac kus|hromadne/.test(text)) intent.use = 'business';
    if (/video|foto|strih|render|photoshop|premiere|davinci|grafik/.test(text)) intent.use = 'creative';
    if (/najlac|lacn|šetri|setri/.test(text)) intent.priority = 'cheap';
    if (/výkon|vykon|najlep|siln|fps/.test(text)) intent.priority = 'power';
    if (/záruk|zaruk/.test(text)) intent.wantsFaq = 'warranty';
    if (/doprav|doruč|doruc|kurier|kuriér/.test(text)) intent.wantsFaq = 'delivery';
    if (/vráten|vraten|reklam|refund|odstúpen|odstupen/.test(text)) intent.wantsFaq = 'returns';
    if (/kontakt|email|telef|whatsapp|pomoc/.test(text)) intent.wantsFaq = 'contact';
    return intent;
  }
  function productScore(product, intent){
    var score = 0;
    var text = (product.name + ' ' + product.cpu + ' ' + product.gpu + ' ' + product.ram + ' ' + product.ssd).toLowerCase();
    var hasDedicatedGpu = /rtx|gtx|radeon|rx\s?\d|arc/i.test(product.gpu);
    var hasStrongCpu = /i7|i9|ryzen\s?7|ryzen\s?9|xeon/i.test(product.cpu);

    if (product.stock > 0) score += 100; else score -= 700;
    if (product.stock >= intent.qty) score += 35;
    if (product.price <= intent.budget) score += 130;
    else score -= Math.min(180, (product.price - intent.budget) / 4);

    if (intent.use === 'gaming') {
      if (product.cat === 'gaming') score += 140;
      if (hasDedicatedGpu) score += 115;
      if (product.ramNumber >= 16) score += 25;
      if (/nvme|ssd/i.test(product.ssd)) score += 15;
    }
    if (intent.use === 'office') {
      if (product.cat === 'office') score += 115;
      if (product.price <= 500) score += 35;
      if (product.ramNumber >= 16) score += 22;
      if (/ssd|nvme/i.test(product.ssd)) score += 25;
    }
    if (intent.use === 'business') {
      if (product.cat === 'office') score += 125;
      if (/pro|optiplex|elitedesk|thinkcentre|workstation/i.test(text)) score += 35;
      score += Math.min(90, product.stock * 10);
    }
    if (intent.use === 'creative') {
      if (hasStrongCpu) score += 75;
      if (hasDedicatedGpu) score += 60;
      if (product.ramNumber >= 32) score += 45;
      else if (product.ramNumber >= 16) score += 20;
    }
    if (intent.priority === 'cheap') score += Math.max(0, 90 - product.price / 10);
    if (intent.priority === 'power') score += (hasDedicatedGpu ? 55 : 0) + (hasStrongCpu ? 40 : 0) + Math.min(35, product.ramNumber);
    score += product.popular * 2 + product.newest / 20;
    return score;
  }
  function bestProducts(intent){
    var list = productsForPrompt();
    if (!list.length) return [];
    var inStock = list.filter(function(p){ return p.stock > 0; });
    var source = inStock.length ? inStock : list;
    return source.map(function(product){ return {product: product, score: productScore(product, intent)}; })
      .sort(function(a,b){ return b.score - a.score; })
      .slice(0, 3)
      .map(function(item){ return item.product; });
  }
  function reasons(product, intent){
    var items = [];
    if (product.price <= intent.budget) items.push('zmestí sa do rozpočtu ' + money(intent.budget));
    else items.push('je najbližšie k rozpočtu ' + money(intent.budget));
    if (product.stock > 0) items.push(product.stock + ' ks skladom');
    if (product.ramNumber >= 16) items.push(product.ramNumber + ' GB RAM');
    if (/rtx|gtx|radeon|rx/i.test(product.gpu)) items.push('samostatná grafika');
    if (/ssd|nvme/i.test(product.ssd)) items.push('rýchly SSD disk');
    return items.slice(0, 5).join(' · ');
  }
  function faqAnswer(intent){
    if (intent.wantsFaq === 'warranty') return 'Na repasované počítače komunikujte jasnú záruku podľa detailu produktu. Pri každom kuse odporúčam doplniť stav, testovanie, čo je v balení a či je Windows aktivovaný.';
    if (intent.wantsFaq === 'delivery') return 'Doručenie riešte podľa nastavenia pri produkte a checkoutu. Pri skladovom kuse je najlepšie uvádzať reálny odhad doručenia a poslať zákazníkovi e-mail pri zmene stavu objednávky.';
    if (intent.wantsFaq === 'returns') return 'Pri nákupe cez e-shop má zákazník dostať jasné informácie o odstúpení, reklamácii a vrátení tovaru. Detailné právne texty nechajte v sekcii Právne info.';
    if (intent.wantsFaq === 'contact') return 'Najrýchlejšie je napísať cez kontaktný formulár alebo na e-mail ' + (config.SUPPORT_EMAIL || 'computerax.sk@gmail.com') + '. Pri výbere PC mi stačí rozpočet, použitie a počet kusov.';
    return '';
  }
  function localAnswer(message){
    var intent = detectIntent(message);
    var faq = faqAnswer(intent);
    var picks = bestProducts(intent);
    if (faq && !picks.length) return {ok:true, answer: faq, products: []};
    if (!picks.length) return {ok:true, answer: (faq ? faq + '\n\n' : '') + 'Momentálne nevidím skladový produkt. Napíšte rozpočet a použitie, alebo pošlite dopyt a vyberieme alternatívu.', products: []};
    var top = picks[0];
    var intro = 'Najlepšia voľba je ' + top.name + '. Dôvod: ' + reasons(top, intent) + '.';
    if (intent.use === 'business') intro += ' Pri firme alebo škole odporúčam overiť počet kusov a rovnaké konfigurácie pred potvrdením objednávky.';
    if (intent.use === 'gaming') intro += ' Pri hrách pozerajte hlavne grafiku, RAM a SSD.';
    if (intent.use === 'creative') intro += ' Pri foto/video práci je dôležitý procesor, RAM a rýchly disk.';
    if (faq) intro += '\n\n' + faq;
    return {ok:true, answer: intro, products: picks};
  }
  function addMessage(type, text, products){
    var messages = qs('#ctraxBotMessages');
    if (!messages) return;
    var bubble = document.createElement('div');
    bubble.className = 'ctrax-bot-msg ' + type;
    bubble.textContent = String(text || '');
    if (products && products.length) bubble.appendChild(productList(products));
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }
  function productList(products){
    var wrap = document.createElement('div');
    wrap.className = 'ctrax-bot-products';
    products.slice(0, 3).forEach(function(product){
      var card = document.createElement('article');
      card.className = 'ctrax-bot-product';
      var title = document.createElement('b');
      title.textContent = product.name;
      var spec = document.createElement('small');
      spec.textContent = [product.cpu, product.gpu, product.ram, product.ssd].filter(Boolean).join(' · ');
      var price = document.createElement('strong');
      price.textContent = money(product.price);
      var reason = document.createElement('small');
      reason.className = 'ctrax-bot-reason';
      reason.textContent = product.stock > 0 ? product.stock + ' ks skladom' : 'momentálne vypredané';
      var actions = document.createElement('div');
      var detail = document.createElement('button');
      detail.type = 'button';
      detail.dataset.action = 'open-detail';
      detail.dataset.name = product.name;
      detail.textContent = 'Detail';
      var cart = document.createElement('button');
      cart.type = 'button';
      cart.dataset.action = 'add-cart';
      cart.dataset.name = product.name;
      cart.dataset.price = String(Number(product.price || 0));
      cart.textContent = 'Do košíka';
      if (product.stock <= 0) cart.disabled = true;
      actions.append(detail, cart);
      card.append(title, spec, price, reason, actions);
      wrap.appendChild(card);
    });
    return wrap;
  }
  async function askEndpoint(message){
    if (!endpoint) return null;
    var controller = new AbortController();
    var timer = setTimeout(function(){ controller.abort(); }, 9000);
    try {
      var response = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          message: message,
          products: productsForPrompt().slice(0, 35),
          history: state.history.slice(-8),
          language: 'sk',
          site: 'Computrax.sk'
        }),
        signal: controller.signal
      });
      if (!response.ok) return null;
      var data = await response.json();
      if (!data || data.ok === false) return null;
      return data;
    } catch(e) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
  async function sendMessage(message){
    message = String(message || '').trim().slice(0, 700);
    if (!message || state.busy) return;
    var now = Date.now();
    if (now - state.lastSentAt < 850) return;
    state.lastSentAt = now;
    state.busy = true;
    addMessage('user', message);
    setSendState(true);
    try {
      var answer = await askEndpoint(message);
      if (!answer) {
        answer = localAnswer(message);
        if (!state.localOnlyNoticeShown && endpoint) {
          state.localOnlyNoticeShown = true;
          addMessage('bot', 'Online AI poradca teraz neodpovedal, preto používam bezpečný lokálny výber zo skladu. Stále môžete vybrať produkt a pokračovať v nákupe.');
        }
      }
      var normalizedProducts = Array.isArray(answer.products) ? answer.products.map(normalize) : [];
      addMessage('bot', answer.answer || 'Vybral som najbližšie vhodné skladové kusy.', normalizedProducts);
      state.history.push({role:'user', content: message}, {role:'assistant', content: String(answer.answer || '').slice(0, 900)});
      state.history = state.history.slice(-10);
    } finally {
      state.busy = false;
      setSendState(false);
    }
  }
  function setSendState(isBusy){
    var send = qs('#ctraxBotSend');
    if (!send) return;
    send.disabled = isBusy;
    send.textContent = isBusy ? 'Píšem...' : 'Poslať';
  }
  function addStyle(){
    if (qs('#ctrax-ai-bot-style')) return;
    var style = document.createElement('style');
    style.id = 'ctrax-ai-bot-style';
    style.textContent = [
      '.ctrax-bot-button{position:fixed;left:18px;bottom:18px;z-index:9998;border:0;border-radius:18px;background:#0f172a;color:#fff;font-weight:950;padding:.82rem 1rem;box-shadow:0 18px 48px rgba(15,23,42,.24);cursor:pointer;text-align:left}',
      '.ctrax-bot-button span{display:block;color:#bfdbfe;font-size:.78rem;font-weight:800}',
      '.ctrax-bot-panel{position:fixed;left:18px;bottom:76px;width:min(430px,calc(100vw - 24px));max-height:min(720px,calc(100vh - 110px));z-index:9999;background:#fff;border:1px solid rgba(15,23,42,.12);border-radius:24px;box-shadow:0 28px 80px rgba(15,23,42,.28);display:none;overflow:hidden}',
      '.ctrax-bot-panel.open{display:grid;grid-template-rows:auto 1fr auto auto auto}',
      '.ctrax-bot-head{background:linear-gradient(135deg,#0f172a,#2563eb);color:#fff;padding:1rem 3rem 1rem 1rem;position:relative}',
      '.ctrax-bot-head b{display:block;font-size:1.05rem}.ctrax-bot-head span{display:block;color:#dbeafe;font-size:.82rem;margin-top:.2rem;line-height:1.35}',
      '.ctrax-bot-close{position:absolute;right:12px;top:10px;border:0;background:rgba(255,255,255,.16);color:#fff;border-radius:10px;padding:.35rem .6rem;cursor:pointer}',
      '.ctrax-bot-messages{padding:.85rem;overflow:auto;display:grid;gap:.65rem;min-height:210px}',
      '.ctrax-bot-msg{padding:.72rem .82rem;border-radius:16px;line-height:1.42;font-size:.9rem;white-space:pre-line}',
      '.ctrax-bot-msg.bot{background:#f1f5f9;color:#0f172a}.ctrax-bot-msg.user{background:#2563eb;color:#fff;justify-self:end;max-width:82%}',
      '.ctrax-bot-products{display:grid;gap:.55rem;margin-top:.55rem}.ctrax-bot-product{border:1px solid rgba(15,23,42,.09);border-radius:14px;padding:.6rem;background:#fff;white-space:normal}',
      '.ctrax-bot-product b{display:block;color:#0f172a}.ctrax-bot-product small{display:block;color:#64748b;margin:.18rem 0}.ctrax-bot-product strong{display:block;color:#0f172a;font-size:1.05rem}.ctrax-bot-reason{color:#16a34a!important;font-weight:800}',
      '.ctrax-bot-product div{display:flex;gap:.4rem;margin-top:.45rem}.ctrax-bot-product button{border:0;border-radius:10px;padding:.5rem .6rem;font-weight:900;cursor:pointer}.ctrax-bot-product button:first-child{background:#eef2ff;color:#1d4ed8}.ctrax-bot-product button:last-child{background:#2563eb;color:#fff}.ctrax-bot-product button:disabled{opacity:.55;cursor:not-allowed}',
      '.ctrax-bot-quick{padding:.7rem .85rem;border-top:1px solid rgba(15,23,42,.08);display:flex;gap:.42rem;flex-wrap:wrap}.ctrax-bot-quick button{border:1px solid rgba(37,99,235,.18);background:#f8fafc;border-radius:999px;padding:.48rem .62rem;font-weight:900;color:#0f172a;cursor:pointer;font-size:.78rem}',
      '.ctrax-bot-input{border-top:1px solid rgba(15,23,42,.08);padding:.72rem;display:grid;grid-template-columns:1fr auto;gap:.5rem}.ctrax-bot-input textarea{resize:none;min-height:44px;max-height:96px;border:1px solid rgba(15,23,42,.15);border-radius:14px;padding:.65rem .72rem;font:inherit}.ctrax-bot-input button{border:0;border-radius:14px;background:#2563eb;color:#fff;font-weight:950;padding:0 .9rem;cursor:pointer}.ctrax-bot-input button:disabled{opacity:.7;cursor:progress}',
      '.ctrax-bot-note{font-size:.72rem;color:#64748b;padding:0 .85rem .65rem}',
      '@media(max-width:560px){.ctrax-bot-button{left:12px;bottom:12px;padding:.72rem .82rem;font-size:.86rem}.ctrax-bot-panel{left:8px;bottom:66px;width:calc(100vw - 16px);max-height:calc(100vh - 84px);border-radius:20px}.ctrax-bot-msg.user{max-width:92%}}',
      '@media(prefers-reduced-motion:reduce){.ctrax-bot-button,.ctrax-bot-panel,*{scroll-behavior:auto!important;transition:none!important}}'
    ].join('\n');
    document.head.appendChild(style);
  }
  function createBot(){
    if (qs('#ctraxBotPanel')) return;
    addStyle();
    var button = document.createElement('button');
    button.className = 'ctrax-bot-button';
    button.id = 'ctraxBotButton';
    button.type = 'button';
    button.setAttribute('aria-controls', 'ctraxBotPanel');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = 'AI výber PC <span>podľa rozpočtu</span>';
    document.body.appendChild(button);

    var panel = document.createElement('section');
    panel.className = 'ctrax-bot-panel';
    panel.id = 'ctraxBotPanel';
    panel.setAttribute('aria-label', 'Computrax AI poradca');
    panel.innerHTML = '<div class="ctrax-bot-head"><button class="ctrax-bot-close" type="button" aria-label="Zavrieť">×</button><b>Computrax AI poradca</b><span>Napíšte rozpočet, použitie alebo otázku k záruke, doprave a výberu PC.</span></div><div class="ctrax-bot-messages" id="ctraxBotMessages" aria-live="polite"></div><div class="ctrax-bot-quick"><button type="button" data-bot-q="Potrebujem PC do 500 € na školu a internet">PC do 500 €</button><button type="button" data-bot-q="Chcem herný PC do 800 €">Herný do 800 €</button><button type="button" data-bot-q="Potrebujem 5 počítačov pre firmu alebo školu">Firma/škola</button><button type="button" data-bot-q="Aká je záruka a doprava?">Záruka + doprava</button></div><div class="ctrax-bot-input"><textarea id="ctraxBotText" maxlength="700" placeholder="Napr. PC do 500 € na školu..."></textarea><button type="button" id="ctraxBotSend">Poslať</button></div><div class="ctrax-bot-note">Poradca neukladá heslá ani platobné údaje. Odporúčanie overte v detaile produktu pred objednávkou.</div>';
    document.body.appendChild(panel);

    button.addEventListener('click', function(){
      var open = !panel.classList.contains('open');
      panel.classList.toggle('open', open);
      button.setAttribute('aria-expanded', String(open));
      if (open && !state.openedOnce) {
        state.openedOnce = true;
        addMessage('bot', 'Ahoj, pomôžem vybrať PC zo skladu. Napíšte napríklad: „herný PC do 800 €“, „PC do školy do 500 €“ alebo otázku k záruke a doprave.');
      }
      if (open) setTimeout(function(){ qs('#ctraxBotText', panel)?.focus(); }, 50);
    });
    qs('.ctrax-bot-close', panel).addEventListener('click', function(){
      panel.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
      button.focus();
    });
    qs('#ctraxBotSend', panel).addEventListener('click', function(){
      var input = qs('#ctraxBotText', panel);
      var value = input.value;
      input.value = '';
      sendMessage(value);
    });
    qs('#ctraxBotText', panel).addEventListener('keydown', function(event){
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        qs('#ctraxBotSend', panel).click();
      }
      if (event.key === 'Escape') {
        panel.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
        button.focus();
      }
    });
    panel.addEventListener('click', function(event){
      var quick = event.target.closest('[data-bot-q]');
      if (quick) sendMessage(quick.dataset.botQ);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createBot, {once:true});
  else createBot();
})();
