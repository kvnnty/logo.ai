"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { AssetCard } from "@/components/dashboard/shared/asset-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { checkHistory, downloadImage, setPrimaryLogo } from "@/app/actions/actions";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Design {
  id: string;
  image_url: string;
  brandId?: string;
  createdAt: string;
}

export default function MyDesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const brandId = params?.brandId as string;

  useEffect(() => {
    async function fetchDesigns() {
      try {
        const history = await checkHistory();
        if (history) {
          // @ts-ignore
          setDesigns(history);
        }
      } catch (error) {
        console.error("Failed to fetch designs", error);
        toast({
          title: "Error",
          description: "Failed to load your designs.",
          variant: "destructive"
        })
      } finally {
        setLoading(false);
      }
    }
    fetchDesigns();
  }, [toast]);

  const handleDownload = async (design: Design) => {
    setDownloadingId(design.id);
    try {
      const result = await downloadImage(design.image_url);
      if (result.success && result.data) {
        const a = document.createElement("a");
        a.href = result.data;
        a.download = `brand-${design.id}.webp`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast({
          title: "Download started",
          description: "Your design is being downloaded.",
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

  const handleSetPrimary = async (design: Design) => {
    if (!brandId) return;
    setSettingPrimaryId(design.id);
    try {
      const result = await setPrimaryLogo(brandId, design.image_url);
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

  return (
    <div>
      <PageHeader
        heading="My Designs"
        description="Manage and organized your generated brand assets."
      >
        <Link href="/dashboard/my-brands/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </Link>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-aspect-square w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : designs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {designs.map((design) => (
            <AssetCard
              key={design.id}
              title={`Brand Logo ${new Date(design.createdAt).toLocaleDateString()}`}
              description="Generated Logo"
              imageUrl={design.image_url}
              date={new Date(design.createdAt).toLocaleDateString()}
              onDownload={() => handleDownload(design)}
              downloading={downloadingId === design.id}
              onAction={design.brandId === brandId ? () => handleSetPrimary(design) : undefined}
              actionLabel="Set as Primary"
              actionLoading={settingPrimaryId === design.id}
              className="bg-card"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-xl p-8 text-center animate-in fade-in-50">
          <div className="bg-primary/10 p-6 rounded-full mb-4">
            <Plus className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No designs yet</h3>
          <p className="text-muted-foreground max-w-md mb-8">
            Start your brand journey by generating your first logo. It takes just a few seconds!
          </p>
          <Link href="/dashboard/my-brands/create">
            <Button size="lg" className="px-8">Generate Brand</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
