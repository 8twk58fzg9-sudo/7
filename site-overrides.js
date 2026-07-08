(function(){
  'use strict';
  if (window.__CTRX_SLOVAK_COMPACT__) return;
  window.__CTRX_SLOVAK_COMPACT__ = true;

  function isAdmin(){ return /admin_2\.html(?:$|[?#])/i.test(location.pathname); }
  function qs(s,r){ return (r||document).querySelector(s); }
  function qsa(s,r){ return Array.from((r||document).querySelectorAll(s)); }
  function removeOldGuidedBlock(){
    ['#ctrax-9-hero','#ctrax-trust-strip','#ctrax-revenue-grid'].forEach(function(sel){
      qsa(sel).forEach(function(el){ el.remove(); });
    });
  }
  function addStyle(){
    if (qs('#ctrax-slovak-compact-style')) return;
    var st = document.createElement('style');
    st.id = 'ctrax-slovak-compact-style';
    st.textContent = [
      'body:not(.ctrax-admin-page) #ctrax-9-hero,body:not(.ctrax-admin-page) #ctrax-trust-strip,body:not(.ctrax-admin-page) #ctrax-revenue-grid{display:none!important}',
      'body:not(.ctrax-admin-page) .products-grid{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))!important;gap:1rem!important}',
      'body:not(.ctrax-admin-page) .pc-card{padding:.9rem!important;border-radius:18px!important;box-shadow:0 12px 34px rgba(0,0,0,.20)!important}',
      'body:not(.ctrax-admin-page) .pc-card:hover{transform:translateY(-3px)!important}',
      'body:not(.ctrax-admin-page) .pc-image{aspect-ratio:4/3!important;margin:.55rem 0 .7rem!important;border-radius:14px!important}',
      'body:not(.ctrax-admin-page) .pc-image img{padding:.18rem!important}',
      'body:not(.ctrax-admin-page) .pc-name{font-size:1.08rem!important;line-height:1.12!important}',
      'body:not(.ctrax-admin-page) .pc-specs{margin-bottom:.65rem!important}',
      'body:not(.ctrax-admin-page) .pc-specs li{padding:.34rem 0!important;font-size:.78rem!important}',
      'body:not(.ctrax-admin-page) .condition-strip,body:not(.ctrax-admin-page) .service-teaser{padding:.58rem .65rem!important;margin-bottom:.65rem!important;font-size:.74rem!important}',
      'body:not(.ctrax-admin-page) .pc-price{font-size:1.62rem!important}',
      'body:not(.ctrax-admin-page) .add-cart-btn,body:not(.ctrax-admin-page) .detail-btn{padding:.78rem .9rem!important;border-radius:12px!important;font-size:.82rem!important}',
      'body:not(.ctrax-admin-page) .card-actions{gap:.4rem!important}',
      'body:not(.ctrax-admin-page) nav{box-shadow:0 10px 34px rgba(15,23,42,.08)}',
      '@media(max-width:760px){body:not(.ctrax-admin-page) .products-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:.75rem!important}body:not(.ctrax-admin-page) .pc-card{padding:.72rem!important}body:not(.ctrax-admin-page) .pc-image::after{display:none!important}body:not(.ctrax-admin-page) .pc-specs li{font-size:.72rem!important}}',
      '@media(max-width:420px){body:not(.ctrax-admin-page) .products-grid{grid-template-columns:1fr!important}}'
    ].join('\n');
    document.head.appendChild(st);
  }
  function translateVisibleFragments(){
    if (isAdmin()) return;
    var replacements = new Map([
      ['quick match','rýchly výber'],
      ['Trust','Dôvera'],
      ['Readiness','Pripravenosť'],
      ['Security','Bezpečnosť'],
      ['Merchant feed','produktový feed']
    ]);
    qsa('body *').forEach(function(el){
      if (!el.childNodes || el.childNodes.length !== 1 || el.children.length) return;
      var node = el.firstChild;
      if (!node || node.nodeType !== Node.TEXT_NODE) return;
      var text = node.nodeValue;
      replacements.forEach(function(sk,en){ text = text.replaceAll(en, sk); });
      node.nodeValue = text;
    });
  }
  function boot(){
    if (isAdmin()) return;
    addStyle();
    removeOldGuidedBlock();
    translateVisibleFragments();
    var obs = new MutationObserver(function(){ removeOldGuidedBlock(); });
    obs.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(function(){ obs.disconnect(); removeOldGuidedBlock(); }, 6000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
