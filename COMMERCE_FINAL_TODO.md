# Computrax final commerce checklist

This repo is prepared for a serious e-shop flow without putting secrets in frontend code.

## What is already prepared in code

- `FINAL_COMMERCE_SETUP.sql`
  - adds payment/invoice columns to `orders`
  - adds `payment_events`
  - adds `invoice_events`
  - adds `commerce_settings`
  - adds admin helper/policies
  - adds atomic `reserve_inventory()` function

- `supabase/functions/create-payment/index.ts`
  - safe GoPay payment skeleton
  - refuses to fake payment URLs
  - checks GoPay secrets before doing anything real

- `supabase/functions/payment-webhook/index.ts`
  - safe payment webhook skeleton
  - logs webhook events idempotently
  - requires final GoPay verification before marking paid

- `supabase/functions/create-invoice/index.ts`
  - safe SuperFaktura invoice skeleton
  - admin/internal only
  - refuses to create fake invoices until API mapping is finished

## Secrets you must add in Supabase, never in GitHub

GoPay:

- `GOPAY_CLIENT_ID`
- `GOPAY_CLIENT_SECRET`
- `GOPAY_GOID`
- `GOPAY_MODE` = `test` first, later `live`
- `GOPAY_RETURN_URL`
- `GOPAY_NOTIFICATION_URL`

SuperFaktura:

- `SUPERFAKTURA_EMAIL`
- `SUPERFAKTURA_API_KEY`
- `SUPERFAKTURA_COMPANY_ID` if required by account/API setup

Internal/email:

- `COMMERCE_INTERNAL_KEY`
- `RESEND_API_KEY`
- `NOTIFICATION_FROM_EMAIL`
- `NOTIFICATION_TO_EMAIL=computerax.sk@gmail.com`

## What you must do before real launch

1. Buy/set `computrax.sk`.
2. Set DNS and HTTPS correctly.
3. Create GoPay account and test credentials.
4. Create SuperFaktura Premium account.
5. Ask accountant about VAT regime for refurbished/used PCs.
6. Fill real company data: company name, address, ICO, DIC, IC DPH if applicable.
7. Run `FINAL_COMMERCE_SETUP.sql` in Supabase SQL Editor.
8. Deploy the three new Edge Functions.
9. Add secrets in Supabase.
10. Finish provider payload mapping in the skeleton functions.
11. Test one order end-to-end in test mode:
    - create order
    - create GoPay payment
    - pay in sandbox
    - receive webhook
    - mark paid
    - create invoice
    - send email
    - check stock

## Important security rules

- Frontend must never decide final price, stock, payment status or invoice number.
- Browser return URL from payment is not proof of payment.
- Only verified payment webhook/status check may mark an order paid.
- SuperFaktura/GoPay/Resend/service-role keys must never be committed to GitHub.
- Keep RLS enabled on orders, payment events, invoice events and admin settings.

## Recommended launch order

1. Keep current GitHub Pages frontend working.
2. Add domain and email.
3. Set up Supabase SQL and functions.
4. Add GoPay sandbox.
5. Add SuperFaktura sandbox/API.
6. Test end-to-end.
7. Switch providers from test to live.
8. Only then advertise real online card payments.
