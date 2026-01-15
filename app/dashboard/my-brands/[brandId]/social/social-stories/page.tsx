"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Download, Video, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { checkHistory } from "@/app/actions/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SocialStoriesPage() {
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
  const bg = brandData?.background_color || "#FFFFFF";

  const StoryPreview = ({ style }: { style: 'promo' | 'qa' }) => (
    <div className="w-full bg-gray-100 p-4 rounded-xl flex justify-center">
      {/* Story Ratio 9:16 */}
      <div className="bg-white w-full max-w-[280px] aspect-[9/16] shadow-2xl relative flex flex-col overflow-hidden group rounded-xl">
        {style === 'promo' && (
          <div className="h-full relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gray-900 text-white">
              <div className="absolute inset-0 opacity-20" style={{ backgroundColor: primaryColor }} />
              {logoUrl && <img src={logoUrl} className="w-20 h-20 object-contain mb-8 brightness-0 invert" alt="logo" />}
              <h2 className="text-3xl font-bold uppercase tracking-widest mb-2">Flash<br />Sale</h2>
              <div className="bg-white text-black px-4 py-1 font-bold text-sm my-4 rounded-full">Coming Soon</div>
              <div className="absolute bottom-12 w-full px-8">
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {style === 'qa' && (
          <div className="h-full relative flex flex-col p-6 items-center" style={{ backgroundColor: bg }}>
            <div className="w-full flex justify-between items-center mb-12">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="text-xs text-gray-500">Sponsored</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg w-full text-center mb-8 relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-gray-100">
                {logoUrl ? <img src={logoUrl} className="w-full h-full object-cover" alt="logo" /> : null}
              </div>
              <p className="text-sm font-medium mt-4 pt-2">Ask me anything about brand automation!</p>
              <div className="mt-4 bg-gray-100 py-2 px-4 rounded-full text-xs text-gray-400 text-left">Type something...</div>
            </div>

            <div className="flex-1 w-full bg-cover bg-center rounded-xl opacity-80" style={{ backgroundImage: logoUrl ? `url(${logoUrl})` : 'none' }} />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <Button variant="secondary" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Story
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <PageHeader
        heading="Social Stories"
        description="Engaging story templates for Instagram, TikTok, and Snapchat."
      />

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[500px] w-full rounded-xl" />
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-2 text-center">
            <StoryPreview style="promo" />
            <h3 className="font-semibold mt-4">Promo Teaser</h3>
          </div>
          <div className="space-y-2 text-center">
            <StoryPreview style="qa" />
            <h3 className="font-semibold mt-4">Q&A Session</h3>
          </div>
        </div>
      )}
    </div>
  );
}
