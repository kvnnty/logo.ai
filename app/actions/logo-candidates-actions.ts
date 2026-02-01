"use server";

import OpenAI from "openai";
import { currentUser } from "@clerk/nextjs/server";
import { ensureDbConnected, Brand, Logo, Template } from "@/db";
import { createDesign } from "@/app/actions/design-actions";
import { hydrateTemplate } from "@/lib/templates/brand-kit-templates";

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

export async function generateLogoCandidates(brandId: string, model: string = "black-forest-labs/flux-schnell", count: number = 8) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    if (!process.env.NEBIUS_API_KEY) {
      return { success: false, error: "Missing NEBIUS_API_KEY" };
    }

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: "Brand not found" };

    function makeCandidateId() {
      return `cand_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
    }

    function buildPrompts(input: { name: string; slogan?: string; industry?: string; vibeKeywords?: string[]; style?: string }) {
      const base = [
        `Brand name: "${input.name}"`,
        input.slogan ? `Slogan: "${input.slogan}"` : "",
        input.industry ? `Industry: ${input.industry}` : "",
        input.vibeKeywords?.length ? `Vibe keywords: ${input.vibeKeywords.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(". ");

      const archetypes = [
        "minimal geometric icon + clean wordmark",
        "bold typographic wordmark with custom letterforms",
        "monogram / lettermark inside a simple shape",
        "abstract symbol that suggests the brand concept",
        "modern tech-style mark with sharp lines",
        "friendly rounded mascot-like simple mark (still professional)",
        "luxury elegant mark with refined typography",
        "flat icon mark optimized for favicon readability",
      ];

      return archetypes.map((a) =>
        [
          "Create a professional logo on a clean white background.",
          "CRITICAL: include the brand name text clearly and legibly.",
          "Avoid mockups. No 3D renders. No gradients unless subtle.",
          `Direction: ${a}.`,
          base,
        ].join(" "),
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
        size: "1024x1024",
      });
      const imageUrl = image.data?.[0]?.url || "";
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

    (brand as any).logoCandidates = Array.isArray((brand as any).logoCandidates) ? [...(brand as any).logoCandidates, ...created] : created;
    brand.markModified("logoCandidates");
    await brand.save();

    return { success: true, candidates: created };
  } catch (error) {
    console.error("Generate candidates error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to generate candidates" };
  }
}

export async function getLogoCandidates(brandId: string) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    await ensureDbConnected();
    const brand = (await Brand.findOne({ _id: brandId, userId: user.id }).lean()) as any;
    if (!brand) return { success: false, error: "Brand not found" };

    return { success: true, candidates: brand.logoCandidates || [] };
  } catch (error) {
    console.error("List candidates error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to list candidates" };
  }
}

export async function applyLogo(brandId: string, candidateId: string) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    if (!candidateId?.trim()) {
      return { success: false, error: "Missing candidateId" };
    }

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: "Brand not found" };

    const candidates = Array.isArray((brand as any).logoCandidates) ? (brand as any).logoCandidates : [];
    const selectedCandidate = candidates.find((c: any) => c.candidateId === candidateId);

    if (!selectedCandidate) {
      return { success: false, error: "Candidate not found" };
    }

    // Set active logo candidate
    (brand as any).activeLogoCandidateId = candidateId;
    brand.status = "active";

    // Initialize brand identity if missing
    if (!brand.identity) {
      brand.identity = {
        primary_color: "#2563eb",
        secondary_color: "#ffffff",
        visual_style: (brand as any).vibeKeywords?.[0] || "modern",
      };
    }

    // Create primary logo in Logo collection
    await Logo.updateMany({ brandId: brand._id }, { isPrimary: false });
    await Logo.create({
      brandId: brand._id,
      userId: user.id,
      image_url: selectedCandidate.imageUrl,
      isPrimary: true,
      subType: "primary_logo",
      category: "logo",
      prompt: selectedCandidate.prompt || "Selected logo candidate",
    });

    const primaryLogoObj = { imageUrl: selectedCandidate.imageUrl };
    const starterCategories = ["business_card", "social_post", "letterhead", "email_signature", "social_cover"];
    const templates = await Template.find({ category: { $in: starterCategories } }).sort({ createdAt: 1 });
    const templatesByCategory: Record<string, any[]> = {};
    templates.forEach((t) => {
      if (!templatesByCategory[t.category]) templatesByCategory[t.category] = [];
      templatesByCategory[t.category].push(t);
    });

    const brandIdStr = brand._id.toString();
    for (const category of starterCategories) {
      const categoryTemplates = templatesByCategory[category] || [];
      for (let i = 0; i < Math.min(3, categoryTemplates.length); i++) {
        const template = categoryTemplates[i];
        const sceneData = hydrateTemplate(template, brand, primaryLogoObj);
        await createDesign(brandIdStr, { name: `Starter ${i + 1} ${category}`, initialScene: sceneData });
      }
    }

    return {
      success: true,
      brandId: brand._id.toString(),
      message: "Logo applied and starter kit generated",
    };
  } catch (error) {
    console.error("Apply logo error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to apply logo" };
  }
}
