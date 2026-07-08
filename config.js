// Computrax public runtime config.
// This file may be uploaded to GitHub Pages only with public/publishable values.
// Never paste private backend, SMTP, payment, accounting, warehouse, or provider secret keys here.
window.COMPUTRAX_CONFIG = Object.freeze({
  SUPABASE_URL: 'https://aryjaqexfgalxaiseqtp.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_x6sSWhw3on9bi_C1EQdTCg_nz09VWoX',
  SUPPORT_EMAIL: 'computerax.sk@gmail.com',
  EMAIL_ENDPOINT: 'https://aryjaqexfgalxaiseqtp.supabase.co/functions/v1/send-notification',
  WAREHOUSE_SYNC_ENDPOINT: 'https://aryjaqexfgalxaiseqtp.supabase.co/functions/v1/warehouse-sync',
  // Voliteľné: po vytvorení Microsoft Clarity vlož iba verejné ID projektu.
  CLARITY_PROJECT_ID: ''
});

// Spoločná kompatibilná vrstva pre verejnú stránku aj admin na GitHub Pages.
const computraxEnhancements = document.createElement('script');
computraxEnhancements.src = 'site-enhancements.js?v=20260709aiPicker';
computraxEnhancements.async = false;
document.head.appendChild(computraxEnhancements);

const computraxHardened = document.createElement('script');
computraxHardened.src = 'site-hardened.js?v=20260708revenueSecurity';
computraxHardened.async = false;
document.head.appendChild(computraxHardened);

const computraxNine = document.createElement('script');
computraxNine.src = 'site-9.js?v=20260709aiPicker';
computraxNine.async = false;
document.head.appendChild(computraxNine);

const computraxDeployFix = document.createElement('script');
computraxDeployFix.src = 'site-deploy-fix.js?v=20260708deploy95';
computraxDeployFix.async = false;
document.head.appendChild(computraxDeployFix);

const computraxSlovakCompact = document.createElement('script');
computraxSlovakCompact.src = 'site-overrides.js?v=20260709aiPicker';
computraxSlovakCompact.async = false;
document.head.appendChild(computraxSlovakCompact);

const computraxAiPicker = document.createElement('script');
computraxAiPicker.src = 'site-ai-picker.js?v=20260709aiPicker';
computraxAiPicker.async = false;
document.head.appendChild(computraxAiPicker);
