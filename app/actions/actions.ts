'use server';

import OpenAI from 'openai';
import { z } from 'zod';
import dedent from 'dedent';
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { ensureDbConnected, Logo, Brand, Template } from '@/db';
import type { IBrand, ILogo, IBrandAsset, ITemplate } from '@/db';
import { BRAND_SYSTEM_PROMPT, LOGO_MULTIPLE_CONCEPTS_PROMPT, LOGO_SET_VARIANTS } from '@/lib/prompts';
import { AssetCategory, hydrateTemplate } from '@/lib/templates/brand-kit-templates';
import Stripe from 'stripe';

const DEFAULT_STARTING_CREDITS = 10;

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


// Moved to lib/templates/brand-kit-templates.ts to avoid server action export issues

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
    if (!apiKey) return { success: false, error: 'Missing NEBIUS_API_KEY' };
    const user = await currentUser();
    if (!user) return { success: false, error: 'User not authenticated' };
    const clerk = await clerkClient();

    const rawRemaining = (user.unsafeMetadata as any)?.remaining;
    const currentRemaining =
      typeof rawRemaining === 'number' ? rawRemaining : DEFAULT_STARTING_CREDITS;

    // Initialize credits once for new users (don't overwrite a real 0)
    if (typeof rawRemaining !== 'number') {
      await clerk.users.updateUserMetadata(user.id, {
        unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: currentRemaining },
      });
    }

    if (currentRemaining <= 0) return { success: false, error: "No credits left" };

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
    if (!imageUrl) return { success: false, error: "Failed to generate image" };

    await ensureDbConnected();
    await Logo.create({
      image_url: imageUrl,
      primary_color: validatedData.primaryColor,
      background_color: validatedData.secondaryColor,
      username: user.username || 'Anonymous',
      userId: user.id,
      brandId: (formData as any).brandId
    });

    const newRemaining = currentRemaining - 1;
    await clerk.users.updateUserMetadata(user.id, {
      unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: newRemaining },
    });

    return { success: true, url: imageUrl, remainingCredits: newRemaining };
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
  industries?: string[];
  colorSchemes?: string[];
  logoStyles?: string[];
}) {
  'use server';
  try {
    if (!apiKey) return { success: false, error: 'Missing NEBIUS_API_KEY' };
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    let prompt = BRAND_SYSTEM_PROMPT
      .replace('{{name}}', data.companyName)
      .replace('{{description}}', data.description)
      .replace('{{style}}', data.style);

    // Add optional context if provided
    const additionalContext: string[] = [];
    if (data.industries && data.industries.length > 0) {
      additionalContext.push(`INDUSTRIES: ${data.industries.join(', ')}`);
    }
    if (data.colorSchemes && data.colorSchemes.length > 0) {
      additionalContext.push(`COLOR SCHEMES: ${data.colorSchemes.join(', ')}`);
    }
    if (data.logoStyles && data.logoStyles.length > 0) {
      additionalContext.push(`LOGO STYLES: ${data.logoStyles.join(', ')}`);
    }

    if (additionalContext.length > 0) {
      prompt += '\n\nADDITIONAL CONTEXT:\n' + additionalContext.join('\n');
    }

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
    if (!apiKey) return { success: false, error: 'Missing NEBIUS_API_KEY' };
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };
    const clerk = await clerkClient();

    const rawRemaining = (user.unsafeMetadata as any)?.remaining;
    const currentRemaining =
      typeof rawRemaining === 'number' ? rawRemaining : DEFAULT_STARTING_CREDITS;

    // Initialize credits once for new users (don't overwrite a real 0)
    if (typeof rawRemaining !== 'number') {
      await clerk.users.updateUserMetadata(user.id, {
        unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: currentRemaining },
      });
    }

    if (currentRemaining <= 0) return { success: false, error: "No credits" };

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

    const newRemaining = currentRemaining - 1;
    await clerk.users.updateUserMetadata(user.id, {
      unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: newRemaining },
    });

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
    const rawRemaining = (user.unsafeMetadata as any)?.remaining;
    if (typeof rawRemaining === 'number') return { remaining: rawRemaining };

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

export async function createBrand(data: {
  name: string;
  slogan?: string;
  industry?: string;
  vibeKeywords?: string[];
}) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { name, slogan, industry, vibeKeywords } = data;
    if (!name?.trim()) return { success: false, error: 'Missing brand name' };

    await ensureDbConnected();
    const brand = await Brand.create({
      userId: user.id,
      name: name.trim(),
      slogan: slogan?.trim() || '',
      industry: industry?.trim() || '',
      vibeKeywords: Array.isArray(vibeKeywords) ? vibeKeywords.filter(Boolean).slice(0, 12) : [],
      status: 'draft',
      assets: [],
      logoCandidates: [],
    });

    return { success: true, brandId: brand._id.toString() };
  } catch (error) {
    console.error('Create brand error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create brand' };
  }
}

export async function generateLogoCandidates(brandId: string, model: string = 'black-forest-labs/flux-schnell', count: number = 8) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    if (!process.env.NEBIUS_API_KEY) {
      return { success: false, error: 'Missing NEBIUS_API_KEY' };
    }

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: 'Brand not found' };

    function makeCandidateId() {
      return `cand_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
    }

    function buildPrompts(input: {
      name: string;
      slogan?: string;
      industry?: string;
      vibeKeywords?: string[];
      style?: string;
    }) {
      const base = [
        `Brand name: "${input.name}"`,
        input.slogan ? `Slogan: "${input.slogan}"` : '',
        input.industry ? `Industry: ${input.industry}` : '',
        input.vibeKeywords?.length ? `Vibe keywords: ${input.vibeKeywords.join(', ')}` : '',
      ].filter(Boolean).join('. ');

      const archetypes = [
        'minimal geometric icon + clean wordmark',
        'bold typographic wordmark with custom letterforms',
        'monogram / lettermark inside a simple shape',
        'abstract symbol that suggests the brand concept',
        'modern tech-style mark with sharp lines',
        'friendly rounded mascot-like simple mark (still professional)',
        'luxury elegant mark with refined typography',
        'flat icon mark optimized for favicon readability',
      ];

      return archetypes.map((a) =>
        [
          'Create a professional logo on a clean white background.',
          'CRITICAL: include the brand name text clearly and legibly.',
          'Avoid mockups. No 3D renders. No gradients unless subtle.',
          `Direction: ${a}.`,
          base,
        ].join(' ')
      );
    }

    const prompts = buildPrompts({
      name: brand.name,
      slogan: (brand as any).slogan,
      industry: brand.industry,
      vibeKeywords: (brand as any).vibeKeywords,
    });

    const limit = Math.min(count, prompts.length);
    const selectedPrompts = prompts.slice(0, limit);

    const created: any[] = [];
    for (const prompt of selectedPrompts) {
      const image = await client.images.generate({
        model: model as any,
        prompt,
        size: '1024x1024',
      });
      const imageUrl = image.data?.[0]?.url || '';
      if (!imageUrl) continue;

      const candidateId = makeCandidateId();
      created.push({
        candidateId,
        imageUrl,
        prompt,
        model,
        createdAt: new Date(),
      });
    }

    (brand as any).logoCandidates = Array.isArray((brand as any).logoCandidates)
      ? [...(brand as any).logoCandidates, ...created]
      : created;
    brand.markModified('logoCandidates');
    await brand.save();

    return { success: true, candidates: created };
  } catch (error) {
    console.error('Generate candidates error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate candidates' };
  }
}

export async function getLogoCandidates(brandId: string) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id }).lean() as any;
    if (!brand) return { success: false, error: 'Brand not found' };

    return { success: true, candidates: brand.logoCandidates || [] };
  } catch (error) {
    console.error('List candidates error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to list candidates' };
  }
}

export async function applyLogo(brandId: string, candidateId: string) {
  'use server';
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    if (!candidateId?.trim()) {
      return { success: false, error: 'Missing candidateId' };
    }

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: 'Brand not found' };

    const candidates = Array.isArray((brand as any).logoCandidates) ? (brand as any).logoCandidates : [];
    const selectedCandidate = candidates.find((c: any) => c.candidateId === candidateId);

    if (!selectedCandidate) {
      return { success: false, error: 'Candidate not found' };
    }

    // Set active logo candidate
    (brand as any).activeLogoCandidateId = candidateId;
    brand.status = 'active';

    // Initialize brand identity if missing
    if (!brand.identity) {
      brand.identity = {
        primary_color: '#2563eb',
        secondary_color: '#ffffff',
        visual_style: (brand as any).vibeKeywords?.[0] || 'modern',
      };
    }

    // Create primary logo asset from selected candidate
    const primaryLogoAsset = {
      category: 'logo',
      subType: 'primary_logo',
      imageUrl: selectedCandidate.imageUrl,
      prompt: selectedCandidate.prompt || 'Selected logo candidate',
      createdAt: new Date(),
    };

    // Initialize assets array if needed
    if (!Array.isArray(brand.assets)) {
      (brand as any).assets = [];
    }

    // Add primary logo
    brand.assets.push(primaryLogoAsset as any);

    // Generate starter kit assets
    const starterCategories = [
      'business_card',
      'social_post',
      'letterhead',
      'email_signature',
      'social_cover',
    ];

    const templates = await Template.find({
      category: { $in: starterCategories },
    }).sort({ createdAt: 1 });

    const templatesByCategory: Record<string, any[]> = {};
    templates.forEach((t) => {
      if (!templatesByCategory[t.category]) templatesByCategory[t.category] = [];
      templatesByCategory[t.category].push(t);
    });

    const primaryLogoObj = { imageUrl: selectedCandidate.imageUrl };

    for (const category of starterCategories) {
      const categoryTemplates = templatesByCategory[category] || [];
      // Generate up to 3 variations per category
      for (let i = 0; i < Math.min(3, categoryTemplates.length); i++) {
        const template = categoryTemplates[i];
        const sceneData = hydrateTemplate(template, brand, primaryLogoObj);

        brand.assets.push({
          category: category,
          subType: `Starter ${i + 1}`,
          sceneData: sceneData,
          createdAt: new Date(),
          prompt: `Auto-generated ${category}`,
        } as any);
      }
    }

    brand.markModified('assets');
    await brand.save();

    return {
      success: true,
      brandId: brand._id.toString(),
      message: 'Logo applied and starter kit generated',
    };
  } catch (error) {
    console.error('Apply logo error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to apply logo' };
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

export async function exportBrandKit(brandId: string) {
  'use server';
  try {
    const JSZip = (await import('jszip')).default;
    const { renderSceneToPNG, renderSceneToSVG, renderSceneToPDF } = await import('@/lib/render/scene-renderer');
    const { clerkClient } = await import('@clerk/nextjs/server');

    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const EXPORT_COST_CREDITS = 1;
    const DEFAULT_STARTING_CREDITS = 10;

    const clerk = await clerkClient();
    const rawRemaining = (user.unsafeMetadata as any)?.remaining;
    const currentRemaining =
      typeof rawRemaining === 'number' ? rawRemaining : DEFAULT_STARTING_CREDITS;

    // Initialize credits once for new users (don't overwrite real 0)
    if (typeof rawRemaining !== 'number') {
      await clerk.users.updateUserMetadata(user.id, {
        unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: currentRemaining },
      });
    }

    if (currentRemaining < EXPORT_COST_CREDITS) {
      return { success: false, error: 'Not enough credits to export' };
    }

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id }).lean() as any;
    if (!brand) return { success: false, error: 'Brand not found' };

    function safeFileName(input: string) {
      return input
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'brand';
    }

    function guessExtFromContentType(contentType: string | null) {
      if (!contentType) return 'bin';
      if (contentType.includes('image/png')) return 'png';
      if (contentType.includes('image/jpeg')) return 'jpg';
      if (contentType.includes('image/webp')) return 'webp';
      if (contentType.includes('image/svg+xml')) return 'svg';
      if (contentType.includes('application/pdf')) return 'pdf';
      if (contentType.includes('application/json')) return 'json';
      return 'bin';
    }

    function parseDataUrl(dataUrl: string): { mime: string; data: Buffer } | null {
      const match = /^data:([^;,]+)?(;base64)?,(.*)$/i.exec(dataUrl);
      if (!match) return null;
      const mime = match[1] || 'application/octet-stream';
      const isBase64 = Boolean(match[2]);
      const payload = match[3] || '';
      const data = isBase64 ? Buffer.from(payload, 'base64') : Buffer.from(decodeURIComponent(payload), 'utf8');
      return { mime, data };
    }

    async function fetchAsBuffer(url: string) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch asset: ${res.status} ${res.statusText}`);
      const contentType = res.headers.get('content-type');
      const arr = await res.arrayBuffer();
      return { contentType, buffer: Buffer.from(arr) };
    }

    const zip = new JSZip();
    const base = safeFileName(brand.name || 'brand');

    // Metadata
    zip.file(`${base}/brand.json`, JSON.stringify({
      _id: brand._id?.toString?.() || brandId,
      name: brand.name,
      description: brand.description,
      industry: brand.industry,
      identity: brand.identity,
      strategy: brand.strategy,
      contactInfo: brand.contactInfo,
      exportedAt: new Date().toISOString(),
    }, null, 2));

    const assets: any[] = Array.isArray(brand.assets) ? brand.assets : [];
    const imagesFolder = zip.folder(`${base}/images`);
    const scenesFolder = zip.folder(`${base}/scenes`);
    const renderedFolder = zip.folder(`${base}/rendered`);
    if (!imagesFolder || !scenesFolder || !renderedFolder) {
      throw new Error('Failed to initialize zip folders');
    }

    let imageCount = 0;
    let sceneCount = 0;
    let renderedCount = 0;

    for (const asset of assets) {
      const id = asset?._id?.toString?.() || `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const category = String(asset?.category || 'asset');
      const subType = String(asset?.subType || 'variant');
      const baseFileName = `${category}__${subType}__${id}`.replace(/[^a-zA-Z0-9_.-]+/g, '_');

      // Always include sceneData if present
      if (asset?.sceneData) {
        // Save JSON
        scenesFolder.file(
          `${baseFileName}.json`,
          JSON.stringify(asset.sceneData, null, 2)
        );
        sceneCount += 1;

        // Render to PNG, SVG, and PDF
        try {
          const sceneData = asset.sceneData;
          
          // Render PNG (high-res, 2x scale)
          const pngBuffer = await renderSceneToPNG(sceneData, 2);
          renderedFolder.file(`${baseFileName}.png`, pngBuffer);
          renderedCount += 1;

          // Render SVG
          const svgString = renderSceneToSVG(sceneData);
          renderedFolder.file(`${baseFileName}.svg`, svgString);
          renderedCount += 1;

          // Render PDF
          const pdfBuffer = await renderSceneToPDF(sceneData);
          renderedFolder.file(`${baseFileName}.pdf`, pdfBuffer);
          renderedCount += 1;
        } catch (renderError) {
          console.error(`Failed to render sceneData for ${baseFileName}:`, renderError);
          // Continue with other assets even if one fails
        }
      }

      // Include imageUrl if present and fetchable
      const imageUrl = asset?.imageUrl;
      if (typeof imageUrl === 'string' && imageUrl.length > 0) {
        if (imageUrl.startsWith('data:')) {
          const parsed = parseDataUrl(imageUrl);
          if (parsed) {
            const ext = guessExtFromContentType(parsed.mime);
            imagesFolder.file(
              `${baseFileName}.${ext}`,
              parsed.data
            );
            imageCount += 1;
          }
        } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          const { contentType, buffer } = await fetchAsBuffer(imageUrl);
          const ext = guessExtFromContentType(contentType);
          imagesFolder.file(
            `${baseFileName}.${ext}`,
            buffer
          );
          imageCount += 1;
        }
      }
    }

    zip.file(`${base}/manifest.json`, JSON.stringify({
      brandId: brand._id?.toString?.() || brandId,
      imageCount,
      sceneCount,
      renderedCount,
      notes: [
        'This ZIP contains:',
        '- images/: Original uploaded images',
        '- scenes/: Editable scene JSON files',
        '- rendered/: Pre-rendered PNG, SVG, and PDF exports of all sceneData assets'
      ]
    }, null, 2));

    const out = await zip.generateAsync({ type: 'nodebuffer' });

    // Consume credits ONLY on successful bundle creation
    const newRemaining = currentRemaining - EXPORT_COST_CREDITS;
    await clerk.users.updateUserMetadata(user.id, {
      unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: newRemaining },
    });

    // Convert buffer to base64 for server action response
    const base64 = out.toString('base64');
    const fileName = `${base}-brand-kit.zip`;

    return {
      success: true,
      data: base64,
      fileName,
      mimeType: 'application/zip',
      remainingCredits: newRemaining,
    };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
}
