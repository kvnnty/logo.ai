'use server';

import OpenAI from 'openai';
import { z } from 'zod';
import dedent from 'dedent';
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { ensureDbConnected, Logo, Brand, Template } from '@/db';
import type { IBrand, ILogo, IBrandAsset, ITemplate } from '@/db';
import { BRAND_SYSTEM_PROMPT, LOGO_MULTIPLE_CONCEPTS_PROMPT, LOGO_SET_VARIANTS } from '@/lib/prompts';
import { AssetCategory } from '@/lib/templates/brand-kit-templates';
import Stripe from 'stripe';

const apiKey = process.env.NEBIUS_API_KEY || '';
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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

const PLAN_MAPPING: Record<string, { priceId: string, credits: number }> = {
  'basic': {
    priceId: process.env.STRIPE_PRICE_ID_BASIC || '',
    credits: 50
  },
  'pro': {
    priceId: process.env.STRIPE_PRICE_ID_PRO || '',
    credits: 150
  },
  'enterprise': {
    priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
    credits: 500
  }
};

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


function hydrateTemplate(template: any, brand: any, primaryLogo: any) {
  const placeholders: Record<string, string> = {
    '{{brandName}}': brand.name,
    '{{primaryColor}}': brand.identity?.primary_color || '#000000',
    '{{secondaryColor}}': brand.identity?.secondary_color || '#ffffff',
    '{{logoUrl}}': primaryLogo?.imageUrl || '',
    '{{website}}': brand.contactInfo?.website || 'www.example.com',
    '{{email}}': brand.contactInfo?.email || 'hello@example.com',
    '{{phone}}': brand.contactInfo?.phone || '+1 234 567 890',
    '{{address}}': brand.contactInfo?.address || 'City, Country',
  };

  const hydrateElement = (element: any): any => {
    const newEl = { ...element };
    for (const key in newEl) {
      if (typeof newEl[key] === 'string') {
        if (placeholders[newEl[key]]) {
          newEl[key] = placeholders[newEl[key]];
        } else if (Object.keys(placeholders).some(ph => newEl[key].includes(ph))) {
          let val = newEl[key];
          for (const [ph, replacement] of Object.entries(placeholders)) {
            val = val.replace(ph, replacement);
          }
          newEl[key] = val;
        }
      }
    }
    return newEl;
  };

  return {
    width: template.dimensions.width,
    height: template.dimensions.height,
    elements: template.elements.map(hydrateElement)
  };
}

function hexToColorName(hex: string): string {

  const colorMap: Record<string, string> = {
    '#2563eb': 'blue',
    '#dc2626': 'red',
    '#d97706': 'orange',
    '#16a34a': 'green',
    '#9333ea': 'purple',
    '#000000': 'black',
    '#ffffff': 'white',
  };
  return colorMap[hex.toLowerCase()] || hex;
}

export async function generateLogo(formData: z.infer<typeof FormSchema>) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'User not authenticated' };

    const currentRemaining = (user.unsafeMetadata?.remaining as number) || 0;
    if (currentRemaining <= 0) return { success: false, error: "No credits left" };

    const newRemaining = currentRemaining - 1;
    await (await clerkClient()).users.updateUserMetadata(user.id, {
      unsafeMetadata: { remaining: newRemaining },
    });

    const validatedData = FormSchema.parse(formData);
    const primaryColorName = hexToColorName(validatedData.primaryColor);
    const secondaryColorName = hexToColorName(validatedData.secondaryColor);

    const prompt = dedent`A single logo, high-quality, professional design, ${styleLookup[validatedData.style]}. Primary color is ${primaryColorName} and background is ${secondaryColorName}. Company: ${validatedData.companyName}.`;

    const response = await client.images.generate({
      model: validatedData.model,
      prompt: prompt,
      size: validatedData.size,
    });

    const imageUrl = response.data?.[0]?.url || "";
    await ensureDbConnected();
    await Logo.create({
      image_url: imageUrl,
      primary_color: validatedData.primaryColor,
      background_color: validatedData.secondaryColor,
      username: user.username || 'Anonymous',
      userId: user.id,
      brandId: (formData as any).brandId
    });

    return { success: true, url: imageUrl };
  } catch (error) {
    console.error('Error generating logo:', error);
    return { success: false, error: 'Failed' };
  }
}

export async function generateBrandIdentity(data: {
  companyName: string;
  description: string;
  style: string;
  model: string;
}) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    await ensureDbConnected();
    const prompt = BRAND_SYSTEM_PROMPT
      .replace('{{name}}', data.companyName)
      .replace('{{description}}', data.description)
      .replace('{{style}}', data.style);

    const completion = await client.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content");

    const brandData = JSON.parse(content);

    return {
      success: true,
      brandData: {
        name: data.companyName,
        description: data.description,
        strategy: brandData.strategy,
        identity: brandData.identity,
      }
    };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Failed' };
  }
}


export async function generateInteractiveAsset(brandId: string, category: string, subType: string, templateIndex: number = 0) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) throw new Error("Brand not found");

    const primaryLogo = brand.assets?.find((a: any) => a.category === 'logo' || a.subType === 'primary_logo');

    // 1. Fetch Template from DB
    const templates = await Template.find({ category }).sort({ createdAt: 1 });
    const selectedTemplate = templates[templateIndex % templates.length]; // Cycle if index > length

    if (!selectedTemplate) throw new Error(`No template found for ${category}`);

    // 2. Hydrate Template (Replace Placeholders)
    const sceneData = hydrateTemplate(selectedTemplate, brand, primaryLogo);

    brand.assets.push({
      category,
      subType,
      sceneData,
      createdAt: new Date()
    } as any);

    await brand.save();
    return { success: true, sceneData };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Failed' };
  }
}


export async function generateLogos(brandData: { name: string, description: string, identity: any }, model: string = 'black-forest-labs/flux-schnell') {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const currentRemaining = (user.unsafeMetadata?.remaining as number) || 0;
    if (currentRemaining <= 0) return { success: false, error: "No credits" };

    const newRemaining = currentRemaining - 1;
    await (await clerkClient()).users.updateUserMetadata(user.id, {
      unsafeMetadata: { remaining: newRemaining },
    });

    const conceptPrompt = LOGO_MULTIPLE_CONCEPTS_PROMPT
      .replace('{{name}}', brandData.name)
      .replace('{{industry}}', 'General')
      .replace('{{style}}', brandData.identity?.visual_style || 'modern')
      .replace('{{description}}', brandData.description || '')
      .replace('{{primaryColor}}', brandData.identity?.primary_color || '#000000')
      .replace('{{secondaryColor}}', brandData.identity?.secondary_color || '#ffffff');

    const conceptResponse = await client.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct",
      messages: [{ role: "user", content: conceptPrompt }],
      response_format: { type: "json_object" },
    });

    const { concepts } = JSON.parse(conceptResponse.choices[0].message.content || '{"concepts":[]}');
    const finalConcepts = [];

    for (const concept of concepts) {
      // Create a specific prompt for this icon using its unique colors
      const colorString = concept.colors.join(', ');
      const symbolPrompt = `A professional logo design for brand "${brandData.name}". 
      Concept: ${concept.symbolPrompt}.
      CRITICAL: The logo MUST include the text "${brandData.name}" clearly and legibly.
      Use these colors: ${colorString}. 
      Clean white background. High quality vector style.`;

      const imgResponse = await client.images.generate({
        model: model,
        prompt: symbolPrompt,
        size: "1024x1024",
      });

      const iconUrl = imgResponse.data?.[0]?.url || "";
      if (!iconUrl) continue;

      const conceptId = `concept_${Math.random().toString(36).substring(2, 9)}`;
      const variations = [
        {
          label: LOGO_SET_VARIANTS.icon.label,
          subType: LOGO_SET_VARIANTS.icon.subType,
          sceneData: { width: 1024, height: 1024, elements: [{ type: 'image', src: iconUrl, x: 256, y: 256, width: 512, height: 512 }] }
        },
        {
          label: LOGO_SET_VARIANTS.text.label,
          subType: LOGO_SET_VARIANTS.text.subType,
          sceneData: { width: 1024, height: 1024, elements: [{ type: 'text', content: brandData.name, x: 512, y: 512, fontSize: 100, fontStyle: concept.fontFamily, fill: concept.colors[0], align: 'center' }] }
        },
        {
          label: LOGO_SET_VARIANTS.horizontal.label,
          subType: LOGO_SET_VARIANTS.horizontal.subType,
          sceneData: { width: 1024, height: 300, elements: [{ type: 'image', src: iconUrl, x: 50, y: 50, width: 200, height: 200 }, { type: 'text', content: brandData.name, x: 300, y: 100, fontSize: 80, fontStyle: concept.fontFamily, fill: concept.colors[0] }] }
        },
        {
          label: LOGO_SET_VARIANTS.vertical.label,
          subType: LOGO_SET_VARIANTS.vertical.subType,
          sceneData: { width: 600, height: 800, elements: [{ type: 'image', src: iconUrl, x: 150, y: 100, width: 300, height: 300 }, { type: 'text', content: brandData.name, x: 300, y: 500, fontSize: 70, fontStyle: concept.fontFamily, fill: concept.colors[0], align: 'center' }] }
        },
        {
          label: 'Primary Logo',
          subType: 'primary_logo',
          sceneData: {
            width: 1024,
            height: 1024,
            elements: [
              { type: 'image', src: iconUrl, x: 512, y: 350, width: 400, height: 400, align: 'center' },
              { type: 'text', content: brandData.name, x: 512, y: 750, fontSize: 120, fontStyle: concept.fontFamily, fill: concept.colors[0], align: 'center' }
            ]
          }
        },
      ];

      finalConcepts.push({ ...concept, iconUrl, variations: variations });
    }

    return { success: true, concepts: finalConcepts, remainingCredits: newRemaining };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Failed' };
  }
}

export async function saveFinalBrand(data: {
  brandData: any,
  concepts: any[],
  selectedConceptIndex: number
}) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    await ensureDbConnected();
    const { brandData, concepts, selectedConceptIndex } = data;

    // Create the Brand
    const newBrand = await Brand.create({
      userId: user.id,
      name: brandData.name,
      description: brandData.description,
      strategy: brandData.strategy,
      identity: brandData.identity,
    });

    const brandId = newBrand._id.toString();
    const selectedConcept = concepts[selectedConceptIndex];

    // Update Brand Identity Colors to match selected concept
    newBrand.identity = {
      ...newBrand.identity,
      primary_color: selectedConcept.colors[0],
      secondary_color: selectedConcept.colors[1] || selectedConcept.colors[0],
    };

    // Flatten and save all logo variations
    for (let cIdx = 0; cIdx < concepts.length; cIdx++) {
      const concept = concepts[cIdx];
      const conceptId = `concept_${Math.random().toString(36).substring(2, 9)}`;

      for (const variant of concept.variations) {
        let subType = 'logo_variation';
        if (cIdx === selectedConceptIndex) {
          if (variant.subType === 'logo_horizontal') subType = 'primary_logo';
          else subType = 'primary_variation';
        }

        newBrand.assets.push({
          category: 'logo',
          subType: subType,
          imageUrl: variant.subType === 'logo_icon' ? concept.iconUrl : "",
          prompt: `Logo concept: ${concept.name}`,
          sceneData: variant.sceneData,
          conceptId,
          conceptColors: concept.colors,
          createdAt: new Date(),
        });
      }
    }

    // Generate Starter Kit (Zoviz-style auto-generation)
    const starterCategories = ['business_card', 'social_post', 'letterhead', 'email_signature', 'social_cover'];
    const templates = await Template.find({ category: { $in: starterCategories } });

    // Group templates by category
    const templatesByCategory: Record<string, any[]> = {};
    templates.forEach(t => {
      if (!templatesByCategory[t.category]) templatesByCategory[t.category] = [];
      templatesByCategory[t.category].push(t);
    });

    const primaryLogo = newBrand.assets.find((a: any) => a.subType === 'primary_logo');
    const primaryLogoObj = primaryLogo ? { imageUrl: primaryLogo.imageUrl } : null;

    for (const category of starterCategories) {
      const categoryTemplates = templatesByCategory[category] || [];
      // Generate up to 3 variations per category
      for (let i = 0; i < Math.min(3, categoryTemplates.length); i++) {
        const template = categoryTemplates[i];
        const sceneData = hydrateTemplate(template, newBrand, primaryLogoObj);

        newBrand.assets.push({
          category: category,
          subType: `Starter ${i + 1}`,
          sceneData: sceneData,
          createdAt: new Date(),
          prompt: `Auto-generated ${category}`
        });
      }
    }

    await newBrand.save();
    return { success: true, brandId };
  } catch (error) {
    console.error('Error saving brand:', error);
    return { success: false, error: 'Failed to save brand' };
  }
}

export async function updateAssetScene(brandId: string, assetId: string, sceneData: any) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };
    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) throw new Error("Brand not found");
    const asset = (brand.assets as any).id(assetId);
    if (!asset) throw new Error("Asset not found");
    asset.sceneData = sceneData;
    brand.markModified('assets');
    await brand.save();
    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Failed' };
  }
}

export async function getUserBrands() {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated', brands: [] };
    await ensureDbConnected();
    const brands = await Brand.find({ userId: user.id }).sort({ createdAt: -1 }).lean();
    return {
      success: true,
      brands: (brands as any[]).map((b: any) => ({
        _id: b._id.toString(),
        name: b.name,
        description: b.description,
        createdAt: b.createdAt?.toISOString(),
        updatedAt: b.updatedAt?.toISOString(),
        assetCount: b.assets?.length || 0,
        primaryLogoUrl: b.assets?.find((a: any) => a.subType === 'primary_logo')?.imageUrl || null,
        industry: b.industry || '',
      })),
    };
  } catch (error) {
    return { success: false, error: 'Failed', brands: [] };
  }
}

export async function getBrandById(brandId: string) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };
    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id }).lean() as any;
    if (!brand) return { success: false, error: 'Not found' };
    return {
      success: true,
      brand: {
        ...brand,
        _id: brand._id.toString(),
        assets: brand.assets.map((a: any) => ({ ...a, _id: a._id.toString() }))
      }
    };
  } catch (error) {
    return { success: false, error: 'Failed' };
  }
}

export async function deleteBrand(brandId: string) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };
    await ensureDbConnected();
    await Brand.deleteOne({ _id: brandId, userId: user.id });
    await Logo.deleteMany({ brandId });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed' };
  }
}

export async function getCredits() {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { remaining: 0 };
    return { remaining: (user.unsafeMetadata?.remaining as number) || 0 };
  } catch (error) {
    return { remaining: 0 };
  }
}

export async function downloadImage(url: string) {
  'use server';
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return { success: true, data: `data:${contentType};base64,${base64}` };
  } catch (error) {
    return { success: false };
  }
}

export async function updateBrand(brandId: string, details: any) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };
    await ensureDbConnected();

    const updateData: any = {
      name: details.name,
      description: details.description,
    };

    if (details.primaryColor || details.secondaryColor) {
      updateData.identity = {
        primary_color: details.primaryColor,
        secondary_color: details.secondaryColor
      };
    }

    await Brand.findOneAndUpdate(
      { _id: brandId, userId: user.id },
      { $set: updateData }
    );
    return { success: true };
  } catch (error) {
    console.error('Error updating brand:', error);
    return { success: false };
  }
}

export async function updateBrandDetails(brandId: string, details: any) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };
    await ensureDbConnected();
    await Brand.findOneAndUpdate({ _id: brandId, userId: user.id }, { $set: details });
    return { success: true };
  } catch (error) {
    console.error('Error updating brand details:', error);
    return { success: false };
  }
}

export async function checkHistory() {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return null;
    await ensureDbConnected();
    const history = await Logo.find({ userId: user.id }).sort({ createdAt: -1 }).lean();
    return (history as any[]).map(h => ({
      ...h,
      _id: h._id.toString(),
      id: h._id.toString(),
      createdAt: h.createdAt?.toISOString(),
      updatedAt: h.updatedAt?.toISOString()
    }));
  } catch (error) {
    console.error('Error checking history:', error);
    return null;
  }
}

export async function createStripeCheckoutSession(planId: string) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const plan = PLAN_MAPPING[planId];
    if (!plan || !plan.priceId) {
      return { success: false, error: 'Invalid plan or price not configured' };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?canceled=true`,
      metadata: {
        userId: user.id,
        credits: plan.credits.toString(),
      },
    });

    return { success: true, url: session.url };
  } catch (error) {
    console.error('Stripe error:', error);
    return { success: false, error: 'Failed' };
  }
}

export async function finalizeBrandLogo(brandId: string, assetId: string) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) throw new Error("Brand not found");

    // Update the subType of assets.
    // The asset with assetId becomes 'primary_logo'.
    // Other 'primary_logo' assets become 'logo_variation'.
    brand.assets = brand.assets.map((asset: any) => {
      const assetIdStr = asset._id ? asset._id.toString() : '';
      if (assetIdStr === assetId) {
        return { ...asset.toObject(), subType: 'primary_logo' };
      } else if (asset.subType === 'primary_logo') {
        return { ...asset.toObject(), subType: 'logo_variation' };
      }
      return asset;
    });

    brand.markModified('assets');

    // Also update the brand identity primary color if the new logo has concept colors
    const selectedAsset = brand.assets.find((a: any) => (a._id ? a._id.toString() : '') === assetId);
    if (selectedAsset && selectedAsset.conceptColors && selectedAsset.conceptColors.length > 0) {
      brand.identity = {
        ...brand.identity,
        primary_color: selectedAsset.conceptColors[0],
        secondary_color: selectedAsset.conceptColors[1] || selectedAsset.conceptColors[0],
      };
    }

    await brand.save();
    return { success: true };
  } catch (error) {
    console.error('Error finalizing brand logo:', error);
    return { success: false, error: 'Failed to finalize logo' };
  }
}

export async function allLogos() {
  'use server';
  try {
    await ensureDbConnected();
    const logos = await Logo.find({}).sort({ createdAt: -1 }).limit(100).lean();
    return (logos as any[]).map(h => ({
      ...h,
      _id: h._id.toString(),
      id: h._id.toString(),
      createdAt: h.createdAt?.toISOString(),
      updatedAt: h.updatedAt?.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching all logos:', error);
    return null;
  }
}

export async function setPrimaryLogo(brandId: string, imageUrl: string) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) throw new Error("Brand not found");

    brand.assets = brand.assets.map((asset: any) => {
      if (asset.imageUrl === imageUrl) {
        return { ...asset.toObject(), subType: 'primary_logo' };
      } else if (asset.subType === 'primary_logo') {
        return { ...asset.toObject(), subType: 'logo_variation' };
      }
      return asset;
    });

    brand.markModified('assets');
    await brand.save();
    return { success: true };
  } catch (error) {
    console.error('Error setting primary logo:', error);
    return { success: false, error: 'Failed' };
  }
}
