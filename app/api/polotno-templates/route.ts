import { NextRequest, NextResponse } from "next/server";

const POLOTNO_GET_TEMPLATES_URL = "https://api.polotno.com/api/get-templates";

export const dynamic = "force-dynamic";

/**
 * GET /api/polotno-templates
 * Proxies Polotno get-templates API. Supports:
 * - page: pagination (default 1)
 * - query: text search (e.g. "youtube", "birthday", "fitness", "instagram story")
 */
export async function GET(request: NextRequest) {
  const key = process.env.POLOTNO_API_KEY || process.env.POLOTNO_UNSPLASH_KEY;
  if (!key) {
    return NextResponse.json({ error: "Templates API key not configured (POLOTNO_API_KEY)" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const query = searchParams.get("query")?.trim() || "";

  const url = new URL(POLOTNO_GET_TEMPLATES_URL);
  url.searchParams.set("key", key);
  url.searchParams.set("page", String(page));
  if (query) url.searchParams.set("query", query);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text || `Templates API error: ${res.status}` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("Polotno templates proxy error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to fetch templates" }, { status: 500 });
  }
}
