-- Computrax Supabase security/performance follow-up.
-- Review before running in Supabase SQL editor.

-- Security: restrict SECURITY DEFINER functions if they are not intentionally public.
-- If search logging and product view tracking must stay public, keep anon execute only for those specific read/write-safe functions.
-- Otherwise uncomment the relevant REVOKE lines:
-- REVOKE EXECUTE ON FUNCTION public.log_search(text, integer) FROM anon, authenticated;
-- REVOKE EXECUTE ON FUNCTION public.save_abandoned_cart(text, jsonb, numeric) FROM anon, authenticated;
-- REVOKE EXECUTE ON FUNCTION public.track_product_view(bigint) FROM anon, authenticated;
-- REVOKE EXECUTE ON FUNCTION public.has_role(text) FROM authenticated;

-- Performance: covering indexes for foreign keys reported by Supabase advisors.
CREATE INDEX IF NOT EXISTS customer_notes_updated_by_idx ON public.customer_notes(updated_by);
CREATE INDEX IF NOT EXISTS email_templates_updated_by_idx ON public.email_templates(updated_by);
CREATE INDEX IF NOT EXISTS order_status_notifications_requested_by_idx ON public.order_status_notifications(requested_by);

-- Auth hardening: enable leaked password protection in Supabase Dashboard > Authentication > Providers > Email.
