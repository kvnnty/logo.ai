"use server";

import { randomBytes } from "node:crypto";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { ensureDbConnected, Brand, Logo, Template, BrandUpload, Design } from "@/db";
import { createDesign } from "@/app/actions/design-actions";
import { setPrimaryLogoByImageUrl as setPrimaryLogoByImageUrlFromLogo } from "@/app/actions/logo-actions";
import { getTemplateCategory } from "@/constants/template-categories";
import { AI_TEMPLATE_SCENE_PROMPT } from "@/lib/prompts";
import { AssetCategory, GET_TEMPLATE, hydrateTemplate } from "@/lib/templates/brand-kit-templates";
import { renderSceneToPNG, renderSceneToSVG, renderSceneToPDF } from "@/lib/render/scene-renderer";

const INTERACTIVE_DEFAULT_STARTING_CREDITS = 10;
const INTERACTIVE_GENERATION_COST = 1;

export async function generateInteractiveAsset(brandId: string, category: string, subType: string, templateIndex: number = 0, prompt?: string) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Credits: check & initialize
    const clerk = await clerkClient();
    const rawRemaining = (user.unsafeMetadata as any)?.remaining;
    const currentRemaining = typeof rawRemaining === "number" ? rawRemaining : INTERACTIVE_DEFAULT_STARTING_CREDITS;

    // Initialize credits once for new users (don't overwrite a real 0)
    if (typeof rawRemaining !== "number") {
      await clerk.users.updateUserMetadata(user.id, {
        unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: currentRemaining },
      });
    }

    if (currentRemaining < INTERACTIVE_GENERATION_COST) {
      return { success: false, error: "No credits left" };
    }

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) throw new Error("Brand not found");

    const primaryLogoDoc = await Logo.findOne({ brandId, isPrimary: true }).lean();
    const primaryLogo = primaryLogoDoc ? { imageUrl: (primaryLogoDoc as any).image_url } : null;

    // 1. Fetch Template from DB
    const templates = await Template.find({ category }).sort({ createdAt: 1 });
    let sceneData: any;

    if (templates.length > 0) {
      const selectedTemplate = templates[templateIndex % templates.length]; // Cycle if index > length
      // 2a. Hydrate Template (Replace Placeholders)
      sceneData = hydrateTemplate(selectedTemplate, brand, primaryLogo);
    } else {
      // 2b. Fallback to in-code template definitions when DB templates are missing
      const params = {
        brandName: brand.name,
        primaryColor: brand.identity?.primary_color || "#2563EB",
        secondaryColor: brand.identity?.secondary_color || "#FFFFFF",
        logoUrl: primaryLogo?.imageUrl ?? (primaryLogoDoc as any)?.image_url,
        website: brand.contactInfo?.website,
        email: brand.contactInfo?.email,
        phone: brand.contactInfo?.phone,
        address: brand.contactInfo?.address,
      };

      const fallback = GET_TEMPLATE(category as AssetCategory, templateIndex, params);
      if (!fallback) {
        throw new Error(`No template found for category ${category}`);
      }
      sceneData = fallback;
    }

    // Create Design document instead of brand.assets
    const designResult = await createDesign(brandId, {
      name: subType || category,
      initialScene: sceneData,
    });
    if (!designResult.success || !designResult.designId) {
      throw new Error(designResult.error || "Failed to create design");
    }

    // Deduct credits after successful generation
    const newRemaining = currentRemaining - INTERACTIVE_GENERATION_COST;
    await clerk.users.updateUserMetadata(user.id, {
      unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: newRemaining },
    });

    return { success: true, sceneData, remainingCredits: newRemaining, assetId: designResult.designId, designId: designResult.designId };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: "Failed" };
  }
}

/** Returns default template sceneData for a category without saving or deducting credits. */
export async function getDefaultTemplateScene(brandId: string, category: string, templateIndex: number = 0) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };
    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: "Brand not found" };

    const primaryLogoDoc = await Logo.findOne({ brandId, isPrimary: true }).lean();
    const primaryLogo = primaryLogoDoc ? { imageUrl: (primaryLogoDoc as any).image_url } : null;
    const templates = await Template.find({ category }).sort({ createdAt: 1 });
    let sceneData: any;

    if (templates.length > 0) {
      const selected = templates[templateIndex % templates.length];
      sceneData = hydrateTemplate(selected, brand, primaryLogo);
    } else {
      const params = {
        brandName: brand.name,
        primaryColor: brand.identity?.primary_color || "#2563EB",
        secondaryColor: brand.identity?.secondary_color || "#FFFFFF",
        logoUrl: primaryLogo?.imageUrl,
        website: brand.contactInfo?.website,
        email: brand.contactInfo?.email,
        phone: brand.contactInfo?.phone,
        address: brand.contactInfo?.address,
      };
      const fallback = GET_TEMPLATE(category as AssetCategory, templateIndex, params);
      if (!fallback) return { success: false, error: `No template for ${category}` };
      sceneData = fallback;
    }

    return { success: true, sceneData };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: "Failed" };
  }
}

/**
 * AI-powered template generation: user selects category + prompt, we return a new design (sceneData) and open in editor.
 * Uses Nebius (NEBIUS_API_KEY) for chat when prompt is provided; otherwise uses smart fallback from default templates.
 */
export async function generateAITemplate(brandId: string, category: string, prompt: string, styleInstruction?: string) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const clerk = await clerkClient();
    const rawRemaining = (user.unsafeMetadata as any)?.remaining;
    const currentRemaining = typeof rawRemaining === "number" ? rawRemaining : INTERACTIVE_DEFAULT_STARTING_CREDITS;
    if (typeof rawRemaining !== "number") {
      await clerk.users.updateUserMetadata(user.id, {
        unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: currentRemaining },
      });
    }
    if (currentRemaining < INTERACTIVE_GENERATION_COST) {
      return { success: false, error: "No credits left" };
    }

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: "Brand not found" };

    const primaryLogoDoc = await Logo.findOne({ brandId, isPrimary: true }).lean();
    const primaryLogo = primaryLogoDoc ? { imageUrl: (primaryLogoDoc as any).image_url } : null;
    const cat = getTemplateCategory(category);
    const [defaultWidth, defaultHeight] = cat?.defaultSize ?? [1080, 1080];

    let sceneData: any;
    const trimmedPrompt = (prompt || "").trim();
    const nebiusKey = process.env.NEBIUS_API_KEY;
    const useAI = Boolean(nebiusKey && trimmedPrompt);

    async function useFallback() {
      const params = {
        brandName: brand.name,
        primaryColor: brand.identity?.primary_color || "#2563EB",
        secondaryColor: brand.identity?.secondary_color || "#FFFFFF",
        logoUrl: primaryLogo?.imageUrl,
        website: brand.contactInfo?.website,
        email: brand.contactInfo?.email,
        phone: brand.contactInfo?.phone,
        address: brand.contactInfo?.address,
      };
      const templates = await Template.find({ category }).sort({ createdAt: 1 });
      const templateIndex =
        templates.length > 0 ? Math.abs((trimmedPrompt || category).split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % Math.max(1, templates.length) : 0;

      if (templates.length > 0) {
        const selected = templates[templateIndex % templates.length];
        return hydrateTemplate(selected, brand, primaryLogo);
      }
      const fallback = GET_TEMPLATE(category as AssetCategory, templateIndex, params);
      if (!fallback) {
        throw new Error(`No template found for category ${category}`);
      }
      return fallback;
    }

    if (useAI) {
      try {
        const OpenAI = (await import("openai")).default;
        const { HELICONE_API_KEY } = process.env;
        const openai = new OpenAI({
          apiKey: nebiusKey,
          baseURL: HELICONE_API_KEY ? "https://nebius.helicone.ai/v1/" : "https://api.studio.nebius.ai/v1/",
          ...(HELICONE_API_KEY && {
            defaultHeaders: { "Helicone-Auth": `Bearer ${HELICONE_API_KEY}` },
          }),
        });
        const systemPrompt = AI_TEMPLATE_SCENE_PROMPT.replace(/\{\{category\}\}/g, category)
          .replace(/\{\{width\}\}/g, String(defaultWidth))
          .replace(/\{\{height\}\}/g, String(defaultHeight))
          .replace(/\{\{brandName\}\}/g, brand.name || "Brand")
          .replace(/\{\{style\}\}/g, styleInstruction || "Modern: contemporary, geometric, clean.")
          .replace(/\{\{prompt\}\}/g, trimmedPrompt);

        const completion = await openai.chat.completions.create({
          model: process.env.NEBIUS_TEMPLATE_MODEL || "meta-llama/Llama-3.3-70B-Instruct",
          messages: [{ role: "user", content: systemPrompt }],
          temperature: 0.7,
          max_tokens: 4096,
        });

        const content = completion.choices[0]?.message?.content?.trim() || "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const raw = jsonMatch ? jsonMatch[0] : content;
        const parsed = JSON.parse(raw) as { width?: number; height?: number; elements?: any[] };

        if (!Array.isArray(parsed.elements) || parsed.elements.length === 0) {
          throw new Error("AI returned invalid scene: missing elements array");
        }
        const width = Number(parsed.width) || defaultWidth;
        const height = Number(parsed.height) || defaultHeight;
        const aiTemplate = { width, height, elements: parsed.elements };
        sceneData = hydrateTemplate(aiTemplate, brand, primaryLogo);
      } catch (aiErr: any) {
        console.error("AI template generation failed, using fallback:", aiErr?.message || aiErr);
        sceneData = await useFallback();
      }
    } else {
      sceneData = await useFallback();
    }

    let imageUrl: string | undefined;
    try {
      const pngBuffer = await renderSceneToPNG(sceneData, 2);
      imageUrl = `data:image/png;base64,${pngBuffer.toString("base64")}`;
    } catch (err) {
      console.error("Failed to render scene preview:", err);
    }

    const subType = trimmedPrompt ? `${category}: ${trimmedPrompt.slice(0, 50)}` : `AI ${category}`;
    brand.assets.push({
      category,
      subType,
      prompt: trimmedPrompt || undefined,
      imageUrl,
      sceneData,
      createdAt: new Date(),
    } as any);
    await brand.save();

    const newRemaining = currentRemaining - INTERACTIVE_GENERATION_COST;
    await clerk.users.updateUserMetadata(user.id, {
      unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: newRemaining },
    });

    const newAsset = brand.assets[brand.assets.length - 1] as any;
    const assetId = newAsset?._id?.toString?.() ?? "";

    return { success: true, sceneData, remainingCredits: newRemaining, assetId };
  } catch (error) {
    console.error("generateAITemplate error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate design",
    };
  }
}

/** Create a new design from sceneData (e.g. when saving from editor with assetId "new"). No credit deduction. */
export async function createAssetFromScene(brandId: string, sceneData: any, category: string = "design", subType: string = "New Design") {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };
    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: "Brand not found" };

    const designResult = await createDesign(brandId, { name: subType, initialScene: sceneData });
    if (!designResult.success || !designResult.designId) {
      return { success: false, error: designResult.error || "Failed to create design" };
    }
    return { success: true, assetId: designResult.designId, designId: designResult.designId };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: "Failed" };
  }
}

export async function saveFinalBrand(data: { brandData: any; concepts: any[]; selectedConceptIndex: number }) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    await ensureDbConnected();
    const { brandData, concepts, selectedConceptIndex } = data;

    const baseSlug = slugFromName(brandData.name || "brand");
    const slug = await ensureUniqueSlug(baseSlug);
    // Create the Brand
    const newBrand = await Brand.create({
      userId: user.id,
      name: brandData.name,
      slug,
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

    // Create Logo documents for all logo variations
    let primaryLogoObj: { imageUrl: string } | null = null;
    for (let cIdx = 0; cIdx < concepts.length; cIdx++) {
      const concept = concepts[cIdx];

      for (const variant of concept.variations) {
        let subType = "logo_variation";
        const isPrimary = cIdx === selectedConceptIndex && variant.subType === "logo_horizontal";
        if (isPrimary) subType = "primary_logo";
        else if (cIdx === selectedConceptIndex) subType = "primary_variation";

        let imageUrl = concept.iconUrl || "";
        if (variant.sceneData?.elements) {
          const imageElement = variant.sceneData.elements.find((el: any) => el.type === "image");
          if (imageElement?.src) imageUrl = imageElement.src;
        }

        await Logo.create({
          brandId: newBrand._id,
          userId: user.id,
          image_url: imageUrl,
          isPrimary,
          subType,
          category: "logo",
          prompt: `Logo concept: ${concept.name}`,
          sceneData: variant.sceneData,
        });
        if (isPrimary) primaryLogoObj = { imageUrl };
      }
    }

    // Generate Starter Kit as Design documents
    const starterCategories = ["business_card", "social_post", "letterhead", "email_signature", "social_cover"];
    const templates = await Template.find({ category: { $in: starterCategories } });
    const templatesByCategory: Record<string, any[]> = {};
    templates.forEach((t) => {
      if (!templatesByCategory[t.category]) templatesByCategory[t.category] = [];
      templatesByCategory[t.category].push(t);
    });

    for (const category of starterCategories) {
      const categoryTemplates = templatesByCategory[category] || [];
      for (let i = 0; i < Math.min(3, categoryTemplates.length); i++) {
        const template = categoryTemplates[i];
        const sceneData = hydrateTemplate(template, newBrand, primaryLogoObj);
        await createDesign(brandId, {
          name: `Starter ${i + 1} ${category}`,
          initialScene: sceneData,
        });
      }
    }

    await newBrand.save();
    return { success: true, brandId };
  } catch (error) {
    console.error("Error saving brand:", error);
    return { success: false, error: "Failed to save brand" };
  }
}

export async function updateAssetScene(brandId: string, assetId: string, sceneData: any) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };
    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) throw new Error("Brand not found");

    const design = await Design.findOne({ _id: assetId, brandId, userId: user.id });
    if (design) {
      const pages = design.pages?.length ? [...design.pages] : [{ sceneData }];
      pages[0] = { ...pages[0], sceneData };
      design.pages = pages;
      design.updatedAt = new Date();
      await design.save();
      return { success: true };
    }

    const logo = await Logo.findOne({ _id: assetId, brandId, userId: user.id });
    if (logo) {
      logo.sceneData = sceneData;
      logo.updatedAt = new Date();
      await logo.save();
      return { success: true };
    }

    return { success: false, error: "Asset not found" };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: "Failed" };
  }
}

export async function getUserBrands() {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated", brands: [] };
    await ensureDbConnected();
    const brands = await Brand.find({ userId: user.id }).sort({ createdAt: -1 }).lean();
    const brandIds = (brands as any[]).map((b) => b._id);
    const primaryLogos = await Logo.find({ brandId: { $in: brandIds }, isPrimary: true }).lean();
    const primaryByBrand = new Map<string, string>();
    primaryLogos.forEach((l: any) => {
      const url = l.image_url || (l.sceneData?.elements?.find((el: any) => el.type === "image")?.src);
      if (url) primaryByBrand.set(l.brandId?.toString(), url);
    });
    const logoCounts = await Logo.aggregate([{ $match: { brandId: { $in: brandIds } } }, { $group: { _id: "$brandId", count: { $sum: 1 } } }]);
    const countByBrand = new Map<string, number>();
    logoCounts.forEach((r: any) => countByBrand.set(r._id?.toString(), r.count || 0));

    return {
      success: true,
      brands: (brands as any[]).map((b: any) => ({
        _id: b._id.toString(),
        name: b.name,
        slug: b.slug ?? null,
        listedPublicly: b.listedPublicly ?? true,
        description: b.description,
        createdAt: b.createdAt?.toISOString?.(),
        updatedAt: b.updatedAt?.toISOString?.(),
        assetCount: countByBrand.get(b._id?.toString()) || 0,
        primaryLogoUrl: primaryByBrand.get(b._id?.toString()) ?? null,
        industry: b.industry || "",
      })),
    };
  } catch (error) {
    return { success: false, error: "Failed", brands: [] };
  }
}

/** Generate URL-safe slug from name (lowercase, hyphenated). */
function slugFromName(name: string): string {
  return (name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "brand";
}

/** Random 6-char alphanumeric suffix (e.g. 1sqcga) to avoid guessable slugs / indexing. */
function randomSlugSuffix(): string {
  return randomBytes(3).toString("hex");
}

/** Ensure slug is unique; on collision append random suffix (e.g. acme-1sqcga) to avoid guessable sequences. */
async function ensureUniqueSlug(baseSlug: string, excludeBrandId?: string): Promise<string> {
  const queryFirst: any = { slug: baseSlug };
  if (excludeBrandId) queryFirst._id = { $ne: excludeBrandId };
  const taken = await Brand.findOne(queryFirst).select("_id").lean();
  if (!taken) return baseSlug;
  for (;;) {
    const slug = `${baseSlug}-${randomSlugSuffix()}`;
    const query: any = { slug };
    if (excludeBrandId) query._id = { $ne: excludeBrandId };
    const existing = await Brand.findOne(query).select("_id").lean();
    if (!existing) return slug;
  }
}

export async function getBrandById(brandId: string) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };
    await ensureDbConnected();
    const brand = (await Brand.findOne({ _id: brandId, userId: user.id }).lean()) as any;
    if (!brand) return { success: false, error: "Not found" };

    const logos = await Logo.find({ brandId: brand._id, userId: user.id }).sort({ isPrimary: -1, createdAt: -1 }).lean();
    const primaryLogo = logos.find((l: any) => l.isPrimary) ?? logos[0];
    let primaryLogoUrl = primaryLogo ? (primaryLogo as any).image_url : null;
    if (!primaryLogoUrl && primaryLogo && (primaryLogo as any).sceneData?.elements) {
      const imageElement = (primaryLogo as any).sceneData.elements.find((el: any) => el.type === "image");
      if (imageElement?.src) primaryLogoUrl = imageElement.src;
    }

    return {
      success: true,
      brand: {
        ...brand,
        _id: brand._id.toString(),
        logos: logos.map((l: any) => ({
          ...l,
          _id: l._id?.toString?.(),
          brandId: l.brandId?.toString?.(),
          imageUrl: l.image_url,
          createdAt: l.createdAt?.toISOString?.(),
          updatedAt: l.updatedAt?.toISOString?.(),
        })),
        primaryLogoUrl,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed" };
  }
}

/** Public: get brand by slug (no auth). Used for /brand/[slug] page. */
export async function getBrandBySlug(slug: string) {
  "use server";
  try {
    if (!slug?.trim()) return { success: false, error: "Missing slug" };
    await ensureDbConnected();
    const brand = (await Brand.findOne({ slug: slug.trim().toLowerCase() }).lean()) as any;
    if (!brand) return { success: false, error: "Not found" };

    const logos = await Logo.find({ brandId: brand._id }).sort({ isPrimary: -1, createdAt: -1 }).lean();
    const primaryLogo = logos.find((l: any) => l.isPrimary) ?? logos[0];
    let primaryLogoUrl = primaryLogo ? (primaryLogo as any).image_url : null;
    if (!primaryLogoUrl && primaryLogo && (primaryLogo as any).sceneData?.elements) {
      const imageElement = (primaryLogo as any).sceneData.elements.find((el: any) => el.type === "image");
      if (imageElement?.src) primaryLogoUrl = imageElement.src;
    }

    return {
      success: true,
      brand: {
        _id: brand._id.toString(),
        name: brand.name,
        slug: brand.slug,
        slogan: brand.slogan,
        description: brand.description,
        industry: brand.industry,
        identity: brand.identity,
        contactInfo: brand.contactInfo,
        logos: logos.map((l: any) => ({
          _id: l._id?.toString?.(),
          category: l.category,
          subType: l.subType,
          imageUrl: (l as any).image_url,
        })),
        primaryLogoUrl,
        createdAt: brand.createdAt?.toISOString?.(),
        updatedAt: brand.updatedAt?.toISOString?.(),
      },
    };
  } catch (error) {
    return { success: false, error: "Failed" };
  }
}

/** Public: list brands that are listed publicly (for /brand-directory). */
export async function getPublicBrands(options?: { industry?: string; limit?: number; skip?: number }) {
  "use server";
  try {
    await ensureDbConnected();
    const query: any = { listedPublicly: true, slug: { $exists: true, $ne: "" } };
    if (options?.industry?.trim()) query.industry = new RegExp(options.industry.trim(), "i");
    const limit = Math.min(100, options?.limit ?? 24);
    const skip = Math.max(0, options?.skip ?? 0);
    const brands = await Brand.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean();
    const brandIds = (brands as any[]).map((b) => b._id);
    const primaryLogos = await Logo.find({ brandId: { $in: brandIds }, isPrimary: true }).lean();
    const primaryByBrand = new Map<string, string>();
    primaryLogos.forEach((l: any) => {
      const url = l.image_url || (l.sceneData?.elements?.find((el: any) => el.type === "image")?.src);
      if (url) primaryByBrand.set(l.brandId?.toString(), url);
    });
    const list = (brands as any[]).map((b: any) => ({
      _id: b._id.toString(),
      name: b.name,
      slug: b.slug,
      description: b.description ?? "",
      industry: b.industry ?? "",
      primaryLogoUrl: primaryByBrand.get(b._id?.toString()) ?? null,
    }));
    return { success: true, brands: list };
  } catch (error) {
    return { success: false, brands: [] };
  }
}

/** Ensure brand has a slug (e.g. for existing brands created before slug existed). Owner only. */
export async function ensureBrandSlug(brandId: string) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };
    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: "Brand not found" };
    if (brand.slug) return { success: true, slug: brand.slug };
    const baseSlug = slugFromName(brand.name);
    brand.slug = await ensureUniqueSlug(baseSlug, brandId);
    await brand.save();
    return { success: true, slug: brand.slug };
  } catch (error) {
    return { success: false, error: "Failed" };
  }
}

/** Set slug and/or listedPublicly for a brand (owner only). If listedPublicly is true and slug is missing, generates slug from name. */
export async function updateBrandPublicProfile(brandId: string, data: { slug?: string; listedPublicly?: boolean }) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };
    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: "Brand not found" };
    if (data.listedPublicly !== undefined) brand.listedPublicly = data.listedPublicly;
    if (data.slug !== undefined && data.slug !== null) {
      const raw = (data.slug as string).trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
      const slug = raw || slugFromName(brand.name);
      brand.slug = await ensureUniqueSlug(slug, brandId);
    } else if (data.listedPublicly === true && !brand.slug) {
      const baseSlug = slugFromName(brand.name);
      brand.slug = await ensureUniqueSlug(baseSlug, brandId);
    }
    await brand.save();
    return { success: true, slug: brand.slug };
  } catch (error) {
    return { success: false, error: "Failed" };
  }
}

export async function deleteBrand(brandId: string) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };
    await ensureDbConnected();
    await Brand.deleteOne({ _id: brandId, userId: user.id });
    await Logo.deleteMany({ brandId });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed" };
  }
}

export async function createBrand(data: { name: string; slogan?: string; industry?: string; vibeKeywords?: string[] }) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { name, slogan, industry, vibeKeywords } = data;
    if (!name?.trim()) return { success: false, error: "Missing brand name" };

    await ensureDbConnected();
    const baseSlug = slugFromName(name.trim());
    const slug = await ensureUniqueSlug(baseSlug);
    const brand = await Brand.create({
      userId: user.id,
      name: name.trim(),
      slug,
      slogan: slogan?.trim() || "",
      industry: industry?.trim() || "",
      vibeKeywords: Array.isArray(vibeKeywords) ? vibeKeywords.filter(Boolean).slice(0, 12) : [],
      status: "draft",
      logoCandidates: [],
    });

    return { success: true, brandId: brand._id.toString() };
  } catch (error) {
    console.error("Create brand error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create brand" };
  }
}

export async function updateBrand(brandId: string, details: any) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };
    await ensureDbConnected();

    const updateData: any = {
      name: details.name,
      description: details.description,
    };

    if (details.primaryColor || details.secondaryColor) {
      updateData.identity = {
        primary_color: details.primaryColor,
        secondary_color: details.secondaryColor,
      };
    }

    await Brand.findOneAndUpdate({ _id: brandId, userId: user.id }, { $set: updateData });
    return { success: true };
  } catch (error) {
    console.error("Error updating brand:", error);
    return { success: false };
  }
}

export async function updateBrandDetails(brandId: string, details: any) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };
    await ensureDbConnected();
    await Brand.findOneAndUpdate({ _id: brandId, userId: user.id }, { $set: details });
    return { success: true };
  } catch (error) {
    console.error("Error updating brand details:", error);
    return { success: false };
  }
}

const EXPORT_DEFAULT_STARTING_CREDITS = 10;

export async function exportBrandKit(brandId: string) {
  "use server";
  try {
    const JSZip = (await import("jszip")).default;

    const { clerkClient, currentUser: getCurrentUser } = await import("@clerk/nextjs/server");
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const EXPORT_COST_CREDITS = 1;

    const clerk = await clerkClient();
    const rawRemaining = (user.unsafeMetadata as any)?.remaining;
    const currentRemaining = typeof rawRemaining === "number" ? rawRemaining : EXPORT_DEFAULT_STARTING_CREDITS;

    // Initialize credits once for new users (don't overwrite real 0)
    if (typeof rawRemaining !== "number") {
      await clerk.users.updateUserMetadata(user.id, {
        unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: currentRemaining },
      });
    }

    if (currentRemaining < EXPORT_COST_CREDITS) {
      return { success: false, error: "Not enough credits to export" };
    }

    await ensureDbConnected();
    const brand = (await Brand.findOne({ _id: brandId, userId: user.id }).lean()) as any;
    if (!brand) return { success: false, error: "Brand not found" };

    function safeFileName(input: string) {
      return (
        input
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60) || "brand"
      );
    }

    function guessExtFromContentType(contentType: string | null) {
      if (!contentType) return "bin";
      if (contentType.includes("image/png")) return "png";
      if (contentType.includes("image/jpeg")) return "jpg";
      if (contentType.includes("image/webp")) return "webp";
      if (contentType.includes("image/svg+xml")) return "svg";
      if (contentType.includes("application/pdf")) return "pdf";
      if (contentType.includes("application/json")) return "json";
      return "bin";
    }

    function parseDataUrl(dataUrl: string): { mime: string; data: Buffer } | null {
      const match = /^data:([^;,]+)?(;base64)?,(.*)$/i.exec(dataUrl);
      if (!match) return null;
      const mime = match[1] || "application/octet-stream";
      const isBase64 = Boolean(match[2]);
      const payload = match[3] || "";
      const data = isBase64 ? Buffer.from(payload, "base64") : Buffer.from(decodeURIComponent(payload), "utf8");
      return { mime, data };
    }

    async function fetchAsBuffer(url: string) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch asset: ${res.status} ${res.statusText}`);
      const contentType = res.headers.get("content-type");
      const arr = await res.arrayBuffer();
      return { contentType, buffer: Buffer.from(arr) };
    }

    const zip = new JSZip();
    const base = safeFileName(brand.name || "brand");

    // Metadata
    zip.file(
      `${base}/brand.json`,
      JSON.stringify(
        {
          _id: brand._id?.toString?.() || brandId,
          name: brand.name,
          description: brand.description,
          industry: brand.industry,
          identity: brand.identity,
          strategy: brand.strategy,
          contactInfo: brand.contactInfo,
          exportedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );

    const logos = await Logo.find({ brandId: brand._id }).lean();
    const uploads = await BrandUpload.find({ brandId: brand._id }).lean();
    const designs = await Design.find({ brandId: brand._id }).lean();
    const imagesFolder = zip.folder(`${base}/images`);
    const scenesFolder = zip.folder(`${base}/scenes`);
    const renderedFolder = zip.folder(`${base}/rendered`);
    if (!imagesFolder || !scenesFolder || !renderedFolder) {
      throw new Error("Failed to initialize zip folders");
    }

    let imageCount = 0;
    let sceneCount = 0;
    let renderedCount = 0;

    async function addAssetToZip(asset: any, category: string, subType: string, sceneData: any, imageUrl: string | undefined) {
      if (!imagesFolder || !scenesFolder || !renderedFolder) return;
      const id = asset?._id?.toString?.() || `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const baseFileName = `${category}__${subType}__${id}`.replace(/[^a-zA-Z0-9_.-]+/g, "_");

      if (sceneData) {
        scenesFolder.file(`${baseFileName}.json`, JSON.stringify(sceneData, null, 2));
        sceneCount += 1;
        try {
          const pngBuffer = await renderSceneToPNG(sceneData, 2);
          renderedFolder.file(`${baseFileName}.png`, pngBuffer);
          const svgString = renderSceneToSVG(sceneData);
          renderedFolder.file(`${baseFileName}.svg`, svgString);
          const pdfBuffer = await renderSceneToPDF(sceneData);
          renderedFolder.file(`${baseFileName}.pdf`, pdfBuffer);
          renderedCount += 3;
        } catch (e) {
          console.error(`Failed to render ${baseFileName}:`, e);
        }
      }

      const img = imageUrl ?? (asset as any)?.image_url;
      if (typeof img === "string" && img.length > 0) {
        if (img.startsWith("data:")) {
          const parsed = parseDataUrl(img);
          if (parsed) {
            const ext = guessExtFromContentType(parsed.mime);
            imagesFolder.file(`${baseFileName}.${ext}`, parsed.data);
            imageCount += 1;
          }
        } else if (img.startsWith("http://") || img.startsWith("https://")) {
          try {
            const { contentType, buffer } = await fetchAsBuffer(img);
            const ext = guessExtFromContentType(contentType);
            imagesFolder.file(`${baseFileName}.${ext}`, buffer);
            imageCount += 1;
          } catch (e) {
            console.error(`Failed to fetch image ${baseFileName}:`, e);
          }
        }
      }
    }

    for (const logo of logos as any[]) {
      await addAssetToZip(logo, "logo", logo.subType || "logo", logo.sceneData, logo.image_url);
    }
    for (const upload of uploads as any[]) {
      await addAssetToZip(upload, "upload", upload.fileName || "upload", undefined, upload.imageUrl);
    }
    for (const design of designs as any[]) {
      const pages = design.pages || [];
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        await addAssetToZip(design, "design", `${design.name || "design"}_page${i + 1}`, page?.sceneData, undefined);
      }
    }

    zip.file(
      `${base}/manifest.json`,
      JSON.stringify(
        {
          brandId: brand._id?.toString?.() || brandId,
          imageCount,
          sceneCount,
          renderedCount,
          notes: [
            "This ZIP contains:",
            "- images/: Original uploaded images",
            "- scenes/: Editable scene JSON files",
            "- rendered/: Pre-rendered PNG, SVG, and PDF exports of all sceneData assets",
          ],
        },
        null,
        2,
      ),
    );

    const out = await zip.generateAsync({ type: "nodebuffer" });

    // Consume credits ONLY on successful bundle creation
    const newRemaining = currentRemaining - EXPORT_COST_CREDITS;
    await clerk.users.updateUserMetadata(user.id, {
      unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: newRemaining },
    });

    // Convert buffer to base64 for server action response
    const base64 = out.toString("base64");
    const fileName = `${base}-brand-kit.zip`;

    return {
      success: true,
      data: base64,
      fileName,
      mimeType: "application/zip",
      remainingCredits: newRemaining,
    };
  } catch (error) {
    console.error("Export error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Export failed",
    };
  }
}

export async function setPrimaryLogoByImageUrl(brandId: string, imageUrl: string) {
  return setPrimaryLogoByImageUrlFromLogo(brandId, imageUrl);
}

export async function addUserAsset(brandId: string, imageUrl: string, fileName: string) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: "Brand not found" };

    const upload = await BrandUpload.create({
      brandId,
      userId: user.id,
      imageUrl,
      fileName: fileName || "upload",
    });
    return { success: true, assetId: upload._id.toString() };
  } catch (error) {
    console.error("Error adding user asset:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to add asset" };
  }
}

export async function deleteUserAsset(brandId: string, assetId: string) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    await ensureDbConnected();
    const deleted = await BrandUpload.findOneAndDelete({ _id: assetId, brandId, userId: user.id });
    if (!deleted) return { success: false, error: "Asset not found" };
    return { success: true };
  } catch (error) {
    console.error("Error deleting user asset:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete asset" };
  }
}

export async function listBrandUploads(brandId: string) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated", uploads: [] };
    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: "Brand not found", uploads: [] };
    const uploads = await BrandUpload.find({ brandId, userId: user.id }).sort({ createdAt: -1 }).lean();
    return {
      success: true,
      uploads: (uploads as any[]).map((u) => ({
        ...u,
        _id: u._id?.toString?.(),
        brandId: u.brandId?.toString?.(),
        category: "user_upload",
        subType: u.fileName || "upload",
        imageUrl: u.imageUrl,
        createdAt: u.createdAt?.toISOString?.(),
      })),
    };
  } catch (error) {
    console.error("listBrandUploads:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed", uploads: [] };
  }
}

export async function allLogos() {
  "use server";
  try {
    await ensureDbConnected();
    const logos = await Logo.find({}).sort({ createdAt: -1 }).limit(100).lean();
    return (logos as any[]).map((h) => ({
      ...h,
      _id: h._id.toString(),
      id: h._id.toString(),
      createdAt: h.createdAt?.toISOString(),
      updatedAt: h.updatedAt?.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching all logos:", error);
    return null;
  }
}

export async function checkHistory() {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return null;
    await ensureDbConnected();
    const history = await Logo.find({ userId: user.id }).sort({ createdAt: -1 }).lean();
    return (history as any[]).map((h) => ({
      ...h,
      _id: h._id.toString(),
      id: h._id.toString(),
      createdAt: h.createdAt?.toISOString(),
      updatedAt: h.updatedAt?.toISOString(),
    }));
  } catch (error) {
    console.error("Error checking history:", error);
    return null;
  }
}
