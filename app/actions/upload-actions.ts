'use server';

import { currentUser } from "@clerk/nextjs/server";
import { ensureDbConnected, Brand } from '@/db';
import OpenAI from 'openai';
import dedent from 'dedent';
import { generateInteractiveAsset } from "./actions";

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
}) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'User not authenticated' };

    await ensureDbConnected();

    // 1. Analyze Brand Identity from Logo (Simulated Vision or Smart Prompt)
    // Since we don't have a direct Vision API call enabled in the standard client easily for this specific platform,
    // we will use the name and colors to "imagine" the identity based on the uploaded asset context.
    const analysisPrompt = dedent`
      Analyze and create a brand strategy for a company that already has a logo.
      Company Name: ${data.companyName}
      Logo Colors: Primary ${data.primaryColor}, Secondary ${data.secondaryColor}
      
      Generate a brand strategy and identity JSON that matches this existing visual baseline.
      Focus on maintaining consistency with the provided colors.
      
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
      strategy: brandData.strategy,
      identity: brandData.identity,
      assets: [{
        category: 'logo',
        subType: 'original',
        imageUrl: data.logoUrl,
        prompt: 'Uploaded original logo',
        createdAt: new Date(),
      }],
    });

    const brandId = newBrand._id.toString();

    // 3. Generate Interactive Assets (Background)
    const starterCategories = [
      'social_post', 'social_story', 'youtube_thumbnail',
      'marketing_flyer', 'ads',
      'business_card', 'letterhead', 'email_signature'
    ];

    starterCategories.forEach(cat => {
      // Generate 5 of each matching the existing logo theme
      [1, 2, 3, 4, 5].forEach(i => {
        generateInteractiveAsset(brandId, cat, `Design ${i}`);
      });
    });

    return { success: true, brandId };
  } catch (error) {
    console.error('Error creating brand from upload:', error);
    return { success: false, error: 'Failed to create brand' };
  }
}
