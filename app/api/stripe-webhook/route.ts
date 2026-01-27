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
      
      console.log('Checkout session completed:', {
        sessionId: session.id,
        paymentStatus: session.payment_status,
        metadata: session.metadata,
      });
      
      const userId = session.metadata?.userId;
      const credits = session.metadata?.credits;
      const purchaseType = session.metadata?.type;

      // Only process credit purchases
      if (purchaseType && purchaseType !== 'credit_purchase') {
        console.log('Skipping non-credit purchase', {
          sessionId: session.id,
          type: purchaseType,
        });
        return NextResponse.json({ received: true, skipped: 'Not a credit purchase' });
      }

      if (!userId || !credits) {
        console.error('Missing userId or credits in session metadata', {
          sessionId: session.id,
          metadata: session.metadata,
          paymentStatus: session.payment_status,
        });
        return NextResponse.json(
          { error: 'Missing required metadata' },
          { status: 400 }
        );
      }

      // Only process if payment was successful
      if (session.payment_status !== 'paid') {
        console.log('Payment not completed, skipping credit addition', {
          sessionId: session.id,
          paymentStatus: session.payment_status,
        });
        return NextResponse.json({ received: true, skipped: 'Payment not completed' });
      }

      try {
        // Get current user metadata
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);
        
        if (!user) {
          console.error('User not found:', userId);
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        const currentRemaining = (user.unsafeMetadata?.remaining as number) || 0;
        const creditsToAdd = parseInt(credits, 10);
        
        if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
          console.error('Invalid credits value:', credits);
          return NextResponse.json(
            { error: 'Invalid credits value' },
            { status: 400 }
          );
        }

        const newRemaining = currentRemaining + creditsToAdd;

        // Update user metadata with new credits
        await clerk.users.updateUserMetadata(userId, {
          unsafeMetadata: {
            ...user.unsafeMetadata,
            remaining: newRemaining,
          },
        });

        console.log(`Successfully added ${creditsToAdd} credits to user ${userId}. Previous: ${currentRemaining}, New total: ${newRemaining}`);

        return NextResponse.json({ 
          received: true,
          userId,
          creditsAdded: creditsToAdd,
          newTotal: newRemaining,
        });
      } catch (error) {
        console.error('Error updating user credits:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error details:', {
          userId,
          credits,
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
        });
        return NextResponse.json(
          { error: 'Failed to update credits', details: errorMessage },
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

