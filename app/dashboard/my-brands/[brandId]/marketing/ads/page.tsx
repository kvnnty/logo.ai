"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Download, MousePointerClick } from "lucide-react";
import { useState, useEffect } from "react";
import { checkHistory } from "@/app/actions/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdsPage() {
  const [brandData, setBrandData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBrandData() {
      try {
        const history = await checkHistory();
        if (history && history.length > 0) {
          setBrandData(history[0]);
        }
      } catch (error) {
        console.error("Failed to fetch brand data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBrandData();
  }, []);

  const primaryColor = brandData?.primary_color || "#2563EB";
  const logoUrl = brandData?.image_url;

  const AdPreview = ({ size, label, width, height }: { size: string, label: string, width: number, height: number }) => (
    <div className="space-y-2">
      <div className="bg-gray-100 p-8 rounded-xl flex items-center justify-center overflow-auto">
        <div
          className="bg-white shadow-xl relative overflow-hidden group flex-shrink-0"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {/* Ad Content */}
          <div className="absolute inset-0 border-2 border-primary/20 flex flex-col items-center justify-center p-4 text-center">
            <div className="absolute -right-4 -top-4 w-12 h-12 rounded-full z-0 opacity-20" style={{ backgroundColor: primaryColor }} />
            <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full z-0 opacity-20" style={{ backgroundColor: primaryColor }} />

            <div className="relative z-10 w-full flex flex-col items-center gap-2">
              {logoUrl ? <img src={logoUrl} className="h-8 w-auto object-contain" alt="logo" /> : <div className="h-8 w-8 bg-gray-200 rounded" />}
              <div className="font-bold leading-tight">Boost Your<br />Sales Today</div>
              <Button size="sm" className="h-7 text-xs px-3 mt-1 pointer-events-none">
                Shop Now <MousePointerClick className="ml-1 w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <Button variant="secondary" size="sm">
              <Download className="mr-1 h-3 w-3" />
              PNG
            </Button>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm px-1">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground text-xs">{width}x{height}px</span>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        heading="Digital Ads"
        description="High-converting display ad templates for Google and social networks."
      />

      {loading ? (
        <div className="space-y-8">
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
      ) : (
        <Tabs defaultValue="display" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="display">Display Ads</TabsTrigger>
            <TabsTrigger value="social">Social Ads</TabsTrigger>
          </TabsList>

          <TabsContent value="display" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <AdPreview size="mrec" label="Medium Rectangle" width={300} height={250} />
              <AdPreview size="leaderboard" label="Leaderboard" width={728} height={90} />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <AdPreview size="skyscraper" label="Wide Skyscraper" width={160} height={600} />
              <AdPreview size="large-rect" label="Large Rectangle" width={336} height={280} />
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AdPreview size="fb-feed" label="Facebook Feed" width={300} height={300} /> {/* Scaled down for preview */}
              <AdPreview size="ig-story" label="Story Ad" width={270} height={480} />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
