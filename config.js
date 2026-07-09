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
// Stabilita je dôležitejšia než agresívny lazy-load: doplnky štartujú až po DOMContentLoaded,
// aby nerozbili základné klikacie funkcie z hlavných scriptov.
const computraxRuntimeBase = new URL('.', document.currentScript?.src || location.href).href;
const computraxLoadedScripts = new Set();

function loadComputraxScript(file, version) {
  if (computraxLoadedScripts.has(file)) return;
  computraxLoadedScripts.add(file);
  const script = document.createElement('script');
  script.src = computraxRuntimeBase + file + '?v=' + version;
  script.async = false;
  document.body.appendChild(script);
}

function onComputraxReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
  } else {
    callback();
  }
}

function onComputraxIdle(callback, timeout = 1400) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: Math.max(1200, timeout) });
    return;
  }
  window.setTimeout(callback, timeout);
}

function loadAiToolsOnce() {
  loadComputraxScript('site-ai-picker.js', '20260709stable1');
  loadComputraxScript('site-ai-bot.js', '20260709stable1');
}

onComputraxReady(() => {
  // Layout and compatibility layers, loaded in deterministic order after base DOM exists.
  loadComputraxScript('site-deploy-fix.js', '20260709stable1');
  loadComputraxScript('site-overrides.js', '20260709stable1');
  loadComputraxScript('site-final-polish.js', '20260709stable1');
  loadComputraxScript('site-premium-upgrade.js', '20260709stable1');

  // Nice-to-have extras after the page has had a moment to become interactive.
  onComputraxIdle(() => {
    loadComputraxScript('site-enhancements.js', '20260709stable1');
    loadComputraxScript('site-9.js', '20260709stable1');
    window.setTimeout(() => loadComputraxScript('site-hardened.js', '20260709stable1'), 600);
  });

  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((eventName) => {
    window.addEventListener(eventName, loadAiToolsOnce, { once: true, passive: true });
  });
  window.setTimeout(loadAiToolsOnce, 4500);
});
