'use server';

import OpenAI from 'openai';
import { z } from 'zod';
import dedent from 'dedent';
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { ensureDbConnected, Logo, Brand, IBrand, ILogo, IBrandAsset } from '@/db';
import { BRAND_SYSTEM_PROMPT } from '@/lib/prompts';
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
  model: z.enum(['dall-e-3', 'black-forest-labs/flux-schnell', 'black-forest-labs/flux-dev']),
  size: z.enum(['256x256', '512x512', '1024x1024']).default('512x512'),
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
      await Logo.create({
        ...DatabaseData,
        brandId: (formData as any).brandId || undefined
      });
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

// STAGE 1: Brand Intelligence Generation
export async function generateBrandIdentity(data: {
  companyName: string;
  description: string;
  style: string;
  model: string; // Keep model selection for later steps or if we need a specific model for text generation
}) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'User not authenticated' };

    await ensureDbConnected();

    // 1. Construct Prompt
    const prompt = BRAND_SYSTEM_PROMPT
      .replace('{{name}}', data.companyName)
      .replace('{{description}}', data.description)
      .replace('{{style}}', data.style);

    // 2. Call LLM for Strategy & Identity (Using a fast/smart model for JSON)
    // We'll use the user-selected model or default to a text-capable one if "flux" (image only) is passed.
    // For text JSON generation, we likely need a text model. Assuming 'client' is configured for Nebius which supports Llama/Qwen/etc.
    // However, the current client initialization in this file might be set up for *image* generation endpoints or generic OpenAI.
    // If the user selects FLUX (image model), we can't use it for text.
    // *ASSUMPTION*: We will use a default text completion model available on the platform for this stage.
    // Since I don't have the full list of text models, I'll use a standard one often available, or rely on the user's key affecting default.
    // Let's assume we can use "meta-llama/Meta-Llama-3.1-70B-Instruct" or similar if we specify it, 
    // OR we just use the client.chat.completions.create method which usually routes correctly.

    // NOTE: The existing code only does images.generate. I need to add chat.completions.

    const completion = await client.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct", // slightly newer model
      messages: [
        { role: "system", content: "You are a JSON-only API. return valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content generated");

    const brandData = JSON.parse(content);

    // 3. Create Brand Record
    const newBrand = await Brand.create({
      userId: user.id,
      name: data.companyName,
      description: data.description,
      strategy: brandData.strategy,
      identity: brandData.identity,
      assets: [],
    });

    return { success: true, brandId: newBrand._id.toString(), brandData };

  } catch (error) {
    console.error('Error generating brand identity:', error);
    return { success: false, error: 'Failed to generate brand identity' };
  }
}


// STAGE 2: Asset Blueprinting
export async function prepareAssetBlueprints(brandId: string) {
  'use server';
  try {
    await ensureDbConnected();
    const brand = await Brand.findById(brandId);
    if (!brand) throw new Error("Brand not found");

    const identity = brand.identity;
    const strategy = brand.strategy;

    // Use LLM to generate a massive list of prompts
    // We'll ask for a set of varied prompts for each category to ensure diversity within the same brand theme.
    const blueprintPrompt = dedent`
      You are a Brand Asset Strategist. Generate a comprehensive list of image generation prompts for a branding kit.
      Brand Name: ${brand.name}
      Visual Style: ${identity.visual_style_rules}
      Identity: ${JSON.stringify(identity)}
      Strategy: ${JSON.stringify(strategy)}

      REQUIRED CATEGORIES & QUANTITIES:
      1. Logo Variations (10 prompts): Different layouts, icons, and compositions.
      2. Social Posts (10 prompts): Varied themes (launch, testimonial, quote, product feature).
      3. Social Stories (10 prompts): Vertical format, engaging layouts.
      4. Social Covers (5 prompts): Wide format for headers (FB, LinkedIn, Twitter).
      5. Social Profiles (5 prompts): Circular/Square focused profile images.
      6. YouTube Thumbnails (10 prompts): Bold, eye-catching, high contrast.
      7. Marketing Materials (10 prompts): Flyers, brochures, ads.
      8. Branding Stationary (10 prompts): Business cards, letterheads, envelopes.

      OUTPUT FORMAT (JSON ONLY):
      {
        "blueprints": [
          { "category": "logo", "subType": "variant_1", "prompt": "..." },
          ...
        ]
      }

      CRITICAL: All prompts must maintain strict adherence to the brand's primary color (${identity.primary_color}), secondary color (${identity.secondary_color}), and visual style rules. 
      Total prompts to generate: 60. (We will double these programmatically for variety).
    `;

    const completion = await client.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct",
      messages: [
        { role: "system", content: "You are a JSON-only API. return valid JSON." },
        { role: "user", content: blueprintPrompt }
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No blueprints generated");

    const data = JSON.parse(content);
    const rawBlueprints = data.blueprints || [];

    // Programmatically expand to 20 per category if needed, or just use what we have.
    // To reach "20 items per branding kit item", we can slightly vary the LLM output.
    const expandedBlueprints: any[] = [];

    // Group by category to ensure we can track counts
    const categories = ['logo', 'social_post', 'social_story', 'social_cover', 'social_profile', 'youtube_thumbnail', 'marketing', 'branding'];

    categories.forEach(cat => {
      const catBlueprints = rawBlueprints.filter((b: any) =>
        b.category === cat ||
        (cat === 'social_post' && (b.category === 'social' || b.category.includes('post'))) ||
        (cat === 'social_story' && b.category.includes('story'))
      );

      // If LLM gave us fewer than 20, we'll clones with slight variations in the prompt instructions
      for (let i = 0; i < 20; i++) {
        const source = catBlueprints[i % catBlueprints.length] || (rawBlueprints.find((b: any) => b.category.includes(cat.split('_')[0])) || rawBlueprints[0]);
        expandedBlueprints.push({
          ...source,
          category: cat,
          subType: `variant_${i + 1}`,
          prompt: `${source?.prompt || 'Brand asset'} -- Variation ${i + 1}: ${i % 2 === 0 ? 'emphasize lighting and depth' : 'focus on clean minimalism and flat design'}.`
        });
      }
    });

    // Save blueprints to Brand
    brand.blueprints = expandedBlueprints;
    await brand.save();

    return { success: true, blueprintCount: expandedBlueprints.length };
  } catch (error) {
    console.error('Error preparing blueprints:', error);
    return { success: false, error: 'Failed to prepare blueprints' };
  }
}

// STAGE 3: Asset Generation
export async function generateBrandAsset(brandId: string, category: string, subType: string, model: string = 'black-forest-labs/flux-schnell') {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    await ensureDbConnected();
    const brand = await Brand.findById(brandId);
    if (!brand || !brand.blueprints) throw new Error("Brand or blueprints not found");

    const blueprint = (brand.blueprints as any[]).find(b => b.category === category && b.subType === subType);
    if (!blueprint) throw new Error("Specific blueprint not found");

    const response = await client.images.generate({
      model: model, // User selected model
      prompt: blueprint.prompt,
      response_format: "url",
      size: "1024x1024", // Standardize for now
      quality: "standard",
      n: 1,
    });

    const imageUrl = response.data?.[0]?.url || "";
    if (!imageUrl) throw new Error("Failed to generate image");

    // Persist Asset
    const newAsset = {
      category,
      subType,
      imageUrl,
      prompt: blueprint.prompt,
      createdAt: new Date(),
    };

    brand.assets.push(newAsset);
    await brand.save();

    // Also save to Logo collection if it's a logo, for backward compatibility with "My Designs"
    if (category === 'logo') {
      await Logo.create({
        brandId,
        image_url: imageUrl,
        primary_color: brand.identity.primary_color,
        background_color: brand.identity.secondary_color || '#ffffff',
        username: user.username || 'Anonymous',
        userId: user.id,
      });
    }

    return { success: true, imageUrl, asset: newAsset };

  } catch (error) {
    console.error(`Error generating brand asset:`, error);
    return { success: false, error: `Failed to generate asset` };
  }
}

// ========================
// BRAND MANAGEMENT ACTIONS
// ========================

export async function getUserBrands() {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated', brands: [] };

    await ensureDbConnected();
    const brands = await Brand.find({ userId: user.id }).sort({ createdAt: -1 }).lean();

    return {
      success: true,
      brands: (brands as any[]).map((b: any) => {
        // Find primary logo first, then fallback to any logo
        const primaryLogo = b.assets?.find((a: any) => a.subType === 'primary_logo')
          || b.assets?.find((a: any) => a.category === 'logo');
        return {
          _id: b._id.toString(),
          name: b.name,
          description: b.description,
          createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : new Date().toISOString(),
          assetCount: b.assets?.length || 0,
          primaryLogoUrl: primaryLogo?.imageUrl || null,
        };
      }),
    };
  } catch (error) {
    console.error('Error fetching user brands:', error);
    return { success: false, error: 'Failed to fetch brands', brands: [] };
  }
}

export async function getBrandById(brandId: string) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id }).lean() as any;

    if (!brand) {
      return { success: false, error: 'Brand not found' };
    }

    const plainBrand = {
      _id: brand._id?.toString() || brandId,
      name: brand.name || '',
      description: brand.description || '',
      strategy: brand.strategy || {},
      identity: brand.identity || {},
      blueprints: Array.isArray(brand.blueprints) ? brand.blueprints : [],
      assets: (Array.isArray(brand.assets) ? brand.assets : []).map((asset: any) => ({
        category: asset.category || '',
        subType: asset.subType || '',
        imageUrl: asset.imageUrl || '',
        prompt: asset.prompt || '',
        createdAt: asset.createdAt ? new Date(asset.createdAt).toISOString() : new Date().toISOString(),
      })),
      createdAt: brand.createdAt ? new Date(brand.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: brand.updatedAt ? new Date(brand.updatedAt).toISOString() : new Date().toISOString(),
    };

    return {
      success: true,
      brand: plainBrand,
    };
  } catch (error) {
    console.error('Error fetching brand:', error);
    return { success: false, error: 'Failed to fetch brand' };
  }
}

export async function finalizeBrandLogo(brandId: string, selectedImageUrl: string) {
  'use server';
  try {
    await ensureDbConnected();
    const brand = await Brand.findById(brandId);
    if (!brand) throw new Error("Brand not found");

    // Mark the selected logo as primary, others as variations
    brand.assets = brand.assets.map((asset: any) => {
      if (asset.category === 'logo') {
        return {
          ...asset,
          subType: asset.imageUrl === selectedImageUrl ? 'primary_logo' : 'logo_variation'
        };
      }
      return asset;
    });

    // Mark assets as modified since it's an array of mixed/objects in some cases
    brand.markModified('assets');
    await brand.save();

    // Note: We no longer delete from the Logo collection to keep "My Designs" populated

    return { success: true };
  } catch (error) {
    console.error('Error finalizing logo selection:', error);
    return { success: false, error: 'Failed to finalize selection' };
  }
}

export async function setPrimaryLogo(brandId: string, selectedImageUrl: string) {
  'use server';
  try {
    await ensureDbConnected();
    const brand = await Brand.findById(brandId);
    if (!brand) throw new Error("Brand not found");

    // Update subTypes for logos
    brand.assets = brand.assets.map((asset: any) => {
      if (asset.category === 'logo') {
        return {
          ...asset,
          subType: asset.imageUrl === selectedImageUrl ? 'primary_logo' : 'logo_variation'
        };
      }
      return asset;
    });

    brand.markModified('assets');
    await brand.save();

    return { success: true };
  } catch (error) {
    console.error('Error setting primary logo:', error);
    return { success: false, error: 'Failed to update primary logo' };
  }
}

export async function updateBrand(brandId: string, updates: {
  name?: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
}) {
  'use server';
  try {
    await ensureDbConnected();
    const brand = await Brand.findById(brandId);
    if (!brand) throw new Error("Brand not found");

    if (updates.name) brand.name = updates.name;
    if (updates.description) brand.description = updates.description;

    if (updates.primaryColor || updates.secondaryColor) {
      if (!brand.identity) brand.identity = {};
      if (updates.primaryColor) brand.identity.primary_color = updates.primaryColor;
      if (updates.secondaryColor) brand.identity.secondary_color = updates.secondaryColor;

      // Mark identity as modified since it's a Mixed type
      brand.markModified('identity');
    }

    await brand.save();
    return { success: true };
  } catch (error) {
    console.error('Error updating brand:', error);
    return { success: false, error: 'Failed to update brand' };
  }
}

export async function getBrandBlueprints(brandId: string) {
  'use server';
  try {
    await ensureDbConnected();
    const brand = await Brand.findById(brandId).lean() as any;
    if (!brand) return { success: false, error: 'Brand not found' };

    return {
      success: true,
      blueprints: brand.blueprints || []
    };
  } catch (error) {
    console.error('Error fetching blueprints:', error);
    return { success: false, error: 'Failed to fetch blueprints' };
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

    return (userLogos as any[]).map((logo: any) => ({
      id: logo._id.toString(),
      _id: logo._id.toString(),
      brandId: logo.brandId?.toString(),
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

export async function allLogos() {
  try {
    await ensureDbConnected();
    const allLogos = await Logo.find({}).sort({ createdAt: -1 });
    return (allLogos as any[]).map((logo: any) => ({
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
    console.error('Error fetchiing logos' + error)
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

