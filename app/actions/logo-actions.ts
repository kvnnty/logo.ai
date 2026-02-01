"use server";

import { currentUser } from "@clerk/nextjs/server";
import { ensureDbConnected, Brand, Logo } from "@/db";
import { renderSceneToPNG, renderSceneToSVG, renderSceneToPDF } from "@/lib/render/scene-renderer";

/** List all logo variations for a brand. */
export async function listLogosByBrand(brandId: string) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated", logos: [] };

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: "Brand not found", logos: [] };

    const logos = await Logo.find({ brandId, userId: user.id }).sort({ isPrimary: -1, createdAt: -1 }).lean();
    return {
      success: true,
      logos: (logos as any[]).map((l) => ({
        ...l,
        _id: l._id.toString(),
        brandId: l.brandId?.toString(),
        createdAt: l.createdAt?.toISOString?.(),
        updatedAt: l.updatedAt?.toISOString?.(),
      })),
    };
  } catch (error) {
    console.error("listLogosByBrand:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed", logos: [] };
  }
}

/** Get primary logo for a brand (for hydration / templates). Returns { image_url } or null. */
export async function getPrimaryLogoForBrand(brandId: string) {
  try {
    await ensureDbConnected();
    const logo = await Logo.findOne({ brandId, isPrimary: true }).lean();
    if (!logo) {
      const anyLogo = await Logo.findOne({ brandId }).sort({ createdAt: -1 }).lean();
      if (!anyLogo) return { success: true, logo: null };
      return {
        success: true,
        logo: { image_url: (anyLogo as any).image_url, imageUrl: (anyLogo as any).image_url },
      };
    }
    return {
      success: true,
      logo: { image_url: (logo as any).image_url, imageUrl: (logo as any).image_url },
    };
  } catch (error) {
    console.error("getPrimaryLogoForBrand:", error);
    return { success: false, logo: null };
  }
}

/** Set one logo as primary (clear others). */
export async function setPrimaryLogo(brandId: string, logoId: string) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: "Brand not found" };

    const logo = await Logo.findOne({ _id: logoId, brandId, userId: user.id });
    if (!logo) return { success: false, error: "Logo not found" };

    await Logo.updateMany({ brandId }, { isPrimary: false });
    logo.isPrimary = true;
    logo.subType = "primary_logo";
    await logo.save();

    return { success: true };
  } catch (error) {
    console.error("setPrimaryLogo:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed" };
  }
}

/** Set primary logo by image URL (for compatibility). */
export async function setPrimaryLogoByImageUrl(brandId: string, imageUrl: string) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: "Brand not found" };

    const logo = await Logo.findOne({ brandId, userId: user.id, image_url: imageUrl });
    if (!logo) return { success: false, error: "Logo with this image not found" };

    await Logo.updateMany({ brandId }, { isPrimary: false, subType: "logo_variation" });
    logo.isPrimary = true;
    logo.subType = "primary_logo";
    await logo.save();

    return { success: true };
  } catch (error) {
    console.error("setPrimaryLogoByImageUrl:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed" };
  }
}

/** Add a logo variation. */
export async function addLogo(brandId: string, data: { image_url: string; isPrimary?: boolean; subType?: string; prompt?: string; sceneData?: any }) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: "Brand not found" };

    if (data.isPrimary) await Logo.updateMany({ brandId }, { isPrimary: false });

    const logo = await Logo.create({
      brandId,
      userId: user.id,
      image_url: data.image_url,
      isPrimary: data.isPrimary ?? false,
      subType: data.subType ?? (data.isPrimary ? "primary_logo" : "logo_variation"),
      category: "logo",
      prompt: data.prompt,
      sceneData: data.sceneData,
    });

    return { success: true, logoId: logo._id.toString() };
  } catch (error) {
    console.error("addLogo:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed" };
  }
}

/** Delete a logo. */
export async function deleteLogo(brandId: string, logoId: string) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    await ensureDbConnected();
    const logo = await Logo.findOne({ _id: logoId, brandId, userId: user.id });
    if (!logo) return { success: false, error: "Logo not found" };

    const wasPrimary = logo.isPrimary;
    await Logo.findByIdAndDelete(logoId);

    if (wasPrimary) {
      const next = await Logo.findOne({ brandId }).sort({ createdAt: -1 });
      if (next) {
        next.isPrimary = true;
        next.subType = "primary_logo";
        await next.save();
      }
    }

    return { success: true };
  } catch (error) {
    console.error("deleteLogo:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed" };
  }
}

/** Update logo sceneData (editable logos). */
export async function updateLogoScene(brandId: string, logoId: string, sceneData: any) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    await ensureDbConnected();
    const logo = await Logo.findOne({ _id: logoId, brandId, userId: user.id });
    if (!logo) return { success: false, error: "Logo not found" };

    logo.sceneData = sceneData;
    logo.updatedAt = new Date();
    await logo.save();

    return { success: true };
  } catch (error) {
    console.error("updateLogoScene:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed" };
  }
}

/** Download logo as PNG/SVG/PDF. Uses Logo collection (sceneData or image_url). */
export async function downloadLogoComponent(brandId: string, logoId: string, format: "png" | "svg" | "pdf" = "png") {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: "Brand not found" };

    const logo = await Logo.findOne({ _id: logoId, brandId, userId: user.id }).lean();
    if (!logo) return { success: false, error: "Logo not found" };

    const sceneData = (logo as any).sceneData;
    const imageUrl = (logo as any).image_url;

    let buffer: Buffer;
    let mimeType: string;
    let extension: string;
    let fileName: string;

    if (sceneData) {
      switch (format) {
        case "png":
          buffer = await renderSceneToPNG(sceneData, 2);
          mimeType = "image/png";
          extension = "png";
          break;
        case "svg":
          const svgString = renderSceneToSVG(sceneData);
          buffer = Buffer.from(svgString);
          mimeType = "image/svg+xml";
          extension = "svg";
          break;
        case "pdf":
          buffer = await renderSceneToPDF(sceneData);
          mimeType = "application/pdf";
          extension = "pdf";
          break;
        default:
          return { success: false, error: "Unsupported format" };
      }
      fileName = `${brand.name}-${(logo as any).subType || "logo"}.${extension}`;
    } else if (imageUrl) {
      if (format !== "png") return { success: false, error: "Image logos support PNG only (re-export from URL)" };
      if (imageUrl.startsWith("data:")) {
        const base64 = imageUrl.split(",")[1];
        if (!base64) return { success: false, error: "Invalid data URL" };
        buffer = Buffer.from(base64, "base64");
      } else {
        const res = await fetch(imageUrl);
        if (!res.ok) return { success: false, error: "Failed to fetch image" };
        const ab = await res.arrayBuffer();
        buffer = Buffer.from(ab);
      }
      mimeType = "image/png";
      extension = "png";
      fileName = `${brand.name}-logo.${extension}`;
    } else {
      return { success: false, error: "Logo has no scene data or image" };
    }

    const data = buffer.toString("base64");
    return { success: true, data, fileName, mimeType };
  } catch (error) {
    console.error("downloadLogoComponent:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to download" };
  }
}
