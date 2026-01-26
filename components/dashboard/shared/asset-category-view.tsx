"use client";


import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "./page-header";
import { AssetCard } from "./asset-card";
import { TemplatePreviewCard } from "./template-preview-card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { getBrandById, generateInteractiveAsset, downloadImage } from "@/app/actions/actions";
import { BrandCanvasEditor } from "../canvas/brand-canvas-editor";

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
  const [downloading, setDownloading] = useState<string | null>(null);
  const [activeEditorAsset, setActiveEditorAsset] = useState<{ sceneData: any, assetId: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const result = await getBrandById(brandId);
      if (result.success) {
        setBrandData(result.brand);
      }
    } catch (error) {
      console.error("Failed to fetch brand data", error);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // For general generation, we just use a default subType or ask user. 
      // For now, let's just use "New Design".
      const subType = `New ${title.slice(0, -1)}`;
      const result = await generateInteractiveAsset(brandId, category, subType);
      if (result.success && result.sceneData) {
        toast({ title: "Asset Generated!", description: `New design has been created.` });
        fetchData();
        // Auto-open in editor
        setActiveEditorAsset({ sceneData: result.sceneData, assetId: "new" });
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
        <PageHeader heading={title} description={description} />
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

  return (
    <div className="pb-12">
      <div className="flex items-end justify-between gap-4">
        <PageHeader heading={title} description={description} className="flex-1" />
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-primary hover:bg-primary/90 shadow-lg"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Generate New Variant
        </Button>
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
