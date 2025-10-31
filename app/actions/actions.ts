'use server';

import OpenAI from 'openai';
import { z } from 'zod';
import dedent from 'dedent';
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { ensureDbConnected, Logo } from '@/db';
import Stripe from 'stripe';

const apiKey = process.env.NEBIUS_API_KEY;
if (!apiKey) {
  throw new Error('NEBIUS_API_KEY is not defined in environment variables');
}


const { HELICONE_API_KEY } = process.env;

const clientOptions: ConstructorParameters<typeof OpenAI>[0] = {
  apiKey,
  baseURL: HELICONE_API_KEY
    ? "https://nebius.helicone.ai/v1/"
    : "https://api.studio.nebius.ai/v1/",
  ...(HELICONE_API_KEY && {
    defaultHeaders: { "Helicone-Auth": `Bearer ${HELICONE_API_KEY}` },
  }),
};

const client = new OpenAI(clientOptions);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

const FormSchema = z.object({
  companyName: z.string(),
  style: z.string(),
  symbolPreference: z.string(),
  additionalInfo: z.string().optional(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  model: z.enum(['dall-e-3','black-forest-labs/flux-schnell', 'black-forest-labs/flux-dev']),
  size: z.enum(['256x256','512x512','1024x1024']).default('512x512'),
  quality: z.enum(['standard', 'hd']).default('standard'),
});

const styleLookup: { [key: string]: string } = {
  flashy: "Flashy, attention grabbing, bold, futuristic, and eye-catching. Use vibrant neon colors with metallic, shiny, and glossy accents.",
  tech: "highly detailed, sharp focus, cinematic, photorealistic, Minimalist, clean, sleek, neutral color pallete with subtle accents, clean lines, shadows, and flat.",
  corporate: "modern, forward-thinking, flat design, geometric shapes, clean lines, natural colors with subtle accents, use strategic negative space to create visual interest.",
  creative: "playful, lighthearted, bright bold colors, rounded shapes, lively.",
  abstract: "abstract, artistic, creative, unique shapes, patterns, and textures to create a visually interesting and wild logo.",
  minimal: "minimal, simple, timeless, versatile, single color logo, use negative space, flat design with minimal details, Light, soft, and subtle.",
};

// Helper function to convert hex to color name
function hexToColorName(hex: string): string {
  const colorMap: Record<string, string> = {
    '#2563eb': 'blue',
    '#dc2626': 'red',
    '#d97706': 'orange',
    '#16a34a': 'green',
    '#9333ea': 'purple',
    '#000000': 'black',
    '#ffffff': 'white',
    '#f8fafc': 'light gray',
    '#fee2e2': 'light red',
    '#fef2f2': 'light pink',
    '#eff6ff': 'light blue',
    '#f0fff4': 'light green',
  };
  return colorMap[hex.toLowerCase()] || hex;
}

export async function generateLogo(formData: z.infer<typeof FormSchema>) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check credits from Clerk metadata
    const currentRemaining = (user.unsafeMetadata?.remaining as number) || 0;
    
    if (currentRemaining <= 0) {
      return { 
        success: false, 
        error: "You've run out of credits. Please purchase more credits to continue." 
      };
    }

    // Deduct 1 credit
    const newRemaining = currentRemaining - 1;
    
    await (await clerkClient()).users.updateUserMetadata(user.id, {
      unsafeMetadata: {
        remaining: newRemaining,
      },
    });

    console.log("your remaining credits:", newRemaining)
    
    if (newRemaining === 0) {
      console.log("Warning: Last credit used!");
    }

    const validatedData = FormSchema.parse(formData);
    
    // Convert hex colors to color names for better AI understanding
    const primaryColorName = hexToColorName(validatedData.primaryColor);
    const secondaryColorName = hexToColorName(validatedData.secondaryColor);
    
    const prompt = dedent`A single logo, high-quality, award-winning professional design, made for both digital and print media, only contains a few vector shapes, ${styleLookup[validatedData.style]}. Primary color is ${primaryColorName} and background color is ${secondaryColorName}. The company name is ${validatedData.companyName}, make sure to include the company name in the logo. ${validatedData.additionalInfo ? `Additional info: ${validatedData.additionalInfo}` : ""}`;
    
    const response = await client.images.generate({
      model: validatedData.model,
      prompt: prompt,
      response_format: "url",
      size: validatedData.size,
      quality: validatedData.quality,
      n: 1,
    });

    const imageUrl = response.data?.[0]?.url || "";

    const DatabaseData = {
      image_url: imageUrl,
      primary_color: validatedData.primaryColor,
      background_color: validatedData.secondaryColor,
      username: user.username ?? user.firstName ?? 'Anonymous',
      userId: user.id,
    };

    try {
      await ensureDbConnected();
      await Logo.create(DatabaseData);
    } catch (error) {
      console.error('Error inserting logo into database:', error);
      throw error;
    }
    
    return { 
      success: true, 
      url: imageUrl,
    };
  } catch (error) {
    console.error('Error generating logo:', error);
    return { success: false, error: 'Failed to generate logo' };
  }
}

export async function checkHistory() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    await ensureDbConnected();
    const userIdToQuery = user.externalId ? user.externalId : user.id;
    const userLogos = await Logo.find({ userId: userIdToQuery }).sort({ createdAt: -1 });

    return userLogos.map(logo => ({
      id: logo._id.toString(),
      _id: logo._id.toString(),
      image_url: logo.image_url,
      primary_color: logo.primary_color,
      background_color: logo.background_color,
      username: logo.username,
      userId: logo.userId,
      createdAt: logo.createdAt,
      updatedAt: logo.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching user logos:', error);
    return null;
  }
}

export async function allLogos(){
  try{
    await ensureDbConnected();
    const allLogos = await Logo.find({}).sort({ createdAt: -1 });
    return allLogos.map(logo => ({
      id: logo._id.toString(),
      _id: logo._id.toString(),
      image_url: logo.image_url,
      primary_color: logo.primary_color,
      background_color: logo.background_color,
      username: logo.username,
      userId: logo.userId,
      createdAt: logo.createdAt,
      updatedAt: logo.updatedAt,
    }));
  }catch(error){
    console.error('Error fetchiing logos'+error)
    return null;
  }
}

export async function downloadImage(url: string) {
  'use server';

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    const contentType = response.headers.get('content-type');
    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

    return {
      success: true,
      data: `data:${contentType};base64,${base64Image}`
    };

  } catch (error) {
    console.error('Error downloading image:', error);
    return {
      success: false,
      error: 'Failed to download image'
    };
  }
}

export async function getCredits() {
  'use server';
  try {
    const user = await currentUser();
    if (!user) {
      return { remaining: 0, limit: 999999 };
    }

    // Initialize free credits for first-time users
    const FREE_CREDITS = 10;
    if (!user.unsafeMetadata || user.unsafeMetadata.remaining === undefined) {
      await (await clerkClient()).users.updateUserMetadata(user.id, {
        unsafeMetadata: {
          remaining: FREE_CREDITS,
        },
      });
      return {
        remaining: FREE_CREDITS,
        limit: 999999
      };
    }
    
    // Get credits from Clerk metadata
    const remaining = (user.unsafeMetadata.remaining as number) || 0;
    
    // Return unlimited display - credits are tracked individually
    return { 
      remaining,
      limit: 999999
    };
  } catch (error) {
    console.error('Error fetching credits:', error);
    return { remaining: 0, limit: 999999 };
  }
}

export async function createStripeCheckoutSession(planId: string) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Map plan IDs to Stripe price IDs and credit amounts
    const planConfig: Record<string, { priceId: string; credits: number }> = {
      basic: {
        priceId: process.env.STRIPE_PRICE_ID_BASIC || '',
        credits: 50,
      },
      pro: {
        priceId: process.env.STRIPE_PRICE_ID_PRO || '',
        credits: 150,
      },
      enterprise: {
        priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
        credits: 500,
      },
    };

    const config = planConfig[planId];
    if (!config || !config.priceId) {
      return { success: false, error: 'Invalid plan or Stripe not configured' };
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.emailAddresses[0]?.emailAddress,
      payment_method_types: ['card'],
      line_items: [
        {
          price: config.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/credits?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/credits?canceled=true`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        planId,
        credits: config.credits.toString(),
      },
    });

    return {
      success: true,
      url: session.url,
      sessionId: session.id,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { success: false, error: 'Failed to create checkout session' };
  }
}

  