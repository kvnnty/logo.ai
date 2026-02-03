/**
 * API Route for Template Image Generation
 * Generates or selects images for brand kit templates
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { currentUser } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { ensureDbConnected, Brand } from "@/db";

const apiKey = process.env.NEBIUS_API_KEY || "";
const { HELICONE_API_KEY } = process.env;

const clientOptions: ConstructorParameters<typeof OpenAI>[0] = {
  apiKey,
  baseURL: HELICONE_API_KEY ? "https://nebius.helicone.ai/v1/" : "https://api.studio.nebius.ai/v1/",
  ...(HELICONE_API_KEY && {
    defaultHeaders: { "Helicone-Auth": `Bearer ${HELICONE_API_KEY}` },
  }),
};

const client = new OpenAI(clientOptions);

// Free stock image service (placeholder - use Unsplash, Pexels, etc. in production)
const STOCK_IMAGE_CATEGORIES = {
  people: ["professional", "business", "team", "lifestyle"],
  products: ["product", "object", "item"],
  environments: ["office", "workspace", "modern", "interior"],
  abstract: ["abstract", "pattern", "texture", "background"],
};

interface TemplateImageRequest {
  brandId: string;
  category: string;
  templateType: string;
  imageType: "people" | "products" | "environments" | "abstract";
  style?: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const body: TemplateImageRequest = await request.json();
    const { brandId, category, templateType, imageType, style = "professional" } = body;

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
    }

    // Generate image based on type and brand context
    const keywords = STOCK_IMAGE_CATEGORIES[imageType] || ["professional"];
    const prompt = `High-quality ${style} ${imageType} image suitable for ${templateType} template. 
    Style: ${brand.identity?.visual_style || "modern"}. 
    Colors: ${brand.identity?.primary_color || "#000000"}. 
    Professional, clean, ready for commercial use. 
    Keywords: ${keywords.join(", ")}`;

    const response = await client.images.generate({
      model: "black-forest-labs/flux-schnell",
      prompt: prompt,
      size: "1024x1024",
    });

    const imageUrl = response.data?.[0]?.url || "";
    if (!imageUrl) {
      return NextResponse.json({ success: false, error: "Failed to generate image" }, { status: 500 });
    }

    // In production, you might also fetch from free stock APIs:
    // - Unsplash API
    // - Pexels API
    // - Pixabay API
    // Then select the best match or generate if no match found

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      source: "ai-generated",
    });
  } catch (error) {
    console.error("Template image generation error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Generation failed" }, { status: 500 });
  }
}
