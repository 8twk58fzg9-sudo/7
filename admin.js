(() => {
  'use strict';
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));
  const C = window.CT_CONFIG || {};
  const LS_PRODUCTS = 'ctrax_products_v4';
  const LS_FEATURED = 'ctrax_featured_id_v4';
  const LS_ORDERS = 'ctrax_orders_v4';
  const LS_CONFIG = 'ctrax_admin_config_v4';
  const safe = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const eur = v => `${Number(v || 0).toLocaleString('sk-SK', { minimumFractionDigits: Number(v) % 1 ? 2 : 0, maximumFractionDigits: 2 })}${C.currency || '€'}`;
  const load = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  let products = load(LS_PRODUCTS, Array.isArray(window.CT_PRODUCTS) ? window.CT_PRODUCTS : []);
  let orders = load(LS_ORDERS, []);
  let featuredId = Number(localStorage.getItem(LS_FEATURED) || window.CT_FEATURED_ID || products[0]?.id || 0);
  let editingId = null;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove('show'), 2600); }
  function login() { const pw = $('#adminPassword').value; if (pw !== (C.adminPassword || 'Mackbook.neo')) { $('#loginError').classList.remove('hidden'); return; } sessionStorage.setItem('ctrax_admin_ok', '1'); $('#gate').classList.add('hidden'); $('#adminApp').classList.remove('hidden'); boot(); }
  function boot() { loadSettings(); renderAll(); }
  function productStatus(p) { return p.status || (Number(p.stock || 0) > 0 ? 'active' : 'sold'); }
  function saveProducts() { save(LS_PRODUCTS, products); localStorage.setItem(LS_FEATURED, String(featuredId)); renderAll(); }
  function renderAll() { renderStats(); renderProducts(); renderOrders(); renderFeaturedSelect(); }
  function renderStats() {
    $('#statProducts').textContent = products.length;
    $('#statActive').textContent = products.filter(p => productStatus(p) === 'active').length;
    $('#statStock').textContent = products.reduce((s,p) => s + Number(p.stock || 0), 0);
    $('#statOrders').textContent = orders.length;
    $('#statRevenue').textContent = eur(orders.reduce((s,o) => s + Number(o.total || 0), 0));
  }
  function renderProducts() {
    const q = ($('#productSearch')?.value || '').toLowerCase();
    const cat = $('#productCat')?.value || 'all';
    let list = [...products];
    if (cat !== 'all') list = list.filter(p => p.cat === cat);
    if (q) list = list.filter(p => [p.name,p.cpu,p.gpu,p.ram,p.ssd,p.description].join(' ').toLowerCase().includes(q));
    $('#productsAdminGrid').innerHTML = list.length ? list.map(p => `<article class="admin-card ${Number(p.id) === featuredId ? 'featured-admin' : ''}">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><span class="chip">${safe(p.cat)}</span> ${Number(p.id) === featuredId ? '<span class="chip">NA ÚVODE</span>' : ''}<h3 style="font-family:Outfit;font-size:1.35rem;margin:.55rem 0 .2rem">${safe(p.name)}</h3><b style="font-size:1.55rem;color:#93c5fd">${eur(p.price)}</b></div><span class="chip">${Number(p.stock||0)} ks</span></div>
      <p class="muted">${safe(p.description || '')}</p>
      <div style="display:flex;gap:7px;flex-wrap:wrap;margin:12px 0"><span class="chip">${safe(p.cpu)}</span><span class="chip">${safe(p.gpu)}</span><span class="chip">${safe(p.ram)}</span><span class="chip">${safe(p.ssd)}</span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-blue" data-edit="${p.id}">Upraviť</button><button class="btn btn-green" data-feature="${p.id}">Nastaviť na úvod</button><button class="btn" data-copy="${p.id}">Kópia</button><button class="btn btn-red" data-delete="${p.id}">Vymazať</button></div>
    </article>`).join('') : '<div class="admin-card">Žiadne produkty.</div>';
  }
  function renderOrders() {
    const box = $('#ordersAdminTable');
    if (!orders.length) { box.innerHTML = '<p class="muted">Zatiaľ nie sú objednávky.</p>'; return; }
    box.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Objednávka</th><th>Zákazník</th><th>Položky</th><th>Spolu</th><th>Stav</th><th>Akcie</th></tr></thead><tbody>${orders.map(o => `<tr><td><b>${safe(o.order_number)}</b><br><small>${new Date(o.created_at).toLocaleString('sk-SK')}</small></td><td>${safe(o.customer_name)}<br>${safe(o.customer_email)}<br>${safe(o.customer_phone)}<br>${safe(o.address || '')}</td><td>${(o.items || []).map(i => `${safe(i.name)} × ${i.qty}`).join('<br>')}</td><td><b>${eur(o.total)}</b></td><td><select data-status="${o.id}"><option value="new" ${o.status==='new'?'selected':''}>Nová</option><option value="confirmed" ${o.status==='confirmed'?'selected':''}>Potvrdená</option><option value="packed" ${o.status==='packed'?'selected':''}>Zabalená</option><option value="sent" ${o.status==='sent'?'selected':''}>Odoslaná</option><option value="done" ${o.status==='done'?'selected':''}>Dokončená</option><option value="cancelled" ${o.status==='cancelled'?'selected':''}>Zrušená</option></select></td><td><button class="btn" data-slip="${o.id}">Baliaci list</button><button class="btn btn-red" data-delete-order="${o.id}">Vymazať</button></td></tr>`).join('')}</tbody></table></div>`;
  }
  function renderFeaturedSelect() {
    const sel = $('#featuredSelect');
    if (!sel) return;
    sel.innerHTML = products.map(p => `<option value="${p.id}" ${Number(p.id) === featuredId ? 'selected' : ''}>${safe(p.name)} – ${eur(p.price)}</option>`).join('');
  }
  function openProduct(id = null) {
    editingId = id ? Number(id) : null;
    const p = products.find(x => Number(x.id) === editingId) || { id: Date.now(), cat:'gaming', status:'active', stock:1, price:0, tag:'SKLADOM', tagColor:'#2563eb', os:'Windows 11 Pro', warranty:'12 mesiacov', delivery:'Kuriér / Packeta', tested:true };
    $('#modalTitle').textContent = editingId ? 'Upraviť produkt' : 'Pridať produkt';
    ['id','name','cat','status','price','oldPrice','stock','tag','tagColor','cpu','cpuBrand','gpu','gpuFilter','ram','ramFilter','ssd','storageType','os','condition','warranty','delivery','image','description'].forEach(k => { const el = $('#f_'+k); if (el) el.value = p[k] ?? ''; });
    $('#f_tested').checked = p.tested !== false;
    $('#productModal').classList.add('open');
  }
  function readProduct() {
    return {
      id: Number($('#f_id').value) || Date.now(), name: $('#f_name').value.trim() || 'Nový počítač', cat: $('#f_cat').value, status: $('#f_status').value,
      price: Number($('#f_price').value || 0), oldPrice: $('#f_oldPrice').value ? Number($('#f_oldPrice').value) : '', stock: Number($('#f_stock').value || 0),
      tag: $('#f_tag').value.trim() || 'SKLADOM', tagColor: $('#f_tagColor').value.trim() || '#2563eb', cpu: $('#f_cpu').value.trim(), cpuBrand: $('#f_cpuBrand').value,
      gpu: $('#f_gpu').value.trim(), gpuFilter: $('#f_gpuFilter').value.trim(), ram: $('#f_ram').value.trim(), ramFilter: $('#f_ramFilter').value.trim(),
      ssd: $('#f_ssd').value.trim(), storageType: $('#f_storageType').value, os: $('#f_os').value.trim() || 'Windows 11 Pro',
      condition: $('#f_condition').value.trim() || 'Repasované – veľmi dobrý stav', warranty: $('#f_warranty').value.trim() || '12 mesiacov', delivery: $('#f_delivery').value.trim() || 'Kuriér / Packeta',
      image: $('#f_image').value.trim(), description: $('#f_description').value.trim(), tested: $('#f_tested').checked, popular: 80, newest: Date.now()
    };
  }
  function saveProduct() { const p = readProduct(); const i = products.findIndex(x => Number(x.id) === Number(p.id)); if (i >= 0) products[i] = { ...products[i], ...p }; else products.unshift(p); saveProducts(); $('#productModal').classList.remove('open'); toast('✅ Produkt uložený'); }
  function productDataText() { return `// Public product data exported from Computrax admin.\nwindow.CT_FEATURED_ID = ${JSON.stringify(featuredId)};\nwindow.CT_PRODUCTS = ${JSON.stringify(products, null, 2)};\n`; }
  function download(name, text, type = 'text/plain') { const blob = new Blob([text], { type }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
  function loadSettings() { const s = { ...C, ...load(LS_CONFIG, {}) }; $('#setEmail').value = s.supportEmail || ''; $('#setPhone').value = s.supportPhone || ''; $('#setWhatsapp').value = s.whatsappPhone || ''; $('#setSite').value = s.publicSiteUrl || ''; }
  function backup() { $('#backupBox').value = JSON.stringify({ products, featuredId, orders, settings: load(LS_CONFIG, {}) }, null, 2); }
  function importBackup() { try { const b = JSON.parse($('#backupBox').value); if (Array.isArray(b.products)) products = b.products; if (b.featuredId) featuredId = Number(b.featuredId); if (Array.isArray(b.orders)) orders = b.orders; if (b.settings) save(LS_CONFIG, b.settings); saveProducts(); save(LS_ORDERS, orders); loadSettings(); toast('✅ Záloha importovaná'); } catch { toast('⚠️ Neplatná JSON záloha'); } }
  function printSlip(id) { const o = orders.find(x => Number(x.id) === Number(id)); if (!o) return; const w = window.open('', '_blank'); w.document.write(`<html><head><title>${safe(o.order_number)}</title><style>body{font-family:Arial;margin:32px;color:#111}table{width:100%;border-collapse:collapse}td,th{padding:9px;border-bottom:1px solid #ddd;text-align:left}.box{border:1px solid #ddd;border-radius:10px;padding:14px;margin:14px 0}</style></head><body><h1>Baliaci list</h1><p>${safe(o.order_number)} · ${new Date(o.created_at).toLocaleString('sk-SK')}</p><div class="box"><b>Zákazník:</b><br>${safe(o.customer_name)}<br>${safe(o.address || '')}<br>${safe(o.customer_email)} · ${safe(o.customer_phone)}</div><table><thead><tr><th>✓</th><th>Položka</th><th>Ks</th></tr></thead><tbody>${(o.items || []).map(i => `<tr><td>☐</td><td>${safe(i.name)}</td><td>${i.qty}</td></tr>`).join('')}</tbody></table><p><button onclick="print()">Tlačiť</button></p></body></html>`); w.document.close(); }
  
  function readinessReport() {
    const issues = [];
    if (!products.length) issues.push('Pridaj aspoň jeden produkt.');
    if (!products.some(p => Number(p.id) === Number(featuredId))) issues.push('Vyber hlavný PC na úvod.');
    products.forEach(p => {
      if (!p.name || !p.price || !p.cpu || !p.ram || !p.ssd) issues.push(`Produkt ${p.name || p.id}: chýbajú základné údaje.`);
      if (!p.image) issues.push(`Produkt ${p.name}: chýba reálna fotka.`);
    });
    if ((C.adminPassword || '') === 'computrax') issues.push('Zmeň pôvodné admin heslo.');
    $('#launchCheckBox').innerHTML = issues.length
      ? `<div class="notice"><b>Treba dopracovať:</b><ul>${issues.map(i=>`<li>${safe(i)}</li>`).join('')}</ul></div>`
      : '<div class="notice" style="border-color:rgba(22,163,74,.35);background:rgba(22,163,74,.09);color:#bbf7d0"><b>Vyzerá pripravené.</b> Skontroluj ešte právne údaje a reálnu objednávku.</div>';
  }

  function bind() {
    $('#loginBtn').onclick = login; $('#adminPassword').addEventListener('keydown', e => { if (e.key === 'Enter') login(); }); $('#logoutBtn').onclick = () => { sessionStorage.removeItem('ctrax_admin_ok'); location.reload(); };
    $('#newProductBtn').onclick = () => openProduct(); $('#saveProductBtn').onclick = saveProduct; $('#downloadDataBtn').onclick = () => download('product-data.js', productDataText(), 'application/javascript'); $('#downloadDataBtn2').onclick = () => download('product-data.js', productDataText(), 'application/javascript');
    $('#sampleBtn').onclick = () => { products = JSON.parse(JSON.stringify(window.CT_PRODUCTS || [])); featuredId = Number(window.CT_FEATURED_ID || products[0]?.id || 0); saveProducts(); toast('Vzorové produkty obnovené'); };
    $('#saveFeaturedBtn').onclick = () => { featuredId = Number($('#featuredSelect').value); saveProducts(); toast('✅ Hlavný PC nastavený'); };
    $('#productSearch').oninput = renderProducts; $('#productCat').onchange = renderProducts;
    $('#saveSettingsBtn').onclick = () => { save(LS_CONFIG, { supportEmail:$('#setEmail').value, supportPhone:$('#setPhone').value, whatsappPhone:$('#setWhatsapp').value, publicSiteUrl:$('#setSite').value }); toast('✅ Nastavenia uložené lokálne'); };
    $('#exportBackupBtn').onclick = backup; $('#importBackupBtn').onclick = importBackup; $('#copyConfigBtn').onclick = () => { const text = `window.CT_CONFIG = Object.freeze(${JSON.stringify({ ...C, supportEmail:$('#setEmail').value, supportPhone:$('#setPhone').value, whatsappPhone:$('#setWhatsapp').value, publicSiteUrl:$('#setSite').value }, null, 2)});`; navigator.clipboard?.writeText(text); toast('Config skopírovaný'); };
    $('#clearOrdersBtn').onclick = () => { if (confirm('Vymazať všetky objednávky z tohto prehliadača?')) { orders = []; save(LS_ORDERS, orders); renderAll(); } }; $('#runLaunchCheck') && ($('#runLaunchCheck').onclick = readinessReport);
    $$('.admin-tab').forEach(t => t.onclick = () => { $$('.admin-tab').forEach(x => x.classList.toggle('active', x === t)); $$('.admin-section').forEach(s => s.classList.remove('active')); $('#' + t.dataset.tab).classList.add('active'); });
    document.addEventListener('click', e => { if (e.target.matches('[data-close-modal]')) e.target.closest('.modal').classList.remove('open'); const edit = e.target.closest('[data-edit]'); if (edit) openProduct(edit.dataset.edit); const del = e.target.closest('[data-delete]'); if (del && confirm('Vymazať produkt?')) { products = products.filter(p => Number(p.id) !== Number(del.dataset.delete)); saveProducts(); } const feat = e.target.closest('[data-feature]'); if (feat) { featuredId = Number(feat.dataset.feature); saveProducts(); toast('✅ Produkt je na úvode'); } const copy = e.target.closest('[data-copy]'); if (copy) { const p = products.find(x => Number(x.id) === Number(copy.dataset.copy)); products.unshift({ ...p, id: Date.now(), name: p.name + ' – kópia' }); saveProducts(); } const slip = e.target.closest('[data-slip]'); if (slip) printSlip(slip.dataset.slip); const doo = e.target.closest('[data-delete-order]'); if (doo && confirm('Vymazať objednávku?')) { orders = orders.filter(o => Number(o.id) !== Number(doo.dataset.deleteOrder)); save(LS_ORDERS, orders); renderAll(); } });
    document.addEventListener('change', e => { const st = e.target.closest('[data-status]'); if (st) { const o = orders.find(x => Number(x.id) === Number(st.dataset.status)); if (o) { o.status = st.value; save(LS_ORDERS, orders); renderStats(); toast('Stav uložený'); } } });
  }
  document.addEventListener('DOMContentLoaded', () => { bind(); if (sessionStorage.getItem('ctrax_admin_ok') === '1') { $('#gate').classList.add('hidden'); $('#adminApp').classList.remove('hidden'); boot(); } else $('#adminPassword').focus(); });
})();
