import Stripe from "stripe";
import { getEnv } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const env = getEnv();
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY ?? "", {
      apiVersion: "2025-03-31.basil" as Stripe.LatestApiVersion
    });
  }
  return stripeClient;
}
