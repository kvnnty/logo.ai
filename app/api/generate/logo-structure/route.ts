/**
 * API Route for Logo Structure Analysis
 * Analyzes generated logos and splits them into icon/symbol and wordmark components
 */

import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import OpenAI from 'openai';
import { ensureDbConnected, Brand } from '@/db';

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

interface LogoStructureRequest {
  brandId: string;
  logoImageUrl: string;
  brandName: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const body: LogoStructureRequest = await request.json();
    const { brandId, logoImageUrl, brandName } = body;

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    // Use AI to analyze the logo structure
    // For now, we'll use a prompt-based approach to generate separate components
    // In production, you might use image analysis or segmentation models

    const analysisPrompt = `Analyze this logo image and provide a JSON structure describing:
1. Icon/Symbol component (if present): location, dimensions, description
2. Wordmark/Text component: text content, font style, location
3. Overall layout: horizontal, vertical, stacked, or icon-only

Logo URL: ${logoImageUrl}
Brand Name: ${brandName}

Return JSON with structure: { icon: { present: boolean, description: string }, wordmark: { text: string, present: boolean }, layout: string }`;

    const analysisResponse = await client.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct",
      messages: [
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(analysisResponse.choices[0].message.content || '{}');

    // Generate separate components
    const components: {
      icon?: { imageUrl: string; sceneData: any };
      wordmark?: { imageUrl: string; sceneData: any };
      combined?: { imageUrl: string; sceneData: any };
    } = {};

    // Generate icon-only version
    if (analysis.icon?.present) {
      const iconPrompt = `Create a clean icon/symbol version of this logo. Remove all text, keep only the visual symbol/icon. High quality, vector style, transparent background. Logo reference: ${logoImageUrl}`;
      
      const iconResponse = await client.images.generate({
        model: 'black-forest-labs/flux-schnell',
        prompt: iconPrompt,
        size: '1024x1024',
      });

      const iconUrl = iconResponse.data?.[0]?.url || '';
      if (iconUrl) {
        components.icon = {
          imageUrl: iconUrl,
          sceneData: {
            width: 1024,
            height: 1024,
            elements: [
              { type: 'image', src: iconUrl, x: 512, y: 512, width: 800, height: 800, align: 'center' }
            ]
          }
        };
      }
    }

    // Generate wordmark-only version
    if (analysis.wordmark?.present) {
      const wordmarkPrompt = `Create a clean wordmark/text-only version of this logo. Remove the icon/symbol, keep only the text "${brandName}". Use the same font style as the original logo. High quality, vector style. Logo reference: ${logoImageUrl}`;
      
      const wordmarkResponse = await client.images.generate({
        model: 'black-forest-labs/flux-schnell',
        prompt: wordmarkPrompt,
        size: '1024x300',
      });

      const wordmarkUrl = wordmarkResponse.data?.[0]?.url || '';
      if (wordmarkUrl) {
        components.wordmark = {
          imageUrl: wordmarkUrl,
          sceneData: {
            width: 1024,
            height: 300,
            elements: [
              { type: 'image', src: wordmarkUrl, x: 512, y: 150, width: 900, height: 200, align: 'center' }
            ]
          }
        };
      }
    }

    // Store components in brand assets
    if (components.icon) {
      brand.assets.push({
        category: 'logo',
        subType: 'logo_icon',
        imageUrl: components.icon.imageUrl,
        sceneData: components.icon.sceneData,
        createdAt: new Date(),
      } as any);
    }

    if (components.wordmark) {
      brand.assets.push({
        category: 'logo',
        subType: 'logo_wordmark',
        imageUrl: components.wordmark.imageUrl,
        sceneData: components.wordmark.sceneData,
        createdAt: new Date(),
      } as any);
    }

    await brand.save();

    return NextResponse.json({
      success: true,
      components: {
        icon: components.icon ? { imageUrl: components.icon.imageUrl } : null,
        wordmark: components.wordmark ? { imageUrl: components.wordmark.imageUrl } : null,
        layout: analysis.layout || 'horizontal',
      },
    });
  } catch (error) {
    console.error('Logo structure analysis error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
