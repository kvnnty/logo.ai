"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Linkedin, Twitter, Facebook, Youtube } from "lucide-react";
import { useState, useEffect } from "react";
import { checkHistory, downloadImage } from "@/app/actions/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export default function SocialCoversPage() {
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

  const logoUrl = brandData?.image_url;
  const primaryColor = brandData?.primary_color || "#2563EB";

  const CoverPreview = ({ platform }: { platform: 'linkedin' | 'twitter' | 'facebook' | 'youtube' }) => {
    let aspectRatio = "aspect-[4/1]"; // default LinkedIn/Twitter-ish
    if (platform === 'facebook') aspectRatio = "aspect-[2.7/1]";
    if (platform === 'youtube') aspectRatio = "aspect-[16/9]"; // Channel art is huge but verified area is smaller

    return (
      <div className={`w-full bg-gray-100 rounded-xl overflow-hidden relative group ${aspectRatio}`}>
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-between px-12">
          <div className="text-white space-y-2 z-10">
            <h2 className="text-3xl font-bold tracking-tight">Innovation Starts Here</h2>
            <p className="text-gray-400">Building the future of technology.</p>
            <div className="h-1 w-24 mt-4" style={{ backgroundColor: primaryColor }} />
          </div>

          <div className="opacity-20 absolute right-0 top-0 h-full w-1/2"
            style={{ backgroundImage: `linear-gradient(135deg, ${primaryColor} 0%, transparent 100%)` }}
          />

          {logoUrl && (
            <img src={logoUrl} className="h-1/2 w-auto object-contain z-10 brightness-0 invert opacity-50" alt="Logo" />
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Download {platform.charAt(0).toUpperCase() + platform.slice(1)} Cover
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        heading="Social Covers & Headers"
        description="Make a great first impression with custom profile banners."
      />

      {loading ? (
        <Skeleton className="w-full aspect-[4/1] rounded-xl" />
      ) : (
        <Tabs defaultValue="linkedin" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="linkedin" className="flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</TabsTrigger>
            <TabsTrigger value="twitter" className="flex items-center gap-2"><Twitter className="w-4 h-4" /> Twitter / X</TabsTrigger>
            <TabsTrigger value="facebook" className="flex items-center gap-2"><Facebook className="w-4 h-4" /> Facebook</TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2"><Youtube className="w-4 h-4" /> YouTube</TabsTrigger>
          </TabsList>

          <TabsContent value="linkedin" className="space-y-4">
            <CoverPreview platform="linkedin" />
            <p className="text-sm text-muted-foreground text-center">Recommended size: 1584 x 396 px</p>
          </TabsContent>
          <TabsContent value="twitter" className="space-y-4">
            <CoverPreview platform="twitter" />
            <p className="text-sm text-muted-foreground text-center">Recommended size: 1500 x 500 px</p>
          </TabsContent>
          <TabsContent value="facebook" className="space-y-4">
            <CoverPreview platform="facebook" />
            <p className="text-sm text-muted-foreground text-center">Recommended size: 820 x 312 px</p>
          </TabsContent>
          <TabsContent value="youtube" className="space-y-4">
            <div className="max-w-4xl mx-auto">
              <CoverPreview platform="youtube" />
            </div>
            <p className="text-sm text-muted-foreground text-center">Recommended size: 2560 x 1440 px</p>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
