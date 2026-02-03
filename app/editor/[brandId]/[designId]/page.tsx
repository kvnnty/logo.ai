"use client";

import { getDesign } from "@/app/actions/design-actions";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { sceneToPolotnoJson } from "@/lib/polotno-template";

const PolotnoEditor = dynamic(
  () => import("@/components/dashboard/editor/polotno-editor"),
  { ssr: false }
);

export default function EditorDesignPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = params?.brandId as string;
  const designId = params?.designId as string;
  const [design, setDesign] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!designId || !brandId) return;
    let cancelled = false;
    (async () => {
      const result = await getDesign(designId);
      if (cancelled) return;
      if (result.success && result.design) {
        setDesign(result.design);
      } else {
        setError(result.error || "Design not found");
      }
    })();
    return () => { cancelled = true; };
  }, [designId, brandId]);

  const initialJson = useMemo(() => {
    if (!design) return null;
    if (design.polotnoJson && Object.keys(design.polotnoJson).length > 0) {
      return design.polotnoJson;
    }
    const firstPage = design.pages?.[0];
    const sceneData = firstPage?.sceneData;
    if (sceneData && sceneData.width != null && sceneData.elements) {
      return sceneToPolotnoJson(sceneData);
    }
    return null;
  }, [design]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-destructive">{error}</p>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/my-brands/${brandId}`)}
          className="text-sm text-primary hover:underline"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading design…</p>
      </div>
    );
  }

  return (
    <PolotnoEditor
      brandId={brandId}
      designId={designId}
      designName={design.name}
      initialJson={initialJson}
    />
  );
}
