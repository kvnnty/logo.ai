"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "./page-header";
import { AssetCard } from "./asset-card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { getBrandById, generateBrandAsset, downloadImage } from "@/app/actions/actions";
import { Card, CardContent } from "@/components/ui/card";

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
  const [brand, setBrand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const result = await getBrandById(brandId);
      if (result.success) {
        setBrand(result.brand);
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

  const handleGenerate = async (subType: string) => {
    setGeneratingId(subType);
    try {
      const result = await generateBrandAsset(brandId, category, subType);
      if (result.success) {
        toast({ title: "Asset Generated!", description: `New ${subType} has been created.` });
        fetchData(); // Refresh to show new asset
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
      setGeneratingId(null);
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

  if (!brand) return <div className="p-8 text-center">Brand not found.</div>;

  // Filter blueprints for this category
  const categoryBlueprints = (Array.isArray(brand.blueprints) ? brand.blueprints : []).filter((b: any) => b.category === category);

  // Find generated assets for this category
  const categoryAssets = (Array.isArray(brand.assets) ? brand.assets : []).filter((a: any) => a.category === category);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader heading={title} description={description} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryBlueprints.map((blueprint: any, index: number) => {
          // Check if this specific blueprint has been generated
          const generatedAsset = categoryAssets.find((a: any) => a.subType === blueprint.subType);

          if (generatedAsset) {
            return (
              <AssetCard
                key={blueprint.subType}
                title={blueprint.subType.replace("_", " ")}
                description={blueprint.prompt}
                imageUrl={generatedAsset.imageUrl}
                aspectRatio={aspectRatio}
                onDownload={() => handleDownload(generatedAsset.imageUrl, blueprint.subType)}
                downloading={downloading === blueprint.subType}
              />
            );
          }

          return (
            <Card key={blueprint.subType} className="border-dashed border-2 flex flex-col items-center justify-center p-6 text-center group hover:border-primary/50 transition-colors bg-white shadow-none rounded-2xl">
              <div className="mb-4 p-4 rounded-xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm capitalize mb-1">{blueprint.subType.replace("_", " ")}</h3>
              <p className="text-[10px] text-muted-foreground mb-4 line-clamp-2 px-4 italic leading-relaxed">
                {blueprint.prompt}
              </p>
              <Button
                onClick={() => handleGenerate(blueprint.subType)}
                disabled={generatingId === blueprint.subType}
                className="w-full h-9 text-xs rounded-xl"
                variant="secondary"
              >
                {generatingId === blueprint.subType ? (
                  <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 mr-2" />
                )}
                Generate Item
              </Button>
            </Card>
          );
        })}

        {categoryBlueprints.length === 0 && (
          <div className="col-span-full border-2 border-dashed rounded-2xl p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No blueprints found</h3>
            <p className="text-muted-foreground">
              Try refreshing your brand strategy to generate new asset blueprints.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
