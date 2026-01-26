/**
 * API Route for Logo Generation
 * Handles heavy AI calls separately from Server Actions
 * Supports caching and queuing
 */

import { NextRequest, NextResponse } from 'next/server';
import { currentUser, clerkClient } from '@clerk/nextjs/server';
import OpenAI from 'openai';
import { ensureDbConnected, Brand } from '@/db';

const DEFAULT_STARTING_CREDITS = 10;
const LOGO_GENERATION_COST = 1;

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

// Simple in-memory cache (in production, use Redis)
const generationCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

interface LogoGenerationRequest {
  brandId: string;
  prompt: string;
  model?: string;
  size?: string;
  style?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Check credits
    const clerk = await clerkClient();
    const rawRemaining = (user.unsafeMetadata as any)?.remaining;
    const currentRemaining = typeof rawRemaining === 'number' ? rawRemaining : DEFAULT_STARTING_CREDITS;

    if (currentRemaining < LOGO_GENERATION_COST) {
      return NextResponse.json(
        { success: false, error: 'Insufficient credits' },
        { status: 402 }
      );
    }

    const body: LogoGenerationRequest = await request.json();
    const { brandId, prompt, model = 'black-forest-labs/flux-schnell', size = '1024x1024' } = body;

    // Check cache
    const cacheKey = `${user.id}:${brandId}:${prompt}:${model}:${size}`;
    const cached = generationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        url: cached.result.url,
        cached: true,
        remainingCredits: currentRemaining,
      });
    }

    // Generate logo
    const response = await client.images.generate({
      model: model as any,
      prompt: prompt,
      size: size as any,
    });

    const imageUrl = response.data?.[0]?.url || "";
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate image' },
        { status: 500 }
      );
    }

    // Cache result
    generationCache.set(cacheKey, { result: { url: imageUrl }, timestamp: Date.now() });

    // Deduct credits
    const newRemaining = currentRemaining - LOGO_GENERATION_COST;
    await clerk.users.updateUserMetadata(user.id, {
      unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: newRemaining },
    });

    // Save to database
    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (brand) {
      // Logo will be saved by the calling code
    }

    return NextResponse.json({
      success: true,
      url: imageUrl,
      remainingCredits: newRemaining,
    });
  } catch (error) {
    console.error('Logo generation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
