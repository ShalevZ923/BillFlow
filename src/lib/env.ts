import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  REMINDER_FROM_EMAIL: z.string().default("BillFlow <reminders@example.com>"),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  EXCHANGE_RATE_API_URL: z.string().url().default("https://api.exchangerate.host/latest")
});

export type AppEnv = z.infer<typeof envSchema>;

export function getEnv(source: Record<string, string | undefined> = process.env): AppEnv {
  return envSchema.parse(source);
}
