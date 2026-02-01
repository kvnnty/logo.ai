import { NextResponse } from "next/server";
import { ensureDbConnected, Brand } from "@/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug?.trim()) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }
    await ensureDbConnected();
    const brand = await Brand.findOne({ slug: slug.trim().toLowerCase() });
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }
    brand.pageViewCount = (brand.pageViewCount ?? 0) + 1;
    brand.pageLastViewedAt = new Date();
    await brand.save();
    return NextResponse.json({ ok: true, count: brand.pageViewCount });
  } catch (error) {
    console.error("Brand view record error:", error);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
