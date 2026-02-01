"use client";

import { useEffect, useRef } from "react";

export default function RecordBrandView({ slug }: { slug: string }) {
  const recorded = useRef(false);
  useEffect(() => {
    if (!slug || recorded.current) return;
    recorded.current = true;
    fetch(`/api/brand/${encodeURIComponent(slug)}/view`, { method: "POST" }).catch(() => { });
  }, [slug]);

  return null;
}