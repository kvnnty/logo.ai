"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { checkHistory } from "@/app/actions/brand-actions";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostersPage() {
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

  const PosterPreview = ({ style }: { style: 'minimal' | 'bold' }) => (
    <div className="w-full bg-gray-100 p-4 rounded-xl flex justify-center">
      {/* Poster Ratio 2:3 */}
      <div className="bg-white w-full max-w-[280px] aspect-[2/3] shadow-2xl relative flex flex-col overflow-hidden group">
        {style === 'minimal' && (
          <div className="h-full flex flex-col p-8 items-center text-center justify-center border-[20px]" style={{ borderColor: primaryColor }}>
            {logoUrl && <img src={logoUrl} className="w-32 h-32 object-contain mb-8" alt="Logo" />}
            <div className="text-4xl font-bold uppercase tracking-tighter mb-2">Think<br />Big.</div>
            <p className="text-xs text-gray-500 max-w-[150px]">We create brands that stand the test of time and scale with your ambition.</p>
          </div>
        )}

        {style === 'bold' && (
          <div className="h-full relative bg-gray-900 text-white p-6 flex flex-col justify-between">
            <div className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: logoUrl ? `url(${logoUrl})` : 'none' }} />
            <div className="relative z-10">
              <div className="text-sm font-bold tracking-widest text-primary mb-2" style={{ color: primaryColor }}>NOW AVAILBLE</div>
              <h2 className="text-5xl font-black leading-none">THE<br />NEW<br />ERA</h2>
            </div>
            <div className="relative z-10 pt-8 border-t border-white/20">
              <div className="flex justify-between items-end">
                <div className="text-xs">
                  www.example.com
                </div>
                {logoUrl && <img src={logoUrl} className="w-12 h-12 object-contain brightness-0 invert" alt="Logo" />}
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <Button variant="secondary">
            <Download className="h-4 w-4" />
            Download High-Res
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <PageHeader
        heading="Posters"
        description="High-impact posters for office walls or street marketing."
      />

      {loading ? (
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-[450px] w-full rounded-xl" />
          <Skeleton className="h-[450px] w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-2 text-center">
            <PosterPreview style="minimal" />
            <h3 className="font-semibold mt-4">Corporate Minimal</h3>
          </div>
          <div className="space-y-2 text-center">
            <PosterPreview style="bold" />
            <h3 className="font-semibold mt-4">Urban Impact</h3>
          </div>
        </div>
      )}
    </div>
  );
}
