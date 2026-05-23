# Production deployment — The ₹1 Quest

## 1. Razorpay live payments

1. Complete [Razorpay KYC](https://dashboard.razorpay.com/) and activate **Live Mode**.
2. Generate **Live API Key** (`rzp_live_…`) and secret from Dashboard → Settings → API Keys.
3. In [Supabase](https://supabase.com/dashboard) → your project → **Edge Functions** → **Secrets**, set:

| Secret | Value |
|--------|--------|
| `RAZORPAY_KEY_ID` | `rzp_live_…` |
| `RAZORPAY_KEY_SECRET` | live secret |
| `RAZORPAY_ALLOW_LIVE` | `true` |
| `RAZORPAY_MODE` | `live` (optional; auto-detected from key prefix) |

4. Redeploy edge functions:

```bash
npx supabase functions deploy create-order
npx supabase functions deploy verify-payment
npx supabase functions deploy register-user
```

5. (Recommended) Add a Razorpay **Webhook** for `payment.captured` pointing to your `verify-payment` URL for backup verification.

## 2. Frontend hosting

```bash
npm install
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, or Firebase Hosting. Set environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## 3. Database migrations

```bash
npx supabase db push
```

## 4. Admin access

Assign role in SQL (replace user UUID):

```sql
INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_AUTH_USER_ID', 'admin')
ON CONFLICT DO NOTHING;
```

## 5. Smoke test checklist

- [ ] Sign up / log in
- [ ] Pay ₹1 with a real UPI/card (live mode)
- [ ] Register display name
- [ ] Appear on leaderboard
- [ ] Referral link `/ref/CODE` works
- [ ] Admin dashboard loads for admin user
