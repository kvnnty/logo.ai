"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { checkHistory } from "@/app/actions/actions";
import { Skeleton } from "@/components/ui/skeleton";

export default function YoutubeThumbnailsPage() {
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

  const ThumbnailPreview = ({ style }: { style: 'review' | 'tutorial' }) => (
    <div className="w-full bg-gray-100 p-4 rounded-xl flex justify-center">
      {/* Aspect Ratio 16:9 */}
      <div className="bg-white w-full max-w-[400px] aspect-video shadow-2xl relative flex flex-col overflow-hidden group rounded-xl">
        {style === 'review' && (
          <div className="h-full relative bg-gray-900 border-4 border-white">
            <div className="absolute inset-0 opacity-50 bg-gradient-to-tr from-black to-transparent" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white opacity-10 -skew-x-12 transform translate-x-12" />

            <div className="relative z-10 h-full flex flex-col justify-center p-8">
              <div className="bg-yellow-400 text-black text-xs font-black uppercase px-2 py-1 self-start transform -rotate-2 mb-2">Honest Review</div>
              <h2 className="text-4xl font-black text-white leading-none mb-4 italic">IS IT<br /><span style={{ color: primaryColor }}>WORTH IT?</span></h2>
              {logoUrl && <img src={logoUrl} className="w-16 h-16 object-contain bg-white rounded-lg p-2 absolute bottom-4 right-4 shadow-lg transform rotate-3" alt="logo" />}
            </div>
          </div>
        )}

        {style === 'tutorial' && (
          <div className="h-full relative bg-white">
            <div className="absolute inset-0 flex">
              <div className="w-2/3 h-full bg-gray-100 relative overflow-hidden">
                {/* Dummy Screenshot background */}
                <div className="absolute inset-0 grid grid-cols-4 gap-4 opacity-10 p-4">
                  <div className="bg-gray-400 rounded h-20 col-span-2" />
                  <div className="bg-gray-400 rounded h-20 col-span-2" />
                  <div className="bg-gray-400 rounded h-full col-span-4" />
                </div>
              </div>
              <div className="w-1/3 h-full flex items-center justify-center p-4 bg-gray-50 border-l border-gray-200">
                {logoUrl ? <img src={logoUrl} className="w-full object-contain" alt="logo" /> : <div className="w-16 h-16 bg-gray-200 rounded-full" />}
              </div>
            </div>

            <div className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/90 p-4 rounded-lg shadow-xl backdrop-blur-sm border-2" style={{ borderColor: primaryColor }}>
              <h2 className="text-2xl font-bold leading-tight">Step-by-Step<br />Tutorial</h2>
              <div className="flex items-center gap-2 mt-2 text-xs font-semibold uppercase text-gray-500">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live Demo
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <Button variant="secondary" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download JPG
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <PageHeader
        heading="YouTube Thumbnails"
        description="High-CTR templates optimized for YouTube."
      />

      {loading ? (
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="aspect-video w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2 text-center">
            <ThumbnailPreview style="review" />
            <h3 className="font-semibold mt-4">Review / Reaction</h3>
          </div>
          <div className="space-y-2 text-center">
            <ThumbnailPreview style="tutorial" />
            <h3 className="font-semibold mt-4">Educational / Tutorial</h3>
          </div>
        </div>
      )}
    </div>
  );
}
