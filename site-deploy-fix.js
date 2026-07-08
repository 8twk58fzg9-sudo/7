(function(){
  "use strict";
  if (window.__CTRX_DEPLOY_FIX__) return;
  window.__CTRX_DEPLOY_FIX__ = true;
  var staticProductSlugs = ["alienware-aurora-r14", "dell-optiplex-7090", "hp-omen-40l"];
  function isGithubProjectPages(){ return /\.github\.io$/i.test(location.hostname) && location.pathname.split('/').filter(Boolean).length > 0; }
  function basePath(){ return isGithubProjectPages() ? '/' + location.pathname.split('/').filter(Boolean)[0] : ''; }
  function absoluteInternal(path){
    var base = basePath();
    if (!path || path.charAt(0) !== '/' || path.indexOf('//') === 0) return path;
    return base + path;
  }
  function slugFromProductHref(href){
    try { var u = new URL(href, location.href); var m = u.pathname.match(/\/produkt\/([^\/]+)\/?$/); return m ? decodeURIComponent(m[1]) : ''; } catch(e){ return ''; }
  }
  function normalizeLinks(root){
    (root || document).querySelectorAll('a[href^="/"]').forEach(function(a){
      var original = a.getAttribute('href') || '';
      var productSlug = slugFromProductHref(original);
      if (productSlug && staticProductSlugs.indexOf(productSlug) === -1) {
        a.setAttribute('href', absoluteInternal('/index.html?pc=' + encodeURIComponent(productSlug) + '#ponuka'));
        return;
      }
      if (basePath()) a.setAttribute('href', absoluteInternal(original));
    });
    (root || document).querySelectorAll('img[src^="/"],script[src^="/"],link[href^="/"]').forEach(function(el){
      var attr = el.hasAttribute('src') ? 'src' : 'href';
      var v = el.getAttribute(attr) || '';
      if (basePath()) el.setAttribute(attr, absoluteInternal(v));
    });
  }
  function boot(){
    normalizeLinks(document);
    var observer = new MutationObserver(function(list){
      list.forEach(function(m){
        m.addedNodes && Array.prototype.forEach.call(m.addedNodes, function(n){ if (n && n.nodeType === 1) normalizeLinks(n); });
      });
    });
    observer.observe(document.documentElement, {childList:true, subtree:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
})();