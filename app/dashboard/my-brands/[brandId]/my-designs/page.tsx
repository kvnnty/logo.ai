"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { AssetCard } from "@/components/dashboard/shared/asset-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getBrandById, setPrimaryLogo } from "@/app/actions/brand-actions";
import { downloadImage } from "@/app/actions/utils-actions";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNowStrict } from "date-fns";

const LOGO_TYPE_LABELS: Record<string, string> = {
  logo_horizontal: "Horizontal",
  logo_vertical: "Vertical",
  logo_text: "Text Only",
  logo_icon: "Icon Only",
  primary_logo: "Primary",
  logo_variation: "Variation",
  logo: "Logo",
};

interface LogoAsset {
  _id: string;
  category: string;
  subType: string;
  imageUrl: string;
  createdAt: string;
}

export default function MyDesignsPage() {
  const [logos, setLogos] = useState<LogoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const brandId = params?.brandId as string;

  useEffect(() => {
    async function fetchLogos() {
      if (!brandId) return;
      try {
        const result = await getBrandById(brandId);
        if (result.success && result.brand) {
          const logoAssets = result.brand.assets.filter(
            (a: any) => a.category === "logo"
          );
          setLogos(logoAssets);
        }
      } catch (error) {
        console.error("Failed to fetch logos", error);
        toast({
          title: "Error",
          description: "Failed to load your logo designs.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchLogos();
  }, [brandId, toast]);

  const handleDownload = async (logo: LogoAsset) => {
    setDownloadingId(logo._id);
    try {
      const result = await downloadImage(logo.imageUrl);
      if (result.success && result.data) {
        const a = document.createElement("a");
        a.href = result.data;
        a.download = `logo-${logo.subType}.webp`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast({
          title: "Download started",
          description: "Your logo is being downloaded.",
        });
      } else {
        throw new Error("Failed to download");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download image.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSetPrimary = async (logo: LogoAsset) => {
    if (!brandId) return;
    setSettingPrimaryId(logo._id);
    try {
      const result = await setPrimaryLogo(brandId, logo.imageUrl);
      if (result.success) {
        toast({
          title: "Primary logo updated",
          description: "This logo is now the primary identity for your brand.",
        });
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to update");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set primary logo",
        variant: "destructive",
      });
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const getLogoLabel = (subType: string) => {
    return LOGO_TYPE_LABELS[subType] || subType;
  };

  return (
    <div>
      <PageHeader
        heading="My Logo Collection"
        description="Your complete set of logo variations for consistent branding."
      >
        <Link href="/dashboard/my-brands/create">
          <Button>
            <Plus className="h-4 w-4" />
            Create New Brand
          </Button>
        </Link>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
          ))}
        </div>
      ) : logos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {logos.map((logo) => (
            <AssetCard
              key={logo._id}
              title={getLogoLabel(logo.subType)}
              description={formatDistanceToNowStrict(new Date(logo.createdAt), { addSuffix: true })}
              imageUrl={logo.imageUrl}
              date={formatDistanceToNowStrict(new Date(logo.createdAt), { addSuffix: true })}
              onDownload={() => handleDownload(logo)}
              downloading={downloadingId === logo._id}
              onAction={() => handleSetPrimary(logo)}
              actionLabel={logo.subType === "primary_logo" ? "Primary ✓" : "Set as Primary"}
              actionLoading={settingPrimaryId === logo._id}
              className="bg-card"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-xl p-8 text-center animate-in fade-in-50 mt-8">
          <div className="bg-primary/10 p-6 rounded-full mb-4">
            <Plus className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No logo designs yet</h3>
          <p className="text-muted-foreground max-w-md mb-8">
            Generate your first logo collection to see all 4 logo variations here.
          </p>
          <Link href="/dashboard/my-brands/create">
            <Button size="lg" className="px-8">Generate Brand</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
