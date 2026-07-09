# optimize-product-image

Supabase Edge Function for admin-only TinyJPG/Tinify optimization of product images.

Required secret:

```bash
TINIFY_API_KEY=your_tinify_api_key
```

Deploy notes:

```bash
supabase secrets set TINIFY_API_KEY=your_tinify_api_key
supabase functions deploy optimize-product-image --no-verify-jwt
```

The browser never receives the Tinify key. The admin uploads a locally cropped product image, this function calls Tinify, returns an optimized data URL, and the existing admin upload flow stores that optimized file in Supabase Storage.
