"use server";

import { currentUser } from "@clerk/nextjs/server";
import { ensureDbConnected, Brand, Design } from "@/db";
import { renderSceneToPNG, renderSceneToSVG, renderSceneToPDF } from "@/lib/render/scene-renderer";

/** Create a new design (blank or from initial scene). Returns designId. */
export async function createDesign(
  brandId: string,
  options?: { name?: string; initialScene?: any }
) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: "Brand not found" };

    const scene = options?.initialScene ?? {
      width: 1080,
      height: 1080,
      elements: [{ type: "rect", x: 0, y: 0, width: 1080, height: 1080, fill: "#ffffff", draggable: false }],
    };

    const design = await Design.create({
      userId: user.id,
      brandId,
      name: options?.name ?? "Untitled design",
      pages: [{ sceneData: scene }],
      source: "blank",
    });

    return { success: true, designId: design._id.toString() };
  } catch (error) {
    console.error("createDesign:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create design" };
  }
}

/** Get a single design by ID (must belong to user). */
export async function getDesign(designId: string) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    await ensureDbConnected();
    const design = await Design.findOne({ _id: designId, userId: user.id }).lean();
    if (!design) return { success: false, error: "Design not found" };

    return {
      success: true,
      design: {
        ...design,
        _id: (design as any)._id.toString(),
        brandId: (design as any).brandId?.toString(),
        createdAt: (design as any).createdAt?.toISOString?.(),
        updatedAt: (design as any).updatedAt?.toISOString?.(),
      },
    };
  } catch (error) {
    console.error("getDesign:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to load design" };
  }
}

/** Update design name, pages, favorite, etc. */
export async function updateDesign(
  designId: string,
  updates: { name?: string; pages?: any[]; favorite?: boolean; thumbnailUrl?: string }
) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    await ensureDbConnected();
    const design = await Design.findOne({ _id: designId, userId: user.id });
    if (!design) return { success: false, error: "Design not found" };

    if (updates.name !== undefined) design.name = updates.name;
    if (updates.pages !== undefined) design.pages = updates.pages;
    if (updates.favorite !== undefined) design.favorite = updates.favorite;
    if (updates.thumbnailUrl !== undefined) design.thumbnailUrl = updates.thumbnailUrl;
    design.updatedAt = new Date();
    await design.save();

    return { success: true };
  } catch (error) {
    console.error("updateDesign:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update design" };
  }
}

/** List designs for a brand (user's designs). */
export async function listDesigns(brandId: string) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated", designs: [] };

    await ensureDbConnected();
    const designs = await Design.find({ brandId, userId: user.id })
      .sort({ updatedAt: -1 })
      .lean();

    return {
      success: true,
      designs: designs.map((d: any) => ({
        ...d,
        _id: d._id.toString(),
        brandId: d.brandId?.toString(),
        createdAt: d.createdAt?.toISOString?.(),
        updatedAt: d.updatedAt?.toISOString?.(),
      })),
    };
  } catch (error) {
    console.error("listDesigns:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to list designs", designs: [] };
  }
}

export type ExportFormat = "png" | "svg" | "pdf";

/** Export current scene to file. Returns data URL and suggested filename. */
export async function exportSceneToFile(
  sceneData: any,
  format: ExportFormat,
  options?: { scale?: number; transparent?: boolean }
) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const scale = options?.scale ?? 2;
    const transparent = options?.transparent ?? false;

    if (format === "png") {
      const buffer = await renderSceneToPNG(sceneData, scale, { transparent });
      const base64 = buffer.toString("base64");
      const dataUrl = `data:image/png;base64,${base64}`;
      const w = Math.round(sceneData.width * scale);
      const h = Math.round(sceneData.height * scale);
      return {
        success: true,
        dataUrl,
        filename: `design-${w}x${h}.png`,
        mimeType: "image/png",
      };
    }

    if (format === "svg") {
      const svgString = renderSceneToSVG(sceneData);
      const base64 = Buffer.from(svgString, "utf8").toString("base64");
      const dataUrl = `data:image/svg+xml;base64,${base64}`;
      return {
        success: true,
        dataUrl,
        filename: "design.svg",
        mimeType: "image/svg+xml",
      };
    }

    if (format === "pdf") {
      const buffer = await renderSceneToPDF(sceneData);
      const base64 = buffer.toString("base64");
      const dataUrl = `data:application/pdf;base64,${base64}`;
      return {
        success: true,
        dataUrl,
        filename: "design.pdf",
        mimeType: "application/pdf",
      };
    }

    return { success: false, error: "Unsupported format" };
  } catch (error) {
    console.error("exportSceneToFile:", error);
    return { success: false, error: error instanceof Error ? error.message : "Export failed" };
  }
}
