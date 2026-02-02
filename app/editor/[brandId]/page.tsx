"use client";

import { createDesign } from "@/app/actions/design-actions";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { polotnoTemplateToScene } from "@/lib/polotno-template";

/** New design: create a design doc (blank or from templateUrl) and redirect to editor/[designId]. */
export default function NewEditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandId = params?.brandId as string;
  const templateUrl = searchParams.get("templateUrl");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandId) return;
    let cancelled = false;
    (async () => {
      let initialScene: { width: number; height: number; elements: any[] } | undefined;
      if (templateUrl) {
        try {
          const decoded = decodeURIComponent(templateUrl);
          const res = await fetch(decoded);
          if (!res.ok) throw new Error(`Template fetch failed: ${res.status}`);
          const template = await res.json();
          initialScene = polotnoTemplateToScene(template);
        } catch (e) {
          if (cancelled) return;
          setError(e instanceof Error ? e.message : "Failed to load template");
          return;
        }
      }
      const result = await createDesign(brandId, initialScene ? { initialScene } : undefined);
      if (cancelled) return;
      if (result.success && result.designId) {
        router.replace(`/editor/${brandId}/${result.designId}`);
      } else {
        setError(result.error || "Failed to create design");
      }
    })();
    return () => { cancelled = true; };
  }, [brandId, router, templateUrl]);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Creating design…</p>
    </div>
  );
}
