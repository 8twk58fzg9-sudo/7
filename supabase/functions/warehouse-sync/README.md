# Computrax warehouse sync

This Edge Function lets the browser admin trigger a secure warehouse/API sync without exposing private supplier keys in HTML.

Private keys go only into Supabase secrets:

```bash
supabase secrets set WAREHOUSE_API_URL="https://supplier.example/api/products"
supabase secrets set WAREHOUSE_API_KEY="secret"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="service-role-key"
```

Optional auth modes:

```bash
supabase secrets set WAREHOUSE_AUTH_TYPE="bearer"
supabase secrets set WAREHOUSE_AUTH_TYPE="x-api-key"
supabase secrets set WAREHOUSE_AUTH_HEADER="X-API-Key"
supabase secrets set WAREHOUSE_AUTH_TYPE="query"
supabase secrets set WAREHOUSE_QUERY_KEY="api_key"
```

Modes from admin:
- `preview` only shows what would be imported.
- `update_stock` updates matched products.
- `create_products` updates matched products and creates missing products.
