"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { checkHistory, downloadImage } from "@/app/actions/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function FaviconPackPage() {
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

  const IconPreview = ({ size, label }: { size: number, label: string }) => {
    const handleDownload = async () => {
      if (logoUrl) {
        try {
          const result = await downloadImage(logoUrl);
          if (result.success && result.data) {
            const a = document.createElement("a");
            a.href = result.data;
            a.download = `favicon-${size}x${size}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast({ title: "Download started" });
          }
        } catch (e) { }
      }
    }

    return (
      <Card className="flex items-center p-4 gap-4">
        <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-lg">
          {logoUrl ? (
            <img src={logoUrl} width={size} height={size} alt="favicon" className="object-contain" />
          ) : (
            <div className="bg-gray-300 rounded-full" style={{ width: size, height: size }} />
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold">{label}</div>
          <div className="text-xs text-muted-foreground">{size} x {size} px</div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDownload}>
          <Download className="w-4 h-4" />
        </Button>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <PageHeader
        heading="Favicon Pack"
        description="Optimized website icons for different browsers and devices."
      >
        <Button>
          <Download className="h-4 w-4" />
          Download All (ZIP)
        </Button>
      </PageHeader>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <IconPreview size={16} label="Browser Tab (Small)" />
          <IconPreview size={32} label="Browser Tab (Standard)" />
          <IconPreview size={48} label="Windows Tile" />
          <IconPreview size={57} label="iOS Home Screen (Legacy)" />
          <IconPreview size={180} label="iOS Home Screen (Retina)" />
          <IconPreview size={192} label="Android Home Screen" />
          <IconPreview size={512} label="PWA / App Icon" />
        </div>
      )}
    </div>
  );
}
