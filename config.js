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
const computraxRuntimeBase = new URL('.', document.currentScript?.src || location.href).href;
function loadComputraxScript(file, version) {
  const script = document.createElement('script');
  script.src = computraxRuntimeBase + file + '?v=' + version;
  script.async = false;
  document.head.appendChild(script);
}

loadComputraxScript('site-enhancements.js', '20260709finalPolish');
loadComputraxScript('site-hardened.js', '20260709finalPolish');
loadComputraxScript('site-9.js', '20260709finalPolish');
loadComputraxScript('site-deploy-fix.js', '20260709finalPolish');
loadComputraxScript('site-overrides.js', '20260709finalPolish');
loadComputraxScript('site-ai-picker.js', '20260709finalPolish');
loadComputraxScript('site-ai-bot.js', '20260709aiBot2');
loadComputraxScript('site-final-polish.js', '20260709finalPolish');
loadComputraxScript('site-premium-upgrade.js', '20260709premium1');
