(function(){
  'use strict';
  if (window.__CTRX_AI_BOT__) return;
  window.__CTRX_AI_BOT__ = true;

  function isAdmin(){ return /admin_2\.html(?:$|[?#])/i.test(location.pathname); }
  if (isAdmin()) return;

  var config = window.COMPUTRAX_CONFIG || {};
  var endpoint = config.PC_ASSISTANT_ENDPOINT || '';
  var state = { open:false, busy:false, history:[] };

  function qs(s,r){ return (r||document).querySelector(s); }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function money(v){ var n = Number(v||0); return Number.isFinite(n) ? n.toLocaleString('sk-SK',{maximumFractionDigits:0}) + ' €' : '—'; }
  function products(){
    try { if (typeof activeProducts !== 'undefined' && Array.isArray(activeProducts) && activeProducts.length) return activeProducts; } catch(e){}
    try { if (Array.isArray(window.PRODUCTS_DATA) && window.PRODUCTS_DATA.length) return window.PRODUCTS_DATA; } catch(e){}
    try { if (Array.isArray(window.allProducts) && window.allProducts.length) return window.allProducts; } catch(e){}
    return [];
  }
  function normalize(p){
    p = p || {};
    var ram = Number(String(p.ramFilter || p.ram || '').match(/\d+/)?.[0] || 0);
    return { name:String(p.name||'Počítač'), price:Number(p.price||0), stock:Number(p.stock == null ? 1 : p.stock), cat:String(p.cat||p.category||'office').toLowerCase(), cpu:String(p.cpu||''), gpu:String(p.gpu||p.gpu_filter||''), ram:String(p.ram||''), ssd:String(p.ssd||''), image:p.imageUrl || p.image_url || p.image || '', ramNumber:ram };
  }
  function score(p,msg,budget){
    var s=0, t=(msg+' '+p.cat+' '+p.cpu+' '+p.gpu+' '+p.ram+' '+p.ssd).toLowerCase();
    var gaming=/hra|herny|herný|gaming|fps|fortnite|gta|cs2|rtx|grafika/.test(t);
    var office=/škola|skola|práca|praca|firma|office|internet|word|excel|podnik/.test(t);
    var creative=/video|foto|strih|render|photoshop|premiere/.test(t);
    var gpu=/rtx|gtx|radeon|rx|arc/i.test(p.gpu);
    if (p.stock>0) s+=80; else s-=250;
    if (p.price && p.price<=budget) s+=95; else if(p.price) s-=Math.min(120,(p.price-budget)/5);
    if (gaming){ if(p.cat==='gaming')s+=105; if(gpu)s+=90; if(p.ramNumber>=16)s+=25; }
    if (office){ if(p.cat==='office')s+=95; if(/ssd|nvme/i.test(p.ssd))s+=25; if(p.price<=500)s+=25; }
    if (creative){ if(/i7|i9|ryzen\s?7|ryzen\s?9/i.test(p.cpu))s+=55; if(gpu)s+=45; if(p.ramNumber>=32)s+=45; }
    return s;
  }
  function localReply(message){
    var budget = Number((message.match(/(?:do\s*)?(\d{3,5})\s*€?/)||[])[1] || 500);
    var list = products().map(normalize).filter(function(p){ return p.name && p.price>0; }).map(function(p){ return {p:p,s:score(p,message,budget)}; }).sort(function(a,b){ return b.s-a.s; }).slice(0,3).map(function(x){ return x.p; });
    if (!list.length) return { answer:'Nevidím vhodný skladový kus. Napíš rozpočet a použitie, alebo klikni na celú ponuku.', products:[] };
    var first=list[0];
    return { answer:'Najlepšia voľba podľa tvojho zadania je '+first.name+'. Má cenu '+money(first.price)+' a podľa parametrov najlepšie sedí na rozpočet a použitie. Pozri hlavne záruku, stav kusu a dostupnosť.', products:list };
  }
  function productPayload(){ return products().map(function(p){ p=normalize(p); return {name:p.name,price:p.price,stock:p.stock,cat:p.cat,cpu:p.cpu,gpu:p.gpu,ram:p.ram,ssd:p.ssd,image:p.image}; }).slice(0,35); }
  function addStyle(){
    if (qs('#ctrax-ai-bot-style')) return;
    var st=document.createElement('style'); st.id='ctrax-ai-bot-style';
    st.textContent = '.ctrax-bot-button{position:fixed;right:18px;bottom:18px;z-index:9998;border:0;border-radius:999px;background:#0f172a;color:#fff;font-weight:950;padding:.95rem 1.15rem;box-shadow:0 18px 50px rgba(15,23,42,.30);cursor:pointer}.ctrax-bot-button span{color:#93c5fd}.ctrax-bot-panel{position:fixed;right:18px;bottom:82px;width:min(390px,calc(100vw - 24px));max-height:min(680px,calc(100vh - 110px));z-index:9999;background:#fff;border:1px solid rgba(15,23,42,.12);border-radius:24px;box-shadow:0 28px 80px rgba(15,23,42,.28);display:none;overflow:hidden}.ctrax-bot-panel.open{display:grid;grid-template-rows:auto 1fr auto}.ctrax-bot-head{background:linear-gradient(135deg,#0f172a,#2563eb);color:#fff;padding:1rem}.ctrax-bot-head b{display:block;font-size:1rem}.ctrax-bot-head span{display:block;color:#dbeafe;font-size:.82rem;margin-top:.15rem}.ctrax-bot-close{position:absolute;right:12px;top:10px;border:0;background:rgba(255,255,255,.16);color:#fff;border-radius:10px;padding:.3rem .55rem;cursor:pointer}.ctrax-bot-messages{padding:.85rem;overflow:auto;display:grid;gap:.65rem}.ctrax-bot-msg{padding:.72rem .82rem;border-radius:16px;line-height:1.42;font-size:.9rem}.ctrax-bot-msg.bot{background:#f1f5f9;color:#0f172a}.ctrax-bot-msg.user{background:#2563eb;color:#fff;justify-self:end;max-width:82%}.ctrax-bot-products{display:grid;gap:.55rem;margin-top:.55rem}.ctrax-bot-product{border:1px solid rgba(15,23,42,.09);border-radius:14px;padding:.55rem;background:#fff}.ctrax-bot-product b{display:block;color:#0f172a}.ctrax-bot-product small{display:block;color:#64748b;margin:.18rem 0}.ctrax-bot-product div{display:flex;gap:.4rem;margin-top:.45rem}.ctrax-bot-product button{border:0;border-radius:10px;padding:.48rem .58rem;font-weight:900;cursor:pointer}.ctrax-bot-product button:first-child{background:#eef2ff;color:#1d4ed8}.ctrax-bot-product button:last-child{background:#2563eb;color:#fff}.ctrax-bot-quick{padding:.7rem .85rem;border-top:1px solid rgba(15,23,42,.08);display:flex;gap:.42rem;flex-wrap:wrap}.ctrax-bot-quick button{border:1px solid rgba(37,99,235,.18);background:#f8fafc;border-radius:999px;padding:.48rem .62rem;font-weight:900;color:#0f172a;cursor:pointer;font-size:.78rem}.ctrax-bot-input{border-top:1px solid rgba(15,23,42,.08);padding:.72rem;display:grid;grid-template-columns:1fr auto;gap:.5rem}.ctrax-bot-input textarea{resize:none;min-height:42px;max-height:90px;border:1px solid rgba(15,23,42,.15);border-radius:14px;padding:.65rem .72rem;font:inherit}.ctrax-bot-input button{border:0;border-radius:14px;background:#2563eb;color:#fff;font-weight:950;padding:0 .9rem;cursor:pointer}.ctrax-bot-note{font-size:.72rem;color:#64748b;padding:0 .85rem .65rem}@media(max-width:560px){.ctrax-bot-button{right:12px;bottom:12px}.ctrax-bot-panel{right:8px;bottom:70px;width:calc(100vw - 16px)}}';
    document.head.appendChild(st);
  }
  function addMessage(role, html, products){
    var box=qs('#ctraxBotMessages'); if(!box) return;
    var msg=document.createElement('div'); msg.className='ctrax-bot-msg '+role; msg.innerHTML=html;
    if (products && products.length) {
      var grid=document.createElement('div'); grid.className='ctrax-bot-products';
      products.slice(0,3).forEach(function(p){
        var card=document.createElement('div'); card.className='ctrax-bot-product';
        card.innerHTML='<b>'+esc(p.name)+'</b><small>'+esc([p.cpu,p.gpu,p.ram,p.ssd].filter(Boolean).join(' · '))+'</small><strong>'+money(p.price)+'</strong><div><button type="button" data-action="open-detail" data-name="'+esc(p.name)+'">Detail</button><button type="button" data-action="add-cart" data-name="'+esc(p.name)+'" data-price="'+Number(p.price||0)+'">Do košíka</button></div>';
        grid.appendChild(card);
      }); msg.appendChild(grid);
    }
    box.appendChild(msg); box.scrollTop=box.scrollHeight;
  }
  async function ask(text){
    text=String(text||'').trim(); if(!text || state.busy) return;
    state.busy=true; addMessage('user', esc(text));
    var send=qs('#ctraxBotSend'); if(send) send.textContent='...';
    try{
      var result;
      if(endpoint){ var res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,products:productPayload(),history:state.history.slice(-6)})}); if(res.ok) result=await res.json(); }
      if(!result || !result.ok) result=localReply(text);
      var answer=result.answer || 'Skúsim vybrať najbližšiu vhodnú zostavu podľa rozpočtu a skladu.';
      addMessage('bot', esc(answer), (result.products||[]).map(normalize)); state.history.push({role:'user',content:text},{role:'assistant',content:answer});
    } catch(e){ var fallback=localReply(text); addMessage('bot', esc(fallback.answer), fallback.products); }
    finally { state.busy=false; if(send) send.textContent='Poslať'; }
  }
  function install(){
    if(qs('#ctraxBotPanel')) return; addStyle();
    var button=document.createElement('button'); button.className='ctrax-bot-button'; button.id='ctraxBotButton'; button.innerHTML='AI poradca <span>vyberie PC</span>'; document.body.appendChild(button);
    var panel=document.createElement('section'); panel.className='ctrax-bot-panel'; panel.id='ctraxBotPanel'; panel.innerHTML='<button class="ctrax-bot-close" type="button" aria-label="Zavrieť">×</button><div class="ctrax-bot-head"><b>Computrax AI poradca</b><span>Napíš rozpočet alebo klikni. Odporučí skladový PC.</span></div><div class="ctrax-bot-messages" id="ctraxBotMessages"></div><div class="ctrax-bot-quick"><button type="button" data-bot-q="Potrebujem PC do 500 € na školu a internet">PC do 500 €</button><button type="button" data-bot-q="Chcem herný PC do 800 €">Herný do 800 €</button><button type="button" data-bot-q="Potrebujem viac PC pre firmu alebo školu">Firma/škola</button><button type="button" data-bot-q="Chcem najlacnejší spoľahlivý PC">Najlacnejší</button></div><div class="ctrax-bot-input"><textarea id="ctraxBotText" placeholder="Napr. PC do 500 € na školu..."></textarea><button type="button" id="ctraxBotSend">Poslať</button></div><div class="ctrax-bot-note">Poradca odporúča podľa aktuálnych produktov, skladu a rozpočtu. Finálne parametre si skontroluj v detaile produktu.</div>'; document.body.appendChild(panel);
    button.addEventListener('click',function(){ panel.classList.toggle('open'); if(panel.classList.contains('open') && !qs('.ctrax-bot-msg',panel)) addMessage('bot','Napíš napríklad <b>PC do 500 € na školu</b> alebo klikni na rýchlu voľbu.'); });
    qs('.ctrax-bot-close',panel).addEventListener('click',function(){ panel.classList.remove('open'); });
    qs('#ctraxBotSend',panel).addEventListener('click',function(){ var t=qs('#ctraxBotText',panel); ask(t.value); t.value=''; });
    qs('#ctraxBotText',panel).addEventListener('keydown',function(e){ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); qs('#ctraxBotSend',panel).click(); }});
    panel.addEventListener('click',function(e){ var q=e.target.closest('[data-bot-q]'); if(q) ask(q.dataset.botQ); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true}); else install();
})();
