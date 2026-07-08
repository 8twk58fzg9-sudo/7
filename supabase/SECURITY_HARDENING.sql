-- Computrax Supabase hardening script.
-- Run manually in Supabase SQL Editor only after reviewing the function usage.
-- This file is intentionally not executed automatically. Review it before running.

-- 1) Add missing indexes reported by Supabase Performance Advisor.
CREATE INDEX IF NOT EXISTS customer_notes_updated_by_idx ON public.customer_notes(updated_by);
CREATE INDEX IF NOT EXISTS email_templates_updated_by_idx ON public.email_templates(updated_by);
CREATE INDEX IF NOT EXISTS order_status_notifications_requested_by_idx ON public.order_status_notifications(requested_by);

-- 2) Restrict SECURITY DEFINER RPC functions if they do not need to be public.
-- Keep public only when the function validates input, rate limits, and only writes safe analytics data.
-- Uncomment after verifying your frontend does not require anonymous RPC access.
-- REVOKE EXECUTE ON FUNCTION public.log_search(text, integer) FROM anon, authenticated;
-- REVOKE EXECUTE ON FUNCTION public.save_abandoned_cart(text, jsonb, numeric) FROM anon, authenticated;
-- REVOKE EXECUTE ON FUNCTION public.track_product_view(bigint) FROM anon, authenticated;
-- REVOKE EXECUTE ON FUNCTION public.has_role(text) FROM authenticated;

-- 3) Optional: safer grants pattern. Adjust after checking your policies.
-- GRANT EXECUTE ON FUNCTION public.log_search(text, integer) TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.track_product_view(bigint) TO authenticated;

-- 4) Dashboard action: enable leaked password protection:
-- Authentication > Providers > Email > Password security > Leaked password protection.

-- 5) Edge Function secrets to set in CLI, not in HTML:
-- supabase secrets set WAREHOUSE_API_URL="https://provider.example/api/products"
-- supabase secrets set WAREHOUSE_API_KEY="provider-secret-key"
-- supabase secrets set COMPUTRAX_ADMIN_EMAILS="your-admin-email@example.com"
