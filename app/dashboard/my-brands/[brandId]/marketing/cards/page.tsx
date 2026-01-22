"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { checkHistory } from "@/app/actions/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CardsPage() {
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

  const CardPreview = ({ type }: { type: 'thankyou' | 'greeting' }) => (
    <div className="w-full bg-gray-100 p-4 rounded-xl flex justify-center">
      {/* Card Ratio 5:7 approx */}
      <div className="bg-white w-full max-w-[350px] aspect-[5/3.5] shadow-xl relative flex flex-col items-center justify-center p-8 text-center group overflow-hidden">
        {type === 'thankyou' && (
          <>
            <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: primaryColor }} />
            <h2 className="text-3xl font-serif italic mb-4 text-gray-800">Thank You</h2>
            <p className="text-sm text-gray-500 max-w-[200px] mb-6">For being a valued part of our journey.</p>
            {logoUrl && <img src={logoUrl} className="h-8 w-auto opacity-50 grayscale" alt="logo" />}
          </>
        )}
        {type === 'greeting' && (
          <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle, ${primaryColor} 1px, transparent 1px)`, backgroundSize: '16px 16px' }} />
            {logoUrl && <img src={logoUrl} className="h-12 w-auto mb-6 brightness-0 invert" alt="logo" />}
            <div className="relative z-10 border border-white/30 p-4 px-8">
              <span className="uppercase tracking-[0.3em] text-xs">Season's Greetings</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <PageHeader
        heading="Brand Cards"
        description="Greeting cards and thank you notes to build customer loyalty."
      />

      {loading ? (
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      ) : (
        <Tabs defaultValue="thankyou" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="thankyou">Thank You Cards</TabsTrigger>
            <TabsTrigger value="greeting">Greeting Cards</TabsTrigger>
          </TabsList>

          <TabsContent value="thankyou">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2 text-center">
                <CardPreview type="thankyou" />
                <h3 className="font-semibold mt-4">Classic Gratitude</h3>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="greeting">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2 text-center">
                <CardPreview type="greeting" />
                <h3 className="font-semibold mt-4">Modern Holiday</h3>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
