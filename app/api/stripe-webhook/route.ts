import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: `Webhook Error: ${error}` },
        { status: 400 }
      );
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const userId = session.metadata?.userId;
      const credits = session.metadata?.credits;

      if (!userId || !credits) {
        console.error('Missing userId or credits in session metadata');
        return NextResponse.json(
          { error: 'Missing required metadata' },
          { status: 400 }
        );
      }

      try {
        // Get current user metadata
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);
        const currentRemaining = (user.unsafeMetadata?.remaining as number) || 0;
        const newRemaining = currentRemaining + parseInt(credits);

        // Update user metadata with new credits
        await clerk.users.updateUserMetadata(userId, {
          unsafeMetadata: {
            ...user.unsafeMetadata,
            remaining: newRemaining,
          },
        });

        console.log(`Added ${credits} credits to user ${userId}. New total: ${newRemaining}`);

        return NextResponse.json({ received: true });
      } catch (error) {
        console.error('Error updating user credits:', error);
        return NextResponse.json(
          { error: 'Failed to update credits' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

