// Computrax public runtime config.
// This file may be uploaded to GitHub Pages only with public/publishable values.
// Never paste service_role, SMTP, GoPay, fakturačný systém, provider private, or other secret keys here.
window.COMPUTRAX_CONFIG = Object.freeze({
  SUPABASE_URL: 'https://aryjaqexfgalxaiseqtp.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_x6sSWhw3on9bi_C1EQdTCg_nz09VWoX',
  SUPPORT_EMAIL: 'computerax.sk@gmail.com',
  PUBLIC_SITE_URL: 'https://computrax.sk',
  EMAIL_ENDPOINT: 'https://aryjaqexfgalxaiseqtp.supabase.co/functions/v1/send-notification',
  WAREHOUSE_SYNC_ENDPOINT: 'https://aryjaqexfgalxaiseqtp.supabase.co/functions/v1/warehouse-sync',
  // Public Google IDs. Fill these after creating the accounts.
  // Example: GOOGLE_TAG_MANAGER_ID: 'GTM-XXXXXXX'
  GOOGLE_TAG_MANAGER_ID: '',
  // Example: GA4_MEASUREMENT_ID: 'G-XXXXXXXXXX'
  GA4_MEASUREMENT_ID: '',
  GOOGLE_MERCHANT_FEED_URL: 'https://computrax.sk/product-feed.xml',
  GOOGLE_BUSINESS_PROFILE_URL: '',
  // Optional: after creating Microsoft Clarity, paste only the public project ID here.
  CLARITY_PROJECT_ID: ''
});

// Privacy controls must load before optional tracking or enhancement scripts.
const computraxConfigBase = new URL('.', document.currentScript?.src || location.href);
const computraxAssetUrl = (path) => new URL(path, computraxConfigBase).href;
const computraxPrivacy = document.createElement('script');
computraxPrivacy.src = computraxAssetUrl('assets/js/privacy-consent.js?v=20260719cart1');
computraxPrivacy.async = false;
document.head.appendChild(computraxPrivacy);

const computraxDeployFix = document.createElement('script');
computraxDeployFix.src = computraxAssetUrl('site-deploy-fix.js?v=20260708deploy95');
computraxDeployFix.async = false;
document.head.appendChild(computraxDeployFix);
