import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe/client";

export async function POST(request: Request) {
  try {
    const env = getEnv();

    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRO_PRICE_ID) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const userId = request.headers.get("x-mock-user-id") ?? "00000000-0000-0000-0000-000000000001";

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: env.STRIPE_PRO_PRICE_ID,
          quantity: 1
        }
      ],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing`,
      client_reference_id: userId
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Stripe error" },
      { status: 500 }
    );
  }
}
