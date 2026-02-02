import { NextRequest, NextResponse } from "next/server";

const POLOTNO_UNSPLASH_URL = "https://api.polotno.com/api/get-unsplash";

export async function GET(request: NextRequest) {
  const key = process.env.POLOTNO_UNSPLASH_KEY;
  if (!key) {
    return NextResponse.json({ error: "Unsplash API key not configured (POLOTNO_UNSPLASH_KEY)" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? "";
  const perPage = Math.min(Number(searchParams.get("per_page")) || 20, 30);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const url = new URL(POLOTNO_UNSPLASH_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("page", String(page));
  url.searchParams.set("KEY", key);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text || `Unsplash API error: ${res.status}` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("Unsplash proxy error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to fetch Unsplash" }, { status: 500 });
  }
}
