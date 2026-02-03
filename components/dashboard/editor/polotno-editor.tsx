"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createStore } from "polotno/model/store";
import { PolotnoApp } from "polotno";
import "polotno/polotno.blueprint.css";
import { updateDesign } from "@/app/actions/design-actions";
import { uploadFile, dataUrlToFile } from "@/lib/utils/upload";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const SAVE_DEBOUNCE_MS = 2000;

interface PolotnoEditorProps {
  brandId: string;
  designId: string;
  designName?: string;
  /** Polotno store JSON (from design.polotnoJson) or our scene converted via sceneToPolotnoJson */
  initialJson: Record<string, unknown> | null;
}

function PolotnoEditorWithStore(props: PolotnoEditorProps) {
  const [store, setStore] = React.useState<ReturnType<typeof createStore> | null>(null);
  const key = process.env.NEXT_PUBLIC_POLOTNO_KEY ?? "";

  useEffect(() => {
    if (!key) return;
    const s = createStore({ key, showCredit: true });
    if (props.initialJson && Object.keys(props.initialJson).length > 0) {
      try {
        s.loadJSON(props.initialJson as any);
      } catch {
        if (!s.pages.length) s.addPage();
      }
    } else {
      s.addPage();
    }
    setStore(s);
    return () => setStore(null);
  }, [key, props.initialJson]);

  if (!key) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <p className="text-muted-foreground text-center max-w-md">
          Polotno editor requires an API key. Set <code className="bg-muted px-1 rounded">NEXT_PUBLIC_POLOTNO_KEY</code> in your environment (get a key at{" "}
          <a href="https://polotno.com/cabinet" target="_blank" rel="noopener noreferrer" className="text-primary underline">
            polotno.com/cabinet
          </a>
          ).
        </p>
        <Button asChild variant="outline">
          <Link href={`/dashboard/my-brands/${props.brandId}`}>Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <PolotnoEditorInner store={store} {...props} />;
}

function PolotnoEditorInner({
  store,
  brandId,
  designId,
  designName,
}: PolotnoEditorProps & { store: ReturnType<typeof createStore> }) {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveStatus, setSaveStatus] = React.useState<"saved" | "saving" | "unsaved">("saved");

  useEffect(() => {
    const saveToBackend = async (json: Record<string, unknown>) => {
      setSaveStatus("saving");
      let thumbnailUrl: string | undefined;
      try {
        const dataUrl = await store.toDataURL({ pixelRatio: 0.3, quickMode: true });
        const file = dataUrlToFile(dataUrl, `design-${designId}-thumb.png`);
        const uploadRes = await uploadFile(file, { brandId, category: "design-thumbnail" });
        if (uploadRes.success && uploadRes.url) thumbnailUrl = uploadRes.url;
      } catch (e) {
        console.warn("Thumbnail upload failed", e);
      }
      const result = await updateDesign(designId, {
        polotnoJson: json,
        ...(thumbnailUrl && { thumbnailUrl }),
      });
      if (!result.success) console.error("Polotno save failed:", result.error);
      setSaveStatus("saved");
    };

    const requestSave = () => {
      setSaveStatus("unsaved");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        try {
          saveToBackend(store.toJSON());
        } catch (e) {
          console.error("Polotno toJSON failed", e);
          setSaveStatus("saved");
        }
      }, SAVE_DEBOUNCE_MS);
    };

    const off = store.on("change", requestSave);
    return () => {
      off?.();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [store, designId, brandId]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center gap-2 px-3 py-2 border-b bg-card shrink-0">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/my-brands/${brandId}/my-designs`} aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <span className="font-medium truncate flex-1">{designName || "Design"}</span>
        <span className="text-xs text-muted-foreground shrink-0">
          {saveStatus === "saving" && "Saving…"}
          {saveStatus === "saved" && "Saved"}
          {saveStatus === "unsaved" && "Unsaved"}
        </span>
      </header>
      <div className="flex-1 min-h-0">
        <PolotnoApp store={store} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(PolotnoEditorWithStore), { ssr: false });
