"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Instagram, Linkedin, Twitter, Facebook } from "lucide-react";
import { useState, useEffect } from "react";
import { checkHistory, downloadImage } from "@/app/actions/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { AssetCard } from "@/components/dashboard/shared/asset-card";
import { toast } from "@/hooks/use-toast";

export default function SocialPostsPage() {
  const [brandData, setBrandData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

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

  const handleDownload = async (imageUrl: string, platform: string) => {
    setDownloading(platform);
    try {
      const result = await downloadImage(imageUrl);
      if (result.success && result.data) {
        const a = document.createElement("a");
        a.href = result.data;
        a.download = `${platform}-post.png`; // In real app, we'd render the HTML to canvas then download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast({ title: "Download started", description: "Your image is being downloaded." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to download.", variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  }

  // fallback logo
  const logoUrl = brandData?.image_url || "/placeholder-logo.png";
  const primaryColor = brandData?.primary_color || "#2563EB";
  const bg = brandData?.background_color || "#FFFFFF";

  return (
    <div>
      <PageHeader
        heading="Social Media Posts"
        description="Engaging social media templates tailored to your brand."
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="aspect-square rounded-xl" />
          <Skeleton className="aspect-square rounded-xl" />
          <Skeleton className="aspect-square rounded-xl" />
        </div>
      ) : (
        <Tabs defaultValue="instagram" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="instagram" className="flex items-center gap-2"><Instagram className="w-4 h-4" /> Instagram</TabsTrigger>
            <TabsTrigger value="linkedin" className="flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</TabsTrigger>
            <TabsTrigger value="twitter" className="flex items-center gap-2"><Twitter className="w-4 h-4" /> Twitter / X</TabsTrigger>
            <TabsTrigger value="facebook" className="flex items-center gap-2"><Facebook className="w-4 h-4" /> Facebook</TabsTrigger>
          </TabsList>

          {/* Instagram Key Content */}
          <TabsContent value="instagram" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Template 1: Minimal Logo */}
              <AssetCard
                title="Brand Spotlight"
                description="Minimalist logo showcase"
                imageUrl={logoUrl} // Ideally these would be generated compositions
                aspectRatio="square"
                onDownload={() => handleDownload(logoUrl, 'ig-spotlight')}
                downloading={downloading === 'ig-spotlight'}
                className="bg-card"
              />
              {/* Template 2: Color Background */}
              <div className="relative group overflow-hidden rounded-xl border aspect-square">
                <div className="absolute inset-0 flex items-center justify-center p-12" style={{ backgroundColor: primaryColor }}>
                  <img src={logoUrl} className="w-full h-full object-contain brightness-0 invert" alt="Post" />
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" onClick={() => handleDownload(logoUrl, 'ig-bold')}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Template 3: Pattern */}
              <div className="relative group overflow-hidden rounded-xl border aspect-square">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(${primaryColor} 2px, transparent 2px)`, backgroundSize: '20px 20px' }} />
                  <img src={logoUrl} className="w-1/2 h-1/2 object-contain shadow-2xl rounded-xl bg-white p-4" alt="Post" />
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" onClick={() => handleDownload(logoUrl, 'ig-pattern')}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* LinkedIn */}
          <TabsContent value="linkedin" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="relative group overflow-hidden rounded-xl border aspect-[4/5]">
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
                  <img src={logoUrl} className="w-24 h-24 object-contain mb-8 brightness-0 invert" alt="Post" />
                  <h3 className="text-2xl font-bold mb-4">We Are Hiring</h3>
                  <p className="text-gray-400">Join our team of innovators.</p>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" onClick={() => handleDownload(logoUrl, 'li-hiring')}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
