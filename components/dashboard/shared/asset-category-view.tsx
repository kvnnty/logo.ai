"use client";


import { useState, useEffect, useCallback } from "react";
import { AssetCard } from "./asset-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { getBrandById, generateInteractiveAsset } from "@/app/actions/brand-actions";
import { downloadImage } from "@/app/actions/utils-actions";
import { getCredits } from "@/app/actions/credits-actions";
import { BrandCanvasEditor } from "../canvas/brand-canvas-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssetCategoryViewProps {
  brandId: string;
  category: string;
  title: string;
  description: string;
  aspectRatio?: "square" | "video" | "portrait";
}

export function AssetCategoryView({
  brandId,
  category,
  title,
  description,
  aspectRatio = "square"
}: AssetCategoryViewProps) {
  const [brandData, setBrandData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [activeEditorAsset, setActiveEditorAsset] = useState<{ sceneData: any, assetId: string } | null>(null);
  const [style, setStyle] = useState("minimal");
  const [format, setFormat] = useState("standard");
  const [credits, setCredits] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [brandResult, creditsResult] = await Promise.all([
        getBrandById(brandId),
        getCredits()
      ]);
      if (brandResult.success) {
        setBrandData(brandResult.brand);
      }
      if (creditsResult.remaining !== undefined) {
        setCredits(creditsResult.remaining);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerate = async () => {
    if (credits !== null && credits <= 0) {
      toast({
        title: "No credits left",
        description: "You’re out of credits. Please top up on the Credits page before generating new assets.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const baseLabel = title.endsWith("s") ? title.slice(0, -1) : title;
      const trimmedPrompt = prompt.trim();
      // Include style and format in the prompt context
      const enhancedPrompt = trimmedPrompt
        ? `${trimmedPrompt} (Style: ${style}, Format: ${format})`
        : undefined;
      const subType = trimmedPrompt
        ? `${baseLabel}: ${trimmedPrompt.slice(0, 60)}`
        : `New ${baseLabel}`;

      const result = await generateInteractiveAsset(
        brandId,
        category,
        subType,
        0,
        enhancedPrompt || undefined,
      );
      if (result.success && result.sceneData) {
        toast({ title: "Asset Generated!", description: `New design has been created.` });
        if (typeof (result as any).remainingCredits === "number") {
          setCredits((result as any).remainingCredits);
        } else {
          fetchData();
        }
        // Auto-open in editor with real assetId so save works
        const assetId = (result as any).assetId ?? "new";
        setActiveEditorAsset({ sceneData: result.sceneData, assetId });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl: string, id: string) => {
    setDownloading(id);
    try {
      const result = await downloadImage(imageUrl);
      if (result.success && result.data) {
        const a = document.createElement("a");
        a.href = result.data;
        a.download = `${category}-${id}.webp`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to download.", variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  };

  const handleOpenEditor = (asset: any) => {
    if (asset.sceneData) {
      setActiveEditorAsset({ sceneData: asset.sceneData, assetId: asset._id });
    } else {
      toast({
        title: "No Scene Data",
        description: "This asset is a static image and cannot be edited in the canvas.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
        </div>
        <div className="max-w-3xl mx-auto mb-6">
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <Skeleton className="h-12 w-full mb-4" />
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!brandData) return <div className="p-8 text-center">Brand not found.</div>;

  const primaryColor = brandData.identity?.primary_color || "#2563eb";

  // Designs for this category come from Design collection (passed or empty)
  const categoryAssets = (Array.isArray((brandData as any).designs) ? (brandData as any).designs : [])
    .filter((a: any) => {
      const name = (a.name || "").toLowerCase();
      const cat = category.toLowerCase();
      return name.includes(cat) || (a.source || "").toLowerCase().includes(cat);
    });

  const brandName = brandData?.name || "your brand";
  const secondaryColor = brandData?.identity?.secondary_color || primaryColor;
  const logoUrl =
    (brandData as any).primaryLogoUrl ??
    (() => {
      const logos = (brandData as any).logos || [];
      const primary = logos.find((a: any) => a.isPrimary || a.subType === "primary_logo") ?? logos[0];
      return primary?.image_url ?? primary?.imageUrl ?? null;
    })();

  return (
    <div className="pb-12">
      {/* Centered heading - match brand dashboard */}
      <h2 className="text-xl text-center font-bold">What do you want to create for {brandName}?</h2>
      <p className="text-muted-foreground text-sm max-w-2xl mx-auto text-center mt-2 leading-relaxed">
        Choose what to create, add a short description, and we&apos;ll generate a template you can customize in the editor.
      </p>

      {/* Main prompt card - same layout and styles as brand dashboard */}
      <div className="max-w-4xl mx-auto space-y-4 mt-4">
        <div className="bg-card border focus-within:border-primary rounded-2xl p-6 shadow-sm">
          {/* Prompt textarea with Generate button */}
          <div className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g. Bold red flyer for summer sale, minimal business card with geometric shapes, social cover with logo centered"
              className="w-full min-h-[88px] resize-y rounded-none border-none outline-none focus-visible:ring-0 p-0 shadow-none"
            />
            <div className="flex justify-between items-start">
              <div className="flex flex-wrap gap-3 items-center">
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="w-fit rounded border border-primary bg-primary/10 text-primary focus:ring-0">
                    <SelectValue placeholder="Style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="elegant">Elegant</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="w-fit rounded border border-primary bg-primary/10 text-primary focus:ring-0">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard {title}</SelectItem>
                    <SelectItem value="instagram-post">Instagram Post</SelectItem>
                    <SelectItem value="facebook-post">Facebook Post</SelectItem>
                    <SelectItem value="twitter-post">Twitter Post</SelectItem>
                    <SelectItem value="linkedin-post">LinkedIn Post</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || (credits !== null && credits <= 0)}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          {credits !== null && (
            <>
              <Sparkles className="w-3 h-3 inline-block mr-1 align-middle" />
              {credits} credits · 1 per generation
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {categoryAssets.map((asset: any) => {
          // If asset has sceneData but no imageUrl, we need to render it
          // For now, show a placeholder or generate preview
          const displayImageUrl = asset.imageUrl || (asset.sceneData ? null : "/placeholder-asset.png");

          return (
            <AssetCard
              key={asset._id}
              title={asset.subType?.replace("_", " ") || "Brand Asset"}
              description={asset.prompt}
              imageUrl={displayImageUrl}
              aspectRatio={aspectRatio}
              onDownload={() => handleDownload(asset.imageUrl, asset._id)}
              onEdit={() => handleOpenEditor(asset)}
              onAction={() => handleOpenEditor(asset)}
              actionLabel="Customize"
              downloading={downloading === asset._id}
            />
          );
        })}

        {categoryAssets.length === 0 && !isGenerating && (
          <div className="col-span-full border-2 border-dashed rounded-3xl p-20 text-center bg-muted/20">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No assets yet</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Ready to bring your brand to life? Generate your first interactive {title.toLowerCase()} now.
            </p>
            <Button onClick={handleGenerate} size="lg" className="rounded-full shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </div>
        )}
      </div>

      {activeEditorAsset && (
        <BrandCanvasEditor
          initialScene={activeEditorAsset.sceneData}
          brandId={brandId}
          assetId={activeEditorAsset.assetId}
          onClose={() => {
            setActiveEditorAsset(null);
            fetchData(); // Refresh to catch any updates (like image previews if implemented)
          }}
        />
      )}

      {isGenerating && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 border-4 border-primary/30 border-t-primary animate-spin rounded-full mb-6" />
          <h2 className="text-2xl font-bold mb-2">AI is Designing Your Canvas</h2>
          <p className="text-muted-foreground max-w-sm">
            We're arranging layouts, typography, and generating custom visuals...
          </p>
        </div>
      )}
    </div>
  );
}
