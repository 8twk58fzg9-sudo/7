// Computrax public runtime config.
// This file may be uploaded to GitHub Pages only with public/publishable values.
// Never paste private backend, SMTP, payment, accounting, warehouse, or provider secret keys here.
window.COMPUTRAX_CONFIG = Object.freeze({
  SUPABASE_URL: 'https://aryjaqexfgalxaiseqtp.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_x6sSWhw3on9bi_C1EQdTCg_nz09VWoX',
  SUPPORT_EMAIL: 'computerax.sk@gmail.com',
  EMAIL_ENDPOINT: 'https://aryjaqexfgalxaiseqtp.supabase.co/functions/v1/send-notification',
  ORDER_STATUS_EMAIL_ENDPOINT: 'https://aryjaqexfgalxaiseqtp.supabase.co/functions/v1/notify-order-status',
  CREATE_PAYMENT_ENDPOINT: 'https://aryjaqexfgalxaiseqtp.supabase.co/functions/v1/create-payment',
  CREATE_INVOICE_ENDPOINT: 'https://aryjaqexfgalxaiseqtp.supabase.co/functions/v1/create-invoice',
  WAREHOUSE_SYNC_ENDPOINT: 'https://aryjaqexfgalxaiseqtp.supabase.co/functions/v1/warehouse-sync',
  PC_ASSISTANT_ENDPOINT: 'https://aryjaqexfgalxaiseqtp.supabase.co/functions/v1/pc-assistant',
  // Voliteľné: po vytvorení Microsoft Clarity vlož iba verejné ID projektu.
  CLARITY_PROJECT_ID: ''
});

// Spoločná kompatibilná vrstva pre verejnú stránku aj admin na GitHub Pages.
// Kritické opravy načítame hneď, vizuálne/AI doplnky až po prvom vykreslení.
const computraxRuntimeBase = new URL('.', document.currentScript?.src || location.href).href;
const computraxLoadedScripts = new Set();

function loadComputraxScript(file, version, options = {}) {
  if (computraxLoadedScripts.has(file)) return;
  computraxLoadedScripts.add(file);
  const script = document.createElement('script');
  script.src = computraxRuntimeBase + file + '?v=' + version;
  script.async = options.ordered ? false : true;
  script.defer = true;
  document.head.appendChild(script);
}

function onComputraxIdle(callback, timeout = 1200) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: Math.max(1200, timeout) });
    return;
  }
  window.setTimeout(callback, timeout);
}

function afterFirstPaint(callback) {
  if (document.readyState === 'complete') {
    onComputraxIdle(callback, 900);
    return;
  }
  window.addEventListener('load', () => onComputraxIdle(callback, 900), { once: true });
}

function loadAiToolsOnce() {
  loadComputraxScript('site-ai-picker.js', '20260709perf1');
  loadComputraxScript('site-ai-bot.js', '20260709perf1');
}

// Small compatibility fixes that affect initial layout/navigation.
loadComputraxScript('site-deploy-fix.js', '20260709perf1', { ordered: true });
loadComputraxScript('site-overrides.js', '20260709perf1', { ordered: true });

// Non-critical polish after first render. These should not block first paint.
afterFirstPaint(() => {
  loadComputraxScript('site-enhancements.js', '20260709perf1');
  loadComputraxScript('site-9.js', '20260709perf1');
  loadComputraxScript('site-final-polish.js', '20260709perf1');
  loadComputraxScript('site-premium-upgrade.js', '20260709perf1');
  window.setTimeout(() => loadComputraxScript('site-hardened.js', '20260709perf1'), 500);
});

// AI is useful, but heavy. Load it on intent, or after the page is already usable.
['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((eventName) => {
  window.addEventListener(eventName, loadAiToolsOnce, { once: true, passive: true });
});
window.setTimeout(loadAiToolsOnce, 4200);
