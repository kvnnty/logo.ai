"use server";

import OpenAI from "openai";
import { z } from "zod";
import dedent from "dedent";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { ensureDbConnected, Logo } from "@/db";
import { BRAND_SYSTEM_PROMPT, LOGO_MULTIPLE_CONCEPTS_PROMPT, LOGO_SET_VARIANTS } from "@/lib/prompts";

const DEFAULT_STARTING_CREDITS = 10;

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

const FormSchema = z.object({
  companyName: z.string(),
  style: z.string(),
  symbolPreference: z.string(),
  additionalInfo: z.string().optional(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  model: z.enum(["dall-e-3", "black-forest-labs/flux-schnell", "black-forest-labs/flux-dev"]),
  size: z.enum(["256x256", "512x512", "1024x1024"]).default("512x512"),
  quality: z.enum(["standard", "hd"]).default("standard"),
});

const styleLookup: { [key: string]: string } = {
  flashy: "Flashy, attention grabbing, bold, futuristic, and eye-catching. Use vibrant neon colors with metallic, shiny, and glossy accents.",
  tech: "highly detailed, sharp focus, cinematic, photorealistic, Minimalist, clean, sleek, neutral color pallete with subtle accents, clean lines, shadows, and flat.",
  corporate:
    "modern, forward-thinking, flat design, geometric shapes, clean lines, natural colors with subtle accents, use strategic negative space to create visual interest.",
  creative: "playful, lighthearted, bright bold colors, rounded shapes, lively.",
  abstract: "abstract, artistic, creative, unique shapes, patterns, and textures to create a visually interesting and wild logo.",
  minimal: "minimal, simple, timeless, versatile, single color logo, use negative space, flat design with minimal details, Light, soft, and subtle.",
};

function hexToColorName(hex: string): string {
  const colorMap: Record<string, string> = {
    "#2563eb": "blue",
    "#dc2626": "red",
    "#d97706": "orange",
    "#16a34a": "green",
    "#9333ea": "purple",
    "#000000": "black",
    "#ffffff": "white",
  };
  return colorMap[hex.toLowerCase()] || hex;
}

export async function generateLogo(formData: z.infer<typeof FormSchema>) {
  "use server";
  try {
    if (!apiKey) return { success: false, error: "Missing NEBIUS_API_KEY" };
    const user = await currentUser();
    if (!user) return { success: false, error: "User not authenticated" };
    const clerk = await clerkClient();

    const rawRemaining = (user.unsafeMetadata as any)?.remaining;
    const currentRemaining = typeof rawRemaining === "number" ? rawRemaining : DEFAULT_STARTING_CREDITS;

    // Initialize credits once for new users (don't overwrite a real 0)
    if (typeof rawRemaining !== "number") {
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
      username: user.username || "Anonymous",
      userId: user.id,
      brandId: (formData as any).brandId,
    });

    const newRemaining = currentRemaining - 1;
    await clerk.users.updateUserMetadata(user.id, {
      unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: newRemaining },
    });

    return { success: true, url: imageUrl, remainingCredits: newRemaining };
  } catch (error) {
    console.error("Error generating logo:", error);
    return { success: false, error: "Failed" };
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
  "use server";
  try {
    if (!apiKey) return { success: false, error: "Missing NEBIUS_API_KEY" };
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    let prompt = BRAND_SYSTEM_PROMPT.replace("{{name}}", data.companyName).replace("{{description}}", data.description).replace("{{style}}", data.style);

    // Add optional context if provided
    const additionalContext: string[] = [];
    if (data.industries && data.industries.length > 0) {
      additionalContext.push(`INDUSTRIES: ${data.industries.join(", ")}`);
    }
    if (data.colorSchemes && data.colorSchemes.length > 0) {
      additionalContext.push(`COLOR SCHEMES: ${data.colorSchemes.join(", ")}`);
    }
    if (data.logoStyles && data.logoStyles.length > 0) {
      additionalContext.push(`LOGO STYLES: ${data.logoStyles.join(", ")}`);
    }

    if (additionalContext.length > 0) {
      prompt += "\n\nADDITIONAL CONTEXT:\n" + additionalContext.join("\n");
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
      },
    };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: "Failed" };
  }
}

export async function generateLogos(
  brandData: { name: string; description: string; identity: any },
  model: string = "black-forest-labs/flux-schnell",
  industries?: string[],
  colorSchemes?: string[],
  logoStyles?: string[],
  size: string = "1024x1024",
  quality: string = "standard",
) {
  "use server";
  try {
    if (!apiKey) return { success: false, error: "Missing NEBIUS_API_KEY" };
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };
    const clerk = await clerkClient();

    const rawRemaining = (user.unsafeMetadata as any)?.remaining;
    const currentRemaining = typeof rawRemaining === "number" ? rawRemaining : DEFAULT_STARTING_CREDITS;

    // Initialize credits once for new users (don't overwrite a real 0)
    if (typeof rawRemaining !== "number") {
      await clerk.users.updateUserMetadata(user.id, {
        unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: currentRemaining },
      });
    }

    if (currentRemaining <= 0) return { success: false, error: "No credits" };

    // Build industry string from selected industries
    const industryString = industries && industries.length > 0 ? industries.join(", ") : "General";

    // Build style string - combine visual style with logo styles if provided
    let styleString = brandData.identity?.visual_style || "modern";
    if (logoStyles && logoStyles.length > 0) {
      styleString += `, ${logoStyles.join(", ")}`;
    }

    // Build color context if color schemes provided
    let colorContext = "";
    if (colorSchemes && colorSchemes.length > 0) {
      colorContext = `\n\nCOLOR PREFERENCES: The user prefers ${colorSchemes.join(", ")} color schemes. Consider these color families when generating the logo concepts.`;
    }

    const conceptPrompt =
      LOGO_MULTIPLE_CONCEPTS_PROMPT.replace("{{name}}", brandData.name)
        .replace("{{industry}}", industryString)
        .replace("{{style}}", styleString)
        .replace("{{description}}", brandData.description || "")
        .replace("{{primaryColor}}", brandData.identity?.primary_color || "#000000")
        .replace("{{secondaryColor}}", brandData.identity?.secondary_color || "#ffffff") + colorContext;

    const conceptResponse = await client.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct",
      messages: [{ role: "user", content: conceptPrompt }],
      response_format: { type: "json_object" },
    });

    const { concepts } = JSON.parse(conceptResponse.choices[0].message.content || '{"concepts":[]}');

    // Generate all logos in parallel for near-instant results
    const logoPromises = concepts.map(async (concept: any) => {
      // Create a specific prompt for this icon using its unique colors
      const colorString = concept.colors.join(", ");
      const symbolPrompt = `A professional logo design for brand "${brandData.name}". 
      Concept: ${concept.symbolPrompt}.
      CRITICAL: The logo MUST include the text "${brandData.name}" clearly and legibly.
      Use these colors: ${colorString}. 
      Clean white background. High quality vector style.`;

      const imgResponse = await client.images.generate({
        model: model,
        prompt: symbolPrompt,
        size: size as any,
        ...(quality === "hd" && { quality: "hd" }),
      });

      const iconUrl = imgResponse.data?.[0]?.url || "";
      if (!iconUrl) return null;

      const variations = [
        {
          label: LOGO_SET_VARIANTS.icon.label,
          subType: LOGO_SET_VARIANTS.icon.subType,
          sceneData: { width: 1024, height: 1024, elements: [{ type: "image", src: iconUrl, x: 256, y: 256, width: 512, height: 512 }] },
        },
        {
          label: LOGO_SET_VARIANTS.text.label,
          subType: LOGO_SET_VARIANTS.text.subType,
          sceneData: {
            width: 1024,
            height: 1024,
            elements: [
              { type: "text", content: brandData.name, x: 512, y: 512, fontSize: 100, fontStyle: concept.fontFamily, fill: concept.colors[0], align: "center" },
            ],
          },
        },
        {
          label: LOGO_SET_VARIANTS.horizontal.label,
          subType: LOGO_SET_VARIANTS.horizontal.subType,
          sceneData: {
            width: 1024,
            height: 300,
            elements: [
              { type: "image", src: iconUrl, x: 50, y: 50, width: 200, height: 200 },
              { type: "text", content: brandData.name, x: 300, y: 100, fontSize: 80, fontStyle: concept.fontFamily, fill: concept.colors[0] },
            ],
          },
        },
        {
          label: LOGO_SET_VARIANTS.vertical.label,
          subType: LOGO_SET_VARIANTS.vertical.subType,
          sceneData: {
            width: 600,
            height: 800,
            elements: [
              { type: "image", src: iconUrl, x: 150, y: 100, width: 300, height: 300 },
              { type: "text", content: brandData.name, x: 300, y: 500, fontSize: 70, fontStyle: concept.fontFamily, fill: concept.colors[0], align: "center" },
            ],
          },
        },
        {
          label: "Primary Logo",
          subType: "primary_logo",
          sceneData: {
            width: 1024,
            height: 1024,
            elements: [
              { type: "image", src: iconUrl, x: 512, y: 350, width: 400, height: 400, align: "center" },
              { type: "text", content: brandData.name, x: 512, y: 750, fontSize: 120, fontStyle: concept.fontFamily, fill: concept.colors[0], align: "center" },
            ],
          },
        },
      ];

      return { ...concept, iconUrl, variations };
    });

    // Wait for all logos to generate in parallel
    const results = await Promise.all(logoPromises);
    const finalConcepts = results.filter((concept): concept is any => concept !== null);

    const newRemaining = currentRemaining - 1;
    await clerk.users.updateUserMetadata(user.id, {
      unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: newRemaining },
    });

    return { success: true, concepts: finalConcepts, remainingCredits: newRemaining };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: "Failed" };
  }
}
