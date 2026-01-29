"use client";


import { useState, useEffect, useCallback } from "react";
import { AssetCard } from "./asset-card";
import { TemplatePreviewCard } from "./template-preview-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Plus, Paperclip, ArrowRight } from "lucide-react";
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

  // Find generated assets for this category
  const categoryAssets = (Array.isArray(brandData.assets) ? brandData.assets : [])
    .filter((a: any) => {
      // Loose matching for categories
      const catMatch = a.category?.toLowerCase() === category.toLowerCase() ||
        a.category?.includes(category.toLowerCase()) ||
        category.toLowerCase().includes(a.category?.toLowerCase() || "");
      return catMatch;
    });

  const brandName = brandData?.name || "your brand";

  return (
    <div className="pb-12">
      {/* Centered heading */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          What do you want to create for {brandName}?
        </h2>
      </div>

      {/* Main prompt card - centered with max width */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          {/* Prompt textarea with Generate button */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Paperclip className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g. Ski jacket sale this weekend"
                className="pl-10 pr-4 pt-3 pb-3 min-h-[80px] text-base rounded-lg border-2 resize-y"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || (credits !== null && credits <= 0)}
                className="h-11 px-6 bg-primary hover:bg-primary/90 rounded-full shadow-md"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Style and Format dropdowns */}
          <div className="flex gap-3">
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="w-full rounded-lg border-2 h-10">
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
              <SelectTrigger className="w-full rounded-lg border-2 h-10">
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

          {/* Credits display */}
          {credits !== null && (
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {credits} {credits === 1 ? "Credit" : "Credits"} Remaining
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {/* Show template previews first if no assets exist */}
        {categoryAssets.length === 0 && (
          <>
            {[0, 1, 2].map((i) => (
              <TemplatePreviewCard
                key={`template-${i}`}
                category={category}
                primaryColor={primaryColor}
                onClick={handleGenerate}
              />
            ))}
          </>
        )}

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
