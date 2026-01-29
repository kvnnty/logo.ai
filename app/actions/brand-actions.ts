"use server";

import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { ensureDbConnected, Brand, Logo, Template } from "@/db";
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

    const primaryLogo = brand.assets?.find((a: any) => a.category === "logo" || a.subType === "primary_logo");

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
        logoUrl: primaryLogo?.imageUrl,
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

    // Generate a preview image from the scene so the UI always has a thumbnail
    let imageUrl: string | undefined;
    try {
      const pngBuffer = await renderSceneToPNG(sceneData, 2);
      imageUrl = `data:image/png;base64,${pngBuffer.toString("base64")}`;
    } catch (err) {
      console.error("Failed to render scene preview:", err);
    }

    brand.assets.push({
      category,
      subType,
      prompt,
      imageUrl,
      sceneData,
      createdAt: new Date(),
    } as any);

    await brand.save();

    // Deduct credits after successful generation
    const newRemaining = currentRemaining - INTERACTIVE_GENERATION_COST;
    await clerk.users.updateUserMetadata(user.id, {
      unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: newRemaining },
    });

    const newAsset = brand.assets[brand.assets.length - 1] as any;
    const assetId = newAsset?._id?.toString?.() ?? "";

    return { success: true, sceneData, remainingCredits: newRemaining, assetId };
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

    const primaryLogo = brand.assets?.find((a: any) => a.category === "logo" || a.subType === "primary_logo");
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

/** Create a new asset from sceneData (e.g. when saving from editor with assetId "new"). No credit deduction. */
export async function createAssetFromScene(brandId: string, sceneData: any, category: string = "design", subType: string = "New Design") {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };
    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: "Brand not found" };

    let imageUrl: string | undefined;
    try {
      const pngBuffer = await renderSceneToPNG(sceneData, 2);
      imageUrl = `data:image/png;base64,${pngBuffer.toString("base64")}`;
    } catch (err) {
      console.error("Failed to render scene preview:", err);
    }

    brand.assets.push({
      category,
      subType,
      prompt: undefined,
      imageUrl,
      sceneData,
      createdAt: new Date(),
    } as any);
    await brand.save();

    const newAsset = brand.assets[brand.assets.length - 1] as any;
    const assetId = newAsset?._id?.toString?.() ?? "";
    return { success: true, assetId };
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
        let subType = "logo_variation";
        if (cIdx === selectedConceptIndex) {
          if (variant.subType === "logo_horizontal") subType = "primary_logo";
          else subType = "primary_variation";
        }

        // Extract imageUrl from sceneData or use concept.iconUrl as fallback
        let imageUrl = concept.iconUrl || "";
        if (variant.sceneData?.elements) {
          const imageElement = variant.sceneData.elements.find((el: any) => el.type === "image");
          if (imageElement?.src) {
            imageUrl = imageElement.src;
          }
        }

        newBrand.assets.push({
          category: "logo",
          subType: subType,
          imageUrl: imageUrl,
          prompt: `Logo concept: ${concept.name}`,
          sceneData: variant.sceneData,
          conceptId,
          conceptColors: concept.colors,
          createdAt: new Date(),
        } as any);
      }
    }

    // Generate Starter Kit (Zoviz-style auto-generation)
    const starterCategories = ["business_card", "social_post", "letterhead", "email_signature", "social_cover"];
    const templates = await Template.find({ category: { $in: starterCategories } });

    // Group templates by category
    const templatesByCategory: Record<string, any[]> = {};
    templates.forEach((t) => {
      if (!templatesByCategory[t.category]) templatesByCategory[t.category] = [];
      templatesByCategory[t.category].push(t);
    });

    const primaryLogo = newBrand.assets.find((a: any) => a.subType === "primary_logo");
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
          prompt: `Auto-generated ${category}`,
        } as any);
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
    const asset = (brand.assets as any).id(assetId);
    if (!asset) throw new Error("Asset not found");
    asset.sceneData = sceneData;
    brand.markModified("assets");
    await brand.save();
    return { success: true };
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
    return {
      success: true,
      brands: (brands as any[]).map((b: any) => {
        const primaryLogo = b.assets?.find((a: any) => a.subType === "primary_logo");
        let primaryLogoUrl = primaryLogo?.imageUrl || null;

        // If imageUrl is missing, try to extract from sceneData
        if (!primaryLogoUrl && primaryLogo?.sceneData?.elements) {
          const imageElement = primaryLogo.sceneData.elements.find((el: any) => el.type === "image");
          if (imageElement?.src) {
            primaryLogoUrl = imageElement.src;
          }
        }

        return {
          _id: b._id.toString(),
          name: b.name,
          description: b.description,
          createdAt: b.createdAt?.toISOString(),
          updatedAt: b.updatedAt?.toISOString(),
          assetCount: b.assets?.length || 0,
          primaryLogoUrl,
          industry: b.industry || "",
        };
      }),
    };
  } catch (error) {
    return { success: false, error: "Failed", brands: [] };
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
    return {
      success: true,
      brand: {
        ...brand,
        _id: brand._id.toString(),
        assets: brand.assets.map((a: any) => ({ ...a, _id: a._id.toString() })),
      },
    };
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
    const brand = await Brand.create({
      userId: user.id,
      name: name.trim(),
      slogan: slogan?.trim() || "",
      industry: industry?.trim() || "",
      vibeKeywords: Array.isArray(vibeKeywords) ? vibeKeywords.filter(Boolean).slice(0, 12) : [],
      status: "draft",
      assets: [],
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

    const assets: any[] = Array.isArray(brand.assets) ? brand.assets : [];
    const imagesFolder = zip.folder(`${base}/images`);
    const scenesFolder = zip.folder(`${base}/scenes`);
    const renderedFolder = zip.folder(`${base}/rendered`);
    if (!imagesFolder || !scenesFolder || !renderedFolder) {
      throw new Error("Failed to initialize zip folders");
    }

    let imageCount = 0;
    let sceneCount = 0;
    let renderedCount = 0;

    for (const asset of assets) {
      const id = asset?._id?.toString?.() || `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const category = String(asset?.category || "asset");
      const subType = String(asset?.subType || "variant");
      const baseFileName = `${category}__${subType}__${id}`.replace(/[^a-zA-Z0-9_.-]+/g, "_");

      // Always include sceneData if present
      if (asset?.sceneData) {
        // Save JSON
        scenesFolder.file(`${baseFileName}.json`, JSON.stringify(asset.sceneData, null, 2));
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
      if (typeof imageUrl === "string" && imageUrl.length > 0) {
        if (imageUrl.startsWith("data:")) {
          const parsed = parseDataUrl(imageUrl);
          if (parsed) {
            const ext = guessExtFromContentType(parsed.mime);
            imagesFolder.file(`${baseFileName}.${ext}`, parsed.data);
            imageCount += 1;
          }
        } else if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
          const { contentType, buffer } = await fetchAsBuffer(imageUrl);
          const ext = guessExtFromContentType(contentType);
          imagesFolder.file(`${baseFileName}.${ext}`, buffer);
          imageCount += 1;
        }
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

export async function setPrimaryLogo(brandId: string, imageUrl: string) {
  "use server";
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) throw new Error("Brand not found");

    brand.assets = brand.assets.map((asset: any) => {
      if (asset.imageUrl === imageUrl) {
        return { ...asset.toObject(), subType: "primary_logo" };
      } else if (asset.subType === "primary_logo") {
        return { ...asset.toObject(), subType: "logo_variation" };
      }
      return asset;
    });

    brand.markModified("assets");
    await brand.save();
    return { success: true };
  } catch (error) {
    console.error("Error setting primary logo:", error);
    return { success: false, error: "Failed" };
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
