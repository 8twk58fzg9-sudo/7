# Computrax security

Production rules:
- Do not put service_role, SMTP, GoPay, iDoklad, warehouse provider or other private keys into HTML, GitHub Pages or localStorage.
- Public frontend may use only Supabase publishable/anon key with correct RLS.
- Warehouse API credentials belong only in Supabase Edge Function secrets.
- Admin actions should gradually move behind Supabase Auth + RLS + Edge Functions.
- Run `supabase/SECURITY_HARDENING_STRICT.sql` manually in Supabase SQL editor after review.
