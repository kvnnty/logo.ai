"use client";

import { createDesign } from "@/app/actions/design-actions";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/** New design: create a design doc and redirect to editor/[designId]. */
export default function NewEditorPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = params?.brandId as string;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandId) return;
    let cancelled = false;
    (async () => {
      const result = await createDesign(brandId);
      if (cancelled) return;
      if (result.success && result.designId) {
        router.replace(`/dashboard/my-brands/${brandId}/editor/${result.designId}`);
      } else {
        setError(result.error || "Failed to create design");
      }
    })();
    return () => { cancelled = true; };
  }, [brandId, router]);

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
