import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe/client";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { rateLimitRequest } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rl = rateLimitRequest(request, 5);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const env = getEnv();

    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRO_PRICE_ID) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

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
