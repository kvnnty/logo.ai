"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { checkHistory } from "@/app/actions/actions";
import { Skeleton } from "@/components/ui/skeleton";

export default function IDCardsPage() {
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

  const BadgePreview = () => (
    <div className="w-full bg-gray-100 p-8 rounded-xl flex justify-center">
      {/* ID Card Ratio - CR80 is 85.60 × 53.98 mm */}
      <div className="bg-white w-[250px] aspect-[0.63] shadow-xl rounded-xl relative flex flex-col items-center overflow-hidden border">
        {/* Lanyard Hole */}
        <div className="w-12 h-1.5 bg-gray-200 mx-auto mt-4 rounded-full" />

        {/* Header */}
        <div className="w-full h-24 mt-4 relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundColor: primaryColor }} />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-sm">
            {/* Avatar Placeholder */}
            <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="mt-10 text-center w-full px-4">
          <h3 className="font-bold text-lg text-gray-900">Sarah Smith</h3>
          <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: primaryColor }}>Product Manager</p>

          <div className="mt-6 flex justify-center">
            {logoUrl ? <img src={logoUrl} className="h-8 w-auto object-contain" alt="logo" /> : <div className="h-8 w-20 bg-gray-100 rounded" />}
          </div>

          <div className="mt-8">
            <div className="w-full h-8 bg-gray-900 flex items-center justify-center">
              {/* Barcode Mock */}
              <div className="w-3/4 h-4 bg-white opacity-80" />
            </div>
            <div className="mt-1 text-[8px] text-gray-400">EMP ID: 8945722</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <PageHeader
        heading="ID Cards & Badges"
        description="Employee identification templates for security and events."
      />

      {loading ? (
        <div className="flex justify-center">
          <Skeleton className="h-[400px] w-[250px] rounded-xl" />
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <BadgePreview />
          <div className="flex gap-2">
            <Button variant="outline">Customize</Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
