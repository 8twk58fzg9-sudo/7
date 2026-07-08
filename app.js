(() => {
  'use strict';
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => Array.from(root.querySelectorAll(q));
  const C = window.CT_CONFIG || {};
  const LS_PRODUCTS = 'ctrax_products_v4';
  const LS_FEATURED = 'ctrax_featured_id_v4';
  const LS_CART = 'ctrax_cart_v4';
  const LS_FAV = 'ctrax_favorites_v4';
  const LS_ORDERS = 'ctrax_orders_v4';
  const LS_ACCOUNT = 'ctrax_account_v4';
  const safe = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const eur = v => `${Number(v || 0).toLocaleString('sk-SK', { minimumFractionDigits: Number(v) % 1 ? 2 : 0, maximumFractionDigits: 2 })}${C.currency || '€'}`;
  const load = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const bundled = () => Array.isArray(window.CT_PRODUCTS) ? window.CT_PRODUCTS : [];
  let products = load(LS_PRODUCTS, bundled()).map(normalizeProduct);
  if (!products.length) products = bundled().map(normalizeProduct);
  let featuredId = Number(localStorage.getItem(LS_FEATURED) || window.CT_FEATURED_ID || products[0]?.id || 0);
  let cart = load(LS_CART, []);
  let favs = load(LS_FAV, []);
  let compare = [];
  let activeCat = 'all';
  let search = '';
  let sort = 'recommended';

  function normalizeProduct(p) {
    return {
      id: Number(p.id || Date.now()),
      name: String(p.name || 'Produkt').trim(),
      cat: ['gaming','office','retro'].includes(p.cat) ? p.cat : 'office',
      status: p.status || (Number(p.stock || 0) > 0 ? 'active' : 'sold'),
      price: Number(p.price || 0),
      oldPrice: p.oldPrice || p.compareAt || '',
      stock: Math.max(0, Number(p.stock || 0)),
      tag: p.tag || 'SKLADOM',
      tagColor: p.tagColor || '#2563eb',
      cpu: p.cpu || 'Neuvedené',
      cpuBrand: p.cpuBrand || (/amd|ryzen/i.test(p.cpu || '') ? 'amd' : 'intel'),
      gpu: p.gpu || 'Neuvedené',
      gpuFilter: p.gpuFilter || p.gpu || '',
      ram: p.ram || 'Neuvedené',
      ramFilter: p.ramFilter || String(p.ram || '').match(/\d+/)?.[0] || '',
      ssd: p.ssd || 'Neuvedené',
      storageType: p.storageType || (/nvme/i.test(p.ssd || '') ? 'nvme' : /ssd/i.test(p.ssd || '') ? 'ssd' : ''),
      os: p.os || 'Windows 11 Pro',
      condition: p.condition || 'Repasované – veľmi dobrý stav',
      warranty: p.warranty || C.warrantyText || '12 mesiacov',
      delivery: p.delivery || 'Kuriér / Packeta',
      image: p.image || p.imageUrl || '',
      tested: p.tested !== false,
      popular: Number(p.popular || 0),
      newest: Number(p.newest || p.id || 0),
      description: p.description || 'Otestovaný repasovaný počítač pripravený na používanie.'
    };
  }
  function activeProducts() { return products.filter(p => p.status !== 'sold' && p.stock > 0); }
  function getProduct(id) { return products.find(p => Number(p.id) === Number(id)); }
  function catLabel(cat) { return ({ gaming: 'Herné PC', office: 'Pracovné PC', retro: 'Retro PC' })[cat] || 'PC'; }
  function toast(msg) { const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove('show'), 2800); }
  function productImage(p, cls = '') {
    const url = String(p.image || '').trim();
    if (/^https?:\/\//.test(url) || /^data:image\//.test(url)) return `<img class="${cls}" src="${safe(url)}" alt="${safe(p.name)}" loading="lazy" decoding="async">`;
    return '<div class="pc-art" aria-hidden="true"></div>';
  }
  function featuredProduct() {
    return getProduct(featuredId) || activeProducts()[0] || products[0] || null;
  }
  function renderFeatured() {
    const p = featuredProduct();
    if (!p) return;
    featuredId = Number(p.id);
    $('#featuredName').textContent = p.name;
    $('#featuredSpecs').textContent = `${p.cpu} · ${p.gpu} · ${p.ram}`;
    $('#featuredPrice').textContent = eur(p.price);
    $('#heroAdd').dataset.add = p.id;
    $('#heroDetail').dataset.detail = p.id;
    const visual = $('#featuredVisual');
    if (visual) visual.innerHTML = productImage(p);
  }
  function filteredProducts() {
    let list = activeProducts();
    if (activeCat !== 'all') list = list.filter(p => p.cat === activeCat);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => [p.name,p.cat,p.cpu,p.gpu,p.ram,p.ssd,p.description].join(' ').toLowerCase().includes(q));
    }
    list.sort((a,b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'newest') return b.newest - a.newest;
      if (sort === 'stock') return b.stock - a.stock;
      if (sort === 'value') return (b.popular / Math.max(1,b.price)) - (a.popular / Math.max(1,a.price));
      return (Number(b.id) === featuredId ? 10000 : b.popular) - (Number(a.id) === featuredId ? 10000 : a.popular);
    });
    return list;
  }
  function renderProducts() {
    const grid = $('#productsGrid');
    if (!grid) return;
    const list = filteredProducts();
    $('#resultsCount').textContent = String(list.length);
    grid.innerHTML = list.length ? list.map(productCard).join('') : `<div class="empty"><h3>Nenašiel som vhodný PC</h3><p>Zruš filtre alebo nám napíš rozpočet a použitie. Pripravíme ponuku.</p><a class="btn btn-blue" href="#kontakt">Napísať požiadavku</a></div>`;
    renderCounts();
  }
  function productCard(p) {
    const fav = favs.includes(Number(p.id));
    const old = Number(p.oldPrice || 0) > p.price ? `<span class="old">${eur(p.oldPrice)}</span>` : '';
    const saving = Number(p.oldPrice || 0) > p.price ? `<span class="chip">Ušetríte ${eur(Number(p.oldPrice)-p.price)}</span>` : '';
    return `<article class="product" data-product-id="${p.id}">
      <div class="media"><span class="product-tag" style="background:${safe(p.tagColor)}">${safe(p.tag)}</span><span class="stock-badge">Skladom ${p.stock} ks</span>${productImage(p)}</div>
      <div class="product-body">
        <div class="cat">${catLabel(p.cat)}</div>
        <h3>${safe(p.name)}</h3>
        <div class="price-row"><span class="price">${eur(p.price)}</span>${old}</div>
        <p class="muted">${safe(p.description)}</p>
        <div class="specs"><div class="spec"><span>CPU</span><b>${safe(p.cpu)}</b></div><div class="spec"><span>GPU</span><b>${safe(p.gpu)}</b></div><div class="spec"><span>RAM</span><b>${safe(p.ram)}</b></div><div class="spec"><span>Disk</span><b>${safe(p.ssd)}</b></div></div>
        <div class="confidence"><span class="chip">🛡️ ${safe(p.warranty)}</span><span class="chip">✅ ${p.tested ? 'Testované' : 'Kontrola'}</span><span class="chip">↩️ 14 dní</span>${saving}</div>
        <div class="card-actions"><button class="btn btn-blue" data-add="${p.id}">Do košíka</button><button class="btn" data-detail="${p.id}">Detail</button><button class="heart ${fav ? 'active' : ''}" data-fav="${p.id}" aria-label="Obľúbené">♥</button></div>
        <label class="muted" style="display:block;margin-top:10px"><input type="checkbox" data-compare="${p.id}" ${compare.includes(Number(p.id)) ? 'checked' : ''}> Porovnať</label>
      </div>
    </article>`;
  }
  function renderCounts() {
    const qty = cart.reduce((s,i) => s + i.qty, 0);
    $$('#cartCount').forEach(el => el.textContent = qty);
    const f = $('#favCount'); if (f) f.textContent = favs.length;
    const cmp = $('#compareText'); if (cmp) cmp.textContent = `${compare.length} produkt${compare.length === 1 ? '' : 'y'} na porovnanie`;
    $('#compareBar')?.classList.toggle('show', compare.length > 0);
  }
  function addCart(id, qty = 1) {
    const p = getProduct(id); if (!p) return;
    let item = cart.find(i => Number(i.id) === Number(id));
    if (item) item.qty = Math.min(p.stock, item.qty + qty);
    else cart.push({ id: Number(id), qty: Math.min(p.stock, qty) });
    save(LS_CART, cart);
    renderCart(); renderCounts(); toast('✅ Produkt pridaný do košíka');
  }
  function renderCart() {
    const box = $('#cartItems'); if (!box) return;
    if (!cart.length) {
      box.innerHTML = `<div class="empty"><h3>Košík je prázdny</h3><p>Vyber si počítač z ponuky.</p></div>`;
      $('#checkoutForm')?.classList.add('hidden');
      $('#cartTotal').textContent = eur(0);
      return;
    }
    box.innerHTML = cart.map(i => {
      const p = getProduct(i.id) || {};
      return `<div class="cart-item"><div class="thumb">${productImage(p)}</div><div><b>${safe(p.name)}</b><div class="muted">${eur(p.price)} / ks</div><div class="qty"><button data-qty="${i.id}" data-delta="-1">−</button><span>${i.qty}</span><button data-qty="${i.id}" data-delta="1">+</button></div></div><button class="remove" data-remove="${i.id}">Vymazať</button></div>`;
    }).join('');
    updateTotal();
  }
  function subtotal() { return cart.reduce((sum,i) => sum + (Number(getProduct(i.id)?.price || 0) * i.qty), 0); }
  function shippingPrice() { return Number($('#delivery')?.selectedOptions?.[0]?.dataset.price || 0); }
  function orderTotal() { let t = subtotal() + shippingPrice(); if ($('#setupService')?.checked) t += 29; if ($('#warrantyService')?.checked) t += 49; return t; }
  function updateTotal() { const el = $('#cartTotal'); if (el) el.textContent = eur(orderTotal()); }
  const LS_CHECKOUT_DRAFT = 'ctrax_checkout_draft_v2';
  function saveCheckoutDraft() {
    const form = $('#checkoutForm'); if (!form) return;
    const draft = {};
    ['custName','custEmail','custPhone','custAddress','custCity','delivery','payment','orderNote'].forEach(id => { const el = $('#'+id); if (el) draft[id] = el.value; });
    ['setupService','warrantyService','terms'].forEach(id => { const el = $('#'+id); if (el) draft[id] = Boolean(el.checked); });
    save(LS_CHECKOUT_DRAFT, draft);
  }
  function restoreCheckoutDraft() {
    const draft = load(LS_CHECKOUT_DRAFT, null); if (!draft) return;
    Object.entries(draft).forEach(([id,value]) => { const el = $('#'+id); if (!el) return; if (el.type === 'checkbox') el.checked = Boolean(value); else el.value = value; });
    updateTotal();
  }
  function openCart() { renderCart(); $('#cartDrawer')?.classList.add('open'); }
  function placeOrder() {
    if (!cart.length) return toast('Košík je prázdny');
    const name = $('#custName').value.trim(), email = $('#custEmail').value.trim(), phone = $('#custPhone').value.trim();
    if (!name || !email || !phone || !/.+@.+\..+/.test(email)) return toast('⚠️ Vyplň meno, platný e-mail a telefón');
    const deliveryId = $('#delivery')?.value || '';
    if (deliveryId !== 'pickup' && (!$('#custAddress').value.trim() || !$('#custCity').value.trim())) return toast('⚠️ Pri doručení vyplň adresu a mesto');
    if (!$('#terms').checked) return toast('⚠️ Potvrď obchodné podmienky');
    const order = {
      id: Date.now(), order_number: `CTX-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      created_at: new Date().toISOString(), status: 'new', customer_name: name, customer_email: email, customer_phone: phone,
      address: [$('#custAddress').value.trim(), $('#custCity').value.trim()].filter(Boolean).join(', '),
      delivery: $('#delivery').selectedOptions[0].textContent, payment: $('#payment').value,
      items: cart.map(i => ({ id:i.id, name:getProduct(i.id)?.name, qty:i.qty, price:getProduct(i.id)?.price })),
      services: { setup: $('#setupService').checked, warranty: $('#warrantyService').checked }, total: orderTotal(), note: $('#orderNote').value.trim()
    };
    const orders = load(LS_ORDERS, []); orders.unshift(order); save(LS_ORDERS, orders);
    const body = encodeURIComponent(orderEmail(order));
    const subject = encodeURIComponent(`Nová objednávka ${order.order_number}`);
    localStorage.removeItem(LS_CHECKOUT_DRAFT); cart = []; save(LS_CART, cart); renderCart(); renderCounts(); $('#cartDrawer').classList.remove('open'); toast(`✅ Objednávka vytvorená: ${order.order_number}`);
    setTimeout(() => { location.href = `mailto:${C.supportEmail || 'computerax.sk@gmail.com'}?subject=${subject}&body=${body}`; }, 700);
  }
  function orderEmail(o) {
    return ['Dobrý deň,','',`Nová objednávka: ${o.order_number}`,`Meno: ${o.customer_name}`,`E-mail: ${o.customer_email}`,`Telefón: ${o.customer_phone}`,`Adresa: ${o.address || 'neuvedené'}`,`Doprava: ${o.delivery}`,`Platba: ${o.payment}`,'','Položky:',...o.items.map(i => `- ${i.qty}x ${i.name} (${eur(i.price)} / ks)`),'',`Služby: ${o.services.setup ? 'nastavenie PC, ' : ''}${o.services.warranty ? 'predĺžená záruka' : ''}`.replace(/, $/, '') || 'Služby: bez doplnkov',`Spolu: ${eur(o.total)}`,'',`Poznámka: ${o.note || '-'}`].join('\n');
  }
  function detail(id) {
    const p = getProduct(id); if (!p) return;
    $('#modalTitle').textContent = p.name;
    $('#modalBody').innerHTML = `<div class="hero-grid" style="gap:24px;align-items:start"><div class="media" style="height:360px;border-radius:26px">${productImage(p)}</div><div><div class="cat">${catLabel(p.cat)}</div><h2 style="font-family:Outfit;font-size:2.4rem;line-height:1;margin:.4rem 0">${safe(p.name)}</h2><div class="price-row"><span class="price">${eur(p.price)}</span>${p.oldPrice ? `<span class="old">${eur(p.oldPrice)}</span>` : ''}</div><p class="muted">${safe(p.description)}</p><div class="specs"><div class="spec"><span>Procesor</span><b>${safe(p.cpu)}</b></div><div class="spec"><span>Grafická karta</span><b>${safe(p.gpu)}</b></div><div class="spec"><span>RAM</span><b>${safe(p.ram)}</b></div><div class="spec"><span>Úložisko</span><b>${safe(p.ssd)}</b></div><div class="spec"><span>OS</span><b>${safe(p.os)}</b></div><div class="spec"><span>Stav</span><b>${safe(p.condition)}</b></div><div class="spec"><span>Záruka</span><b>${safe(p.warranty)}</b></div><div class="spec"><span>Doručenie</span><b>${safe(p.delivery)}</b></div></div><button class="btn btn-blue" data-add="${p.id}">Pridať do košíka</button></div></div>`;
    $('#productModal').classList.add('open');
  }
  function toggleFav(id) { id = Number(id); favs = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id]; save(LS_FAV, favs); renderProducts(); }
  function openFavs() {
    const list = favs.map(getProduct).filter(Boolean);
    $('#modalTitle').textContent = 'Obľúbené produkty';
    $('#modalBody').innerHTML = list.length ? `<div class="products-grid">${list.map(productCard).join('')}</div>` : `<div class="empty"><h3>Zatiaľ nič v obľúbených</h3><p>Klikni na ♥ pri produkte.</p></div>`;
    $('#productModal').classList.add('open');
  }
  function openAccount() {
    const acc = load(LS_ACCOUNT, {});
    $('#modalTitle').textContent = 'Môj účet';
    const orders = load(LS_ORDERS, []).filter(o => (acc.email && o.customer_email === acc.email) || (acc.phone && o.customer_phone === acc.phone));
    $('#modalBody').innerHTML = `<div class="form-grid"><label>Meno<input class="input" id="accName" value="${safe(acc.name || '')}"></label><label>E-mail<input class="input" id="accEmail" value="${safe(acc.email || '')}"></label><label>Telefón<input class="input" id="accPhone" value="${safe(acc.phone || '')}"></label><div style="align-self:end"><button class="btn btn-blue" id="saveAccount">Uložiť účet</button></div></div><h3 style="margin-top:22px">Moje objednávky</h3>${orders.length ? orders.map(o => `<div class="legal-card" style="margin-top:10px"><b>${safe(o.order_number)}</b><p>${eur(o.total)} · ${new Date(o.created_at).toLocaleString('sk-SK')} · stav: ${safe(o.status)}</p></div>`).join('') : '<p class="muted">Po uložení e-mailu sa tu zobrazia objednávky z tohto prehliadača.</p>'}`;
    $('#productModal').classList.add('open');
    $('#saveAccount').onclick = () => { save(LS_ACCOUNT, { name:$('#accName').value.trim(), email:$('#accEmail').value.trim(), phone:$('#accPhone').value.trim() }); toast('✅ Účet uložený'); openAccount(); };
  }
  function runAdvisor() {
    const use = $('#advisorUse').value, budget = Number($('#advisorBudget').value || 99999);
    let list = activeProducts().filter(p => p.cat === use && p.price <= budget);
    if (!list.length) list = activeProducts().filter(p => p.price <= budget);
    list.sort((a,b) => b.popular - a.popular);
    $('#advisorResult').innerHTML = list.length ? `<h3>Najlepšie možnosti:</h3><div class="products-grid" style="margin-top:12px">${list.slice(0,3).map(productCard).join('')}</div>` : '<div class="empty"><h3>Nenašiel som PC v rozpočte</h3><p>Napíš nám a pripravíme ponuku.</p></div>';
  }
  function showCompare() {
    const list = compare.map(getProduct).filter(Boolean);
    if (list.length < 2) return toast('Vyber aspoň 2 produkty na porovnanie');
    const rows = ['price','cpu','gpu','ram','ssd','os','warranty'].map(k => `<tr>${list.map(p => `<td>${k === 'price' ? eur(p[k]) : safe(p[k] || '')}</td>`).join('')}</tr>`).join('');
    $('#modalTitle').textContent = 'Porovnanie produktov';
    $('#modalBody').innerHTML = `<div style="overflow:auto"><table><thead><tr>${list.map(p => `<th>${safe(p.name)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
    $('#productModal').classList.add('open');
  }
  function bind() {
    document.addEventListener('click', e => {
      const add = e.target.closest('[data-add]'); if (add) addCart(add.dataset.add);
      const fav = e.target.closest('[data-fav]'); if (fav) toggleFav(fav.dataset.fav);
      const det = e.target.closest('[data-detail]'); if (det) detail(det.dataset.detail);
      const rm = e.target.closest('[data-remove]'); if (rm) { cart = cart.filter(i => Number(i.id) !== Number(rm.dataset.remove)); save(LS_CART, cart); renderCart(); renderCounts(); }
      const qty = e.target.closest('[data-qty]'); if (qty) { const item = cart.find(i => Number(i.id) === Number(qty.dataset.qty)); const p = getProduct(qty.dataset.qty); if (item) { item.qty += Number(qty.dataset.delta); if (item.qty <= 0) cart = cart.filter(x => x !== item); else item.qty = Math.min(item.qty, p?.stock || 99); save(LS_CART, cart); renderCart(); renderCounts(); } }
      if (e.target.matches('[data-close-cart]')) $('#cartDrawer').classList.remove('open');
      if (e.target.matches('[data-close-modal]')) e.target.closest('.modal').classList.remove('open');
      const shortcut = e.target.closest('[data-shortcut]'); if (shortcut) { activeCat = shortcut.dataset.shortcut; $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.cat === activeCat)); renderProducts(); }
    });
    $('#openCart')?.addEventListener('click', openCart); $('#mobileCart')?.addEventListener('click', openCart);
    $('#openFavs')?.addEventListener('click', openFavs); $('#openAccount')?.addEventListener('click', openAccount); $('#mobileAccount')?.addEventListener('click', openAccount);
    $('#checkoutBtn')?.addEventListener('click', () => { $('#checkoutForm').classList.remove('hidden'); updateTotal(); });
    $('#placeOrder')?.addEventListener('click', placeOrder);
    ['delivery','setupService','warrantyService'].forEach(id => $('#'+id)?.addEventListener('change', () => { updateTotal(); saveCheckoutDraft(); }));
    ['custName','custEmail','custPhone','custAddress','custCity','payment','orderNote','terms'].forEach(id => $('#'+id)?.addEventListener('input', saveCheckoutDraft));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { $('#cartDrawer')?.classList.remove('open'); $('#productModal')?.classList.remove('open'); } });
    $('#searchInput')?.addEventListener('input', e => { search = e.target.value.trim(); renderProducts(); });
    $('#sortSelect')?.addEventListener('change', e => { sort = e.target.value; renderProducts(); });
    $('#resetFilters')?.addEventListener('click', () => { search=''; activeCat='all'; sort='recommended'; $('#searchInput').value=''; $('#sortSelect').value='recommended'; $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.cat === 'all')); renderProducts(); });
    $$('.tab').forEach(t => t.addEventListener('click', () => { activeCat = t.dataset.cat; $$('.tab').forEach(x => x.classList.toggle('active', x === t)); renderProducts(); }));
    $('#advisorBtn')?.addEventListener('click', runAdvisor);
    $('#compareBtn')?.addEventListener('click', showCompare);
    $('#clearCompare')?.addEventListener('click', () => { compare = []; renderProducts(); renderCounts(); });
    document.addEventListener('change', e => { const cmp = e.target.closest('[data-compare]'); if (cmp) { const id = Number(cmp.dataset.compare); compare = cmp.checked ? [...new Set([...compare, id])] : compare.filter(x => x !== id); renderCounts(); } });
  }
  function init() {
    if ($('#delivery')) $('#delivery').innerHTML = (C.shippingOptions || []).map(o => `<option value="${safe(o.id)}" data-price="${Number(o.price || 0)}">${safe(o.name)} – ${eur(o.price)} (${safe(o.eta)})</option>`).join('');
    renderFeatured(); renderProducts(); renderCart(); renderCounts(); bind(); updateTotal();
    restoreCheckoutDraft();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
