import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe/client";
import { createDb } from "@/db/client";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { mapSubscriptionToPlan } from "@/lib/stripe/subscriptions";
import type { SubscriptionStatus } from "@/lib/stripe/subscriptions";

export async function POST(request: Request) {
  try {
    const env = getEnv();

    if (!env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const body = await request.text();
    const stripe = getStripe();

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const db = createDb();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        if (userId && subscriptionId) {
          await db
            .update(profiles)
            .set({ plan: "pro", stripeCustomerId: session.customer as string, stripeSubscriptionId: subscriptionId })
            .where(eq(profiles.id, userId));
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const status = subscription.status as SubscriptionStatus;
        const plan = mapSubscriptionToPlan(status);

        const stripeSubscriptionId = subscription.id;
        if (stripeSubscriptionId) {
          await db
            .update(profiles)
            .set({ plan, stripeSubscriptionId: event.type === "customer.subscription.deleted" ? null : stripeSubscriptionId })
            .where(eq(profiles.stripeSubscriptionId, stripeSubscriptionId));
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook error" },
      { status: 500 }
    );
  }
}
