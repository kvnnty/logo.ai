"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { checkHistory } from "@/app/actions/actions";
import { Skeleton } from "@/components/ui/skeleton";

export default function FlyersPage() {
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

  const FlyerPreview = ({ style }: { style: 'grand' | 'minimal' }) => (
    <div className="w-full bg-gray-100 p-4 rounded-xl flex justify-center">
      {/* A5 Ratio */}
      <div className="bg-white w-full max-w-[320px] aspect-[1/1.414] shadow-2xl relative flex flex-col overflow-hidden group">
        {style === 'grand' && (
          <>
            <div className="h-1/2 bg-gray-900 relative">
              <div className="absolute inset-0 opacity-50 mix-blend-overlay" style={{ backgroundColor: primaryColor }} />
              {logoUrl ? (
                <img src={logoUrl} className="w-full h-full object-cover opacity-80" alt="background" />
              ) : (
                <div className="w-full h-full bg-gray-800" />
              )}
              <div className="absolute bottom-6 left-6 text-white z-10">
                <div className="text-xs uppercase tracking-widest mb-2 font-semibold">Grand Opening</div>
                <h2 className="text-3xl font-bold leading-tight">Future of<br />Design</h2>
              </div>
            </div>
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Join us for an exclusive event showcasing the latest in brand identity and automation.</p>
                <div className="h-1 w-12" style={{ backgroundColor: primaryColor }} />
              </div>
              <div className="text-xs text-gray-400">
                <div>Saturday, Oct 24th</div>
                <div>10:00 AM - 6:00 PM</div>
              </div>
            </div>
          </>
        )}

        {style === 'minimal' && (
          <div className="h-full border-[12px] border-white relative flex flex-col p-6 items-center justify-center text-center" style={{ backgroundColor: primaryColor }}>
            <div className="bg-white p-8 rounded-full mb-8 shadow-lg">
              {logoUrl ? (
                <img src={logoUrl} className="w-16 h-16 object-contain" alt="logo" />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-full" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">We are<br />Live</h2>
            <Button variant="secondary" className="mt-4 rounded-full font-bold">Visit Website</Button>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <PageHeader
        heading="Flyers"
        description="Print-ready flyer templates for events and promotions."
      />

      {loading ? (
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-2 text-center">
            <FlyerPreview style="grand" />
            <h3 className="font-semibold mt-4">Event Promo</h3>
          </div>
          <div className="space-y-2 text-center">
            <FlyerPreview style="minimal" />
            <h3 className="font-semibold mt-4">Brand Launch</h3>
          </div>
        </div>
      )}
    </div>
  );
}
