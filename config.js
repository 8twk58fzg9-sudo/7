// Computrax public runtime config.
// This file may be uploaded to GitHub Pages only with public/publishable values.
// Never paste service_role, SMTP, GoPay, fakturačný systém, provider private, or other secret keys here.
window.COMPUTRAX_CONFIG = Object.freeze({
  SUPABASE_URL: 'https://aryjaqexfgalxaiseqtp.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_x6sSWhw3on9bi_C1EQdTCg_nz09VWoX',
  SUPPORT_EMAIL: 'computerax.sk@gmail.com',
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
const computraxPrivacy = document.createElement('script');
computraxPrivacy.src = 'assets/js/privacy-consent.js?v=20260709privacy1';
computraxPrivacy.async = false;
document.head.appendChild(computraxPrivacy);

// Small compatibility layer shared by the storefront and admin on GitHub Pages.
const computraxEnhancements = document.createElement('script');
computraxEnhancements.src = 'site-enhancements.js?v=20260708finalLiveSupabase';
computraxEnhancements.async = false;
document.head.appendChild(computraxEnhancements);

const computraxHardened = document.createElement('script');
computraxHardened.src = 'site-hardened.js?v=20260708revenueSecurity';
computraxHardened.async = false;
document.head.appendChild(computraxHardened);


const computraxNine = document.createElement('script');
computraxNine.src = 'site-9.js?v=20260708nineReady';
computraxNine.async = false;
document.head.appendChild(computraxNine);

const computraxDeployFix = document.createElement('script');
computraxDeployFix.src = 'site-deploy-fix.js?v=20260708deploy95';
computraxDeployFix.async = false;
document.head.appendChild(computraxDeployFix);
