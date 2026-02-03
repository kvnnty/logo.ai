import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ensureDbConnected, Design } from "@/db";
import { renderSceneToPNG } from "@/lib/render/scene-renderer";
import { polotnoTemplateToScene } from "@/lib/polotno-template";

const THUMBNAIL_SCALE = 0.25;

/** GET /api/designs/[designId]/thumbnail - returns PNG preview for a design (auth required). */
export async function GET(request: NextRequest, context: { params: Promise<{ designId: string }> }) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse(null, { status: 401 });
    }

    const { designId } = await context.params;
    if (!designId) {
      return new NextResponse(null, { status: 400 });
    }

    await ensureDbConnected();
    const design = await Design.findOne({ _id: designId, userId: user.id }).lean();
    if (!design) {
      return new NextResponse(null, { status: 404 });
    }

    const d = design as any;
    let scene: { width: number; height: number; elements: any[] } | null = null;

    const firstPage = d.pages?.[0];
    if (firstPage?.sceneData?.width != null && Array.isArray(firstPage.sceneData?.elements)) {
      scene = firstPage.sceneData;
    } else if (d.polotnoJson && (d.polotnoJson.width != null || d.polotnoJson.pages?.length)) {
      try {
        scene = polotnoTemplateToScene(d.polotnoJson);
      } catch {
        // ignore
      }
    }

    if (!scene || !scene.elements?.length) {
      return new NextResponse(null, { status: 404 });
    }

    const buffer = await renderSceneToPNG(scene, THUMBNAIL_SCALE, { transparent: false });
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    console.error("Design thumbnail error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
