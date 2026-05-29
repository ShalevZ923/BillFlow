# Environment Variables Setup

Each variable from `.env.example` is documented below.

## Required for all environments

| Variable | Provider | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | You | Public URL of the app (default: `http://localhost:3000`) |
| `DATABASE_URL` | Supabase | PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Supabase service role key (server-side only) |
| `CRON_SECRET` | You | Shared secret for securing cron endpoints |

## Required for Pro features

| Variable | Provider | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe | Secret key for Stripe API |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Webhook signing secret |
| `STRIPE_PRO_PRICE_ID` | Stripe | Price ID for Pro subscription |
| `OPENAI_API_KEY` | OpenAI | API key for AI insights and AI Fill |
| `RESEND_API_KEY` | Resend | API key for email reminders |
| `REMINDER_FROM_EMAIL` | Resend | Verified sender email address |

## Required for notifications

| Variable | Provider | Description |
|----------|----------|-------------|
| `VAPID_PUBLIC_KEY` | You (generated) | Public key for Web Push |
| `VAPID_PRIVATE_KEY` | You (generated) | Private key for Web Push |

## Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `EXCHANGE_RATE_API_URL` | `https://api.exchangerate.host/latest` | Exchange rate API endpoint |

## Local Development

1. Copy `.env.example` to `.env`
2. Fill in Supabase credentials from your Supabase project dashboard
3. For local dev without Pro features, leave Stripe/OpenAI/Resend keys empty — the app handles missing keys gracefully
4. Run `pnpm dev` to start the dev server
