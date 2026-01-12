"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import { checkHistory } from "@/app/actions/actions";
import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessCardsPage() {
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

  const BusinessCardMockup = ({ layout }: { layout: 'minimal' | 'bold' | 'qr' }) => (
    <div className="relative w-full aspect-[1.75/1] rounded-xl shadow-2xl overflow-hidden bg-white group hover:scale-[1.02] transition-transform duration-300">
      {/* Front */}
      <div className="absolute inset-0 flex flex-col p-8">
        {layout === 'minimal' && (
          <div className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
              ) : (
                <div className="h-12 w-12 bg-gray-200 rounded-full" />
              )}
              <div className="text-right">
                <div className="font-bold text-lg text-gray-900">John Doe</div>
                <div className="text-sm text-gray-500">Founder & CEO</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>john@example.com</div>
              <div>+1 (555) 123-4567</div>
              <div>www.example.com</div>
            </div>
            <div className="h-1 w-full" style={{ backgroundColor: primaryColor }} />
          </div>
        )}

        {layout === 'bold' && (
          <div className="h-full flex">
            <div className="w-1/3 h-full flex items-center justify-center p-4" style={{ backgroundColor: primaryColor }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-16 w-auto object-contain brightness-0 invert" />
              ) : (
                <div className="h-16 w-16 bg-white/20 rounded-full" />
              )}
            </div>
            <div className="w-2/3 h-full flex flex-col justify-center p-8 bg-gray-50">
              <div className="font-bold text-xl text-gray-900 mb-1">John Doe</div>
              <div className="text-sm text-primary font-medium mb-6 uppercase tracking-wider" style={{ color: primaryColor }}>Founder & CEO</div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>123 Business Rd, Tech City</div>
                <div>john@example.com</div>
                <div>www.example.com</div>
              </div>
            </div>
          </div>
        )}

        {layout === 'qr' && (
          <div className="h-full flex flex-col items-center justify-center text-center bg-gray-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-20" style={{ backgroundColor: primaryColor }} />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-tr-full opacity-20" style={{ backgroundColor: primaryColor }} />

            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-16 w-auto object-contain mb-4 brightness-0 invert" />
            ) : (
              <div className="h-12 w-12 bg-white/20 rounded-full mb-4" />
            )}
            <div className="font-bold text-xl">John Doe</div>
            <div className="text-gray-400 text-sm mb-6">Founder & CEO</div>
            <div className="bg-white p-2 rounded-lg">
              <div className="w-16 h-16 bg-gray-900 rounded flex items-center justify-center text-[8px] text-gray-500">QR CODE</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <PageHeader
        heading="Business Cards"
        description="Professional business card templates ready for print."
      />

      {loading ? (
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="w-full aspect-[1.75/1] rounded-xl" />
          <Skeleton className="w-full aspect-[1.75/1] rounded-xl" />
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="minimal">Minimal</TabsTrigger>
            <TabsTrigger value="creative">Creative</TabsTrigger>
          </TabsList>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <BusinessCardMockup layout="minimal" />
              <div className="flex justify-between items-center px-2">
                <div>
                  <div className="font-semibold">Clean Minimal</div>
                  <div className="text-sm text-muted-foreground">Standard 3.5" x 2"</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Palette className="w-4 h-4 mr-2" />
                    Customize
                  </Button>
                  <Button size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <BusinessCardMockup layout="bold" />
              <div className="flex justify-between items-center px-2">
                <div>
                  <div className="font-semibold">Bold Split</div>
                  <div className="text-sm text-muted-foreground">Standard 3.5" x 2"</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Palette className="w-4 h-4 mr-2" />
                    Customize
                  </Button>
                  <Button size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <BusinessCardMockup layout="qr" />
              <div className="flex justify-between items-center px-2">
                <div>
                  <div className="font-semibold">Modern Digital</div>
                  <div className="text-sm text-muted-foreground">Standard 3.5" x 2"</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Palette className="w-4 h-4 mr-2" />
                    Customize
                  </Button>
                  <Button size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Tabs>
      )}
    </div>
  );
}
