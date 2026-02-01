"use client";

import { getDesign } from "@/app/actions/design-actions";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EditorShell } from "@/components/dashboard/editor/editor-shell";
import { Loader2 } from "lucide-react";

export default function EditorDesignPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandId = params?.brandId as string;
  const designId = params?.designId as string;
  const pageParam = searchParams.get("page");
  const templateParam = searchParams.get("template");
  const initialPage = pageParam ? Math.max(0, parseInt(pageParam, 10) || 0) : undefined;
  const [design, setDesign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!loading) setLoading(false);
  }, [design, error]);

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
    <EditorShell
      brandId={brandId}
      designId={designId}
      initialDesign={design}
      initialPage={initialPage}
      templateId={templateParam ?? undefined}
    />
  );
}
