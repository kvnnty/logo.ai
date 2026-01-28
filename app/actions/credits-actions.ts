"use server";

import Stripe from "stripe";
import { clerkClient, currentUser } from "@clerk/nextjs/server";

const DEFAULT_STARTING_CREDITS = 10;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-10-29.clover",
});

const PLAN_MAPPING: Record<string, { priceId: string; credits: number }> = {
  basic: {
    priceId: process.env.STRIPE_PRICE_ID_BASIC || "",
    credits: 50,
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_ID_PRO || "",
    credits: 150,
  },
  enterprise: {
    priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || "",
    credits: 500,
  },
};

export async function getCredits() {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { remaining: 0 };
    const rawRemaining = (user.unsafeMetadata as any)?.remaining;
    if (typeof rawRemaining === "number") return { remaining: rawRemaining };

    // Initialize once for new users
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(user.id, {
      unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: DEFAULT_STARTING_CREDITS },
    });
    return { remaining: DEFAULT_STARTING_CREDITS };
  } catch (error) {
    return { remaining: 0 };
  }
}

export async function createStripeCheckoutSession(planId: string) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const plan = PLAN_MAPPING[planId];
    if (!plan || !plan.priceId) {
      console.error("Invalid plan or price not configured", { planId, plan });
      return { success: false, error: "Invalid plan or price not configured" };
    }

    const metadata = {
      userId: user.id,
      credits: plan.credits.toString(),
      type: "credit_purchase",
      planId: planId,
    };

    console.log("Creating Stripe checkout session", {
      userId: user.id,
      planId,
      credits: plan.credits,
      priceId: plan.priceId,
      metadata,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?canceled=true`,
      metadata: metadata,
    });

    console.log("Stripe checkout session created", {
      sessionId: session.id,
      url: session.url,
      metadata: session.metadata,
    });

    return { success: true, url: session.url };
  } catch (error) {
    console.error("Stripe error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}
