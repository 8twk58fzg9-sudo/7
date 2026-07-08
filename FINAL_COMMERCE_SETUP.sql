-- Computrax final commerce setup for Supabase
-- Run in Supabase SQL Editor after reviewing with your accountant/developer.
-- This file contains no secrets. Provider API keys belong in Supabase Edge Function Secrets.
-- Safe to run more than once: policies are dropped/re-created because PostgreSQL does not support CREATE POLICY IF NOT EXISTS.

-- 1) Orders: payment + invoice readiness
alter table if exists public.orders add column if not exists payment_status text not null default 'unpaid';
alter table if exists public.orders add column if not exists payment_provider text;
alter table if exists public.orders add column if not exists payment_reference text;
alter table if exists public.orders add column if not exists payment_checkout_url text;
alter table if exists public.orders add column if not exists paid_at timestamptz;
alter table if exists public.orders add column if not exists invoice_status text not null default 'not_created';
alter table if exists public.orders add column if not exists invoice_provider text;
alter table if exists public.orders add column if not exists invoice_provider_id text;
alter table if exists public.orders add column if not exists invoice_number text;
alter table if exists public.orders add column if not exists invoice_pdf_url text;
alter table if exists public.orders add column if not exists invoice_created_at timestamptz;
alter table if exists public.orders add column if not exists company_name text;
alter table if exists public.orders add column if not exists company_id text;
alter table if exists public.orders add column if not exists tax_id text;
alter table if exists public.orders add column if not exists vat_id text;
alter table if exists public.orders add column if not exists terms_version text;
alter table if exists public.orders add column if not exists privacy_version text;
alter table if exists public.orders add column if not exists updated_at timestamptz default now();

do $$ begin
  alter table public.orders add constraint orders_payment_status_check
    check (payment_status in ('unpaid','pending','paid','failed','refunded','cancelled'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.orders add constraint orders_invoice_status_check
    check (invoice_status in ('not_created','pending','created','sent','failed','cancelled'));
exception when duplicate_object then null; end $$;

create index if not exists idx_orders_payment_reference on public.orders(payment_reference);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_invoice_status on public.orders(invoice_status);

-- 2) Payment event audit log. Webhooks must be idempotent.
create table if not exists public.payment_events (
  id bigserial primary key,
  provider text not null,
  event_id text not null,
  order_id bigint references public.orders(id) on delete set null,
  payment_reference text,
  status text,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider, event_id)
);

alter table public.payment_events enable row level security;
revoke all on public.payment_events from anon, authenticated;

-- 3) Invoice event audit log.
create table if not exists public.invoice_events (
  id bigserial primary key,
  provider text not null,
  event_type text not null,
  order_id bigint references public.orders(id) on delete cascade,
  invoice_provider_id text,
  invoice_number text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.invoice_events enable row level security;
revoke all on public.invoice_events from anon, authenticated;

-- 4) Provider settings metadata only. Store no API secrets here.
create table if not exists public.commerce_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.commerce_settings enable row level security;
revoke all on public.commerce_settings from anon, authenticated;

insert into public.commerce_settings(key, value) values
  ('payment_provider', '{"provider":"gopay","mode":"test","configured":false}'::jsonb),
  ('invoice_provider', '{"provider":"superfaktura","configured":false}'::jsonb),
  ('company_profile', '{"company_name":"","address":"","ico":"","dic":"","ic_dph":"","email":"computerax.sk@gmail.com","phone":""}'::jsonb)
on conflict (key) do nothing;

-- 5) Admin-only RLS helper.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "Admin users can read own admin marker" on public.admin_users;
create policy "Admin users can read own admin marker"
on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 6) Admin policies for commerce logs/settings.
drop policy if exists "Admins can read payment events" on public.payment_events;
create policy "Admins can read payment events"
on public.payment_events for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can read invoice events" on public.invoice_events;
create policy "Admins can read invoice events"
on public.invoice_events for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can read commerce settings" on public.commerce_settings;
create policy "Admins can read commerce settings"
on public.commerce_settings for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can update commerce settings" on public.commerce_settings;
create policy "Admins can update commerce settings"
on public.commerce_settings for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 7) Atomic inventory reservation. Call only from trusted Edge Functions.
create or replace function public.reserve_inventory(p_product_id bigint, p_qty int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_qty is null or p_qty <= 0 or p_qty > 50 then
    raise exception 'invalid_quantity';
  end if;

  update public.products
  set stock = stock - p_qty,
      status = case when stock - p_qty <= 0 then 'sold' else status end,
      updated_at = now()
  where id = p_product_id
    and stock >= p_qty
    and status = 'active';

  if not found then
    raise exception 'insufficient_stock';
  end if;
end;
$$;

revoke all on function public.reserve_inventory(bigint, int) from public, anon, authenticated;

-- 8) Optional: public products should be read-only. Keep writes admin/server-side.
alter table if exists public.products enable row level security;
alter table if exists public.orders enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select to anon, authenticated
using (status = 'active' and stock >= 0);

drop policy if exists "Customers can read own orders" on public.orders;
create policy "Customers can read own orders"
on public.orders for select to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
on public.orders for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 9) Edge Function secrets to add manually in Supabase Dashboard or CLI:
-- GOPAY_CLIENT_ID
-- GOPAY_CLIENT_SECRET
-- GOPAY_GOID
-- GOPAY_MODE=test or live
-- GOPAY_RETURN_URL=https://computrax.sk/objednavka.html
-- GOPAY_NOTIFICATION_URL=https://<project>.supabase.co/functions/v1/payment-webhook
-- SUPERFAKTURA_EMAIL
-- SUPERFAKTURA_API_KEY
-- SUPERFAKTURA_COMPANY_ID (if your account/API needs it)
-- RESEND_API_KEY
-- NOTIFICATION_FROM_EMAIL
-- NOTIFICATION_TO_EMAIL=computerax.sk@gmail.com
