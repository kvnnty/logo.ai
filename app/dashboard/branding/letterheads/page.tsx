"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { checkHistory } from "@/app/actions/actions";
import { Skeleton } from "@/components/ui/skeleton";

export default function LetterheadsPage() {
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

  const LetterheadPreview = ({ style }: { style: 'classic' | 'modern' }) => (
    <div className="w-full bg-gray-100 p-4 rounded-xl flex justify-center overflow-hidden">
      {/* A4 Facsimile: aspect ratio approx 1:1.414 */}
      <div className="bg-white w-full max-w-[400px] aspect-[1/1.414] shadow-lg relative flex flex-col text-[10px] md:text-xs">

        {style === 'classic' && (
          <>
            {/* Header */}
            <div className="p-8 flex justify-between items-center border-b border-gray-100">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
              ) : (
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
              )}
              <div className="text-right text-gray-500">
                <div>123 Business Rd</div>
                <div>Tech City, 94000</div>
                <div style={{ color: primaryColor }}>www.example.com</div>
              </div>
            </div>

            {/* Body Content */}
            <div className="flex-1 p-8 text-gray-800 space-y-4">
              <div className="w-32 h-2 bg-gray-100 rounded" />
              <div className="space-y-2 pt-4">
                <div className="w-full h-2 bg-gray-50 rounded" />
                <div className="w-full h-2 bg-gray-50 rounded" />
                <div className="w-3/4 h-2 bg-gray-50 rounded" />
                <div className="w-full h-2 bg-gray-50 rounded" />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 text-center text-gray-400 border-t border-gray-100 text-[8px]">
              Registered in Country • No. 12345678
            </div>
          </>
        )}

        {style === 'modern' && (
          <>
            {/* Header */}
            <div className="relative h-32 w-full p-8 text-white flex justify-between items-start" style={{ backgroundColor: primaryColor }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-12 w-auto object-contain brightness-0 invert" />
              ) : (
                <div className="h-12 w-12 bg-white/20 rounded-full" />
              )}
              <div className="text-right opacity-90">
                <div>123 Business Rd</div>
                <div>Tech City, 94000</div>
              </div>
            </div>

            {/* Body Content */}
            <div className="flex-1 p-8 text-gray-800 space-y-4">
              <div className="w-32 h-2 bg-gray-100 rounded" />
              <div className="space-y-2 pt-4">
                <div className="w-full h-2 bg-gray-50 rounded" />
                <div className="w-full h-2 bg-gray-50 rounded" />
                <div className="w-3/4 h-2 bg-gray-50 rounded" />
                <div className="w-full h-2 bg-gray-50 rounded" />
              </div>
            </div>

            {/* Footer */}
            <div className="h-4 w-full" style={{ backgroundColor: primaryColor }} />
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <PageHeader
        heading="Letterheads"
        description="Official document templates for your business communication."
      />

      {loading ? (
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="w-full h-[500px] rounded-xl" />
          <Skeleton className="w-full h-[500px] rounded-xl" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <LetterheadPreview style="classic" />
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">Classic Clean</div>
                <div className="text-sm text-muted-foreground">Professional & Timeless</div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Word
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <LetterheadPreview style="modern" />
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">Modern Bold</div>
                <div className="text-sm text-muted-foreground">Impactful & Current</div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Word
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
