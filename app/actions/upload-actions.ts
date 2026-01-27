'use server';

import { currentUser } from "@clerk/nextjs/server";
import { ensureDbConnected, Brand } from '@/db';
import OpenAI from 'openai';
import dedent from 'dedent';

const apiKey = process.env.NEBIUS_API_KEY;
const client = new OpenAI({
  apiKey,
  baseURL: process.env.HELICONE_API_KEY
    ? "https://nebius.helicone.ai/v1/"
    : "https://api.studio.nebius.ai/v1/",
});

export async function createBrandFromUpload(data: {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  description?: string;
  industries?: string[];
  colorSchemes?: string[];
  styles?: string[];
  model?: string;
  size?: string;
  quality?: string;
}) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'User not authenticated' };

    if (!apiKey) return { success: false, error: 'Missing NEBIUS_API_KEY' };

    await ensureDbConnected();

    // Build context for brand analysis
    const industryContext = data.industries && data.industries.length > 0 
      ? `Industry: ${data.industries.join(", ")}` 
      : "";
    const styleContext = data.styles && data.styles.length > 0 
      ? `Visual Style: ${data.styles.join(", ")}` 
      : "";
    const colorSchemeContext = data.colorSchemes && data.colorSchemes.length > 0 
      ? `Color Palette Preferences: ${data.colorSchemes.join(", ")}` 
      : "";
    const descriptionContext = data.description 
      ? `Company Description: ${data.description}` 
      : "";

    // 1. Analyze Brand Identity from Logo (Simulated Vision or Smart Prompt)
    // Since we don't have a direct Vision API call enabled in the standard client easily for this specific platform,
    // we will use the name and colors to "imagine" the identity based on the uploaded asset context.
    const analysisPrompt = dedent`
      Analyze and create a brand strategy for a company that already has a logo.
      Company Name: ${data.companyName}
      Logo Colors: Primary ${data.primaryColor}, Secondary ${data.secondaryColor}
      ${descriptionContext}
      ${industryContext}
      ${styleContext}
      ${colorSchemeContext}
      
      Generate a brand strategy and identity JSON that matches this existing visual baseline.
      Focus on maintaining consistency with the provided colors and incorporating the provided context.
      
      OUTPUT FORMAT (JSON ONLY):
      {
        "strategy": { "mission": "...", "personality": "...", "target_audience": "..." },
        "identity": { 
            "visual_style_rules": "...", 
            "primary_color": "${data.primaryColor}", 
            "secondary_color": "${data.secondaryColor}",
            "typography_notes": "..."
        }
      }
    `;

    const completion = await client.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct",
      messages: [
        { role: "system", content: "You are a Brand Strategist API. Return JSON." },
        { role: "user", content: analysisPrompt }
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Failed to analyze brand");

    const brandData = JSON.parse(content);

    // 2. Create Brand Record
    const newBrand = await Brand.create({
      userId: user.id,
      name: data.companyName,
      description: data.description || "",
      industry: data.industries && data.industries.length > 0 ? data.industries[0] : undefined,
      strategy: brandData.strategy,
      identity: brandData.identity,
      assets: [{
        category: 'logo',
        subType: 'primary_logo',
        imageUrl: data.logoUrl,
        prompt: 'Uploaded original logo',
        createdAt: new Date(),
      }],
    });

    const brandId = newBrand._id.toString();

    return { success: true, brandId };
  } catch (error) {
    console.error('Error creating brand from upload:', error);
    return { success: false, error: 'Failed to create brand' };
  }
}
