// Computrax public config – safe for GitHub Pages.
// Do NOT put secret API keys, SMTP passwords, GoPay secrets or service_role keys here.
window.CT_CONFIG = Object.freeze({
  shopName: 'Computrax',
  tagline: 'Prémiové repasované počítače',
  supportEmail: 'computerax.sk@gmail.com',
  supportPhone: '+421 949 835 923',
  whatsappPhone: '421949835923',
  publicSiteUrl: 'https://8twk58fzg9-sudo.github.io/real',
  adminPassword: 'Mackbook.neo',
  currency: '€',
  warrantyText: '12 mesiacov záruka',
  returnText: '14 dní na vrátenie',
  shippingOptions: [
    { id: 'packeta', name: 'Packeta / výdajné miesto', price: 3.90, eta: '1–3 pracovné dni' },
    { id: 'courier', name: 'Kuriér po Slovensku', price: 5.90, eta: '1–2 pracovné dni' },
    { id: 'pickup', name: 'Osobný odber po dohode', price: 0, eta: 'po dohode' }
  ]
});
