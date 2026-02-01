"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { AssetCard } from "@/components/dashboard/shared/asset-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  getBrandById,
  listBrandUploads,
  setPrimaryLogoByImageUrl,
  addUserAsset,
  deleteUserAsset,
} from "@/app/actions/brand-actions";
import { listDesigns } from "@/app/actions/design-actions";
import { downloadLogoComponent } from "@/app/actions/logo-actions";
import { downloadImage } from "@/app/actions/utils-actions";
import { uploadFile } from "@/lib/utils/upload";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";
import { BrandCanvasEditor } from "@/components/dashboard/canvas/brand-canvas-editor";
import { EMPTY_SCENE_DATA } from "@/lib/templates/template-format";

const LOGO_TYPE_LABELS: Record<string, string> = {
  logo_horizontal: "Horizontal",
  logo_vertical: "Vertical",
  logo_text: "Text Only",
  logo_icon: "Icon Only",
  primary_logo: "Primary",
  logo_variation: "Variation",
  logo: "Logo",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];

interface LogoAsset {
  _id: string;
  category: string;
  subType: string;
  imageUrl: string;
  createdAt: string;
}

interface UserAsset {
  _id: string;
  category: string;
  subType: string;
  imageUrl: string;
  createdAt: string;
}

export default function MyDesignsPage() {
  const [logos, setLogos] = useState<LogoAsset[]>([]);
  const [designProjects, setDesignProjects] = useState<any[]>([]);
  const [userAssets, setUserAssets] = useState<UserAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("designs");
  const [activeEditorAsset, setActiveEditorAsset] = useState<{
    sceneData: any;
    assetId: string;
    defaultCategory?: string;
    defaultSubType?: string;
  } | null>(null);
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const brandId = params?.brandId as string;

  const fetchData = useCallback(async () => {
    if (!brandId) return;
    try {
      const [brandRes, designsRes, uploadsRes] = await Promise.all([
        getBrandById(brandId),
        listDesigns(brandId),
        listBrandUploads(brandId),
      ]);
      if (brandRes.success && brandRes.brand) {
        const logosFromBrand = (brandRes.brand as any).logos || [];
        setLogos(
          logosFromBrand.map((l: any) => ({
            _id: l._id,
            category: "logo",
            subType: l.subType || "logo",
            imageUrl: l.image_url ?? l.imageUrl,
            createdAt: l.createdAt,
          }))
        );
      }
      if (designsRes.success && designsRes.designs) {
        setDesignProjects(
          (designsRes.designs as any[]).sort((a: any, b: any) => {
            const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return tb - ta;
          })
        );
      }
      if (uploadsRes.success && uploadsRes.uploads) {
        setUserAssets(uploadsRes.uploads as UserAsset[]);
      }
    } catch (error) {
      console.error("Failed to fetch", error);
      toast({
        title: "Error",
        description: "Failed to load designs and assets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [brandId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownload = async (logo: LogoAsset) => {
    setDownloadingId(logo._id);
    try {
      const result = await downloadLogoComponent(brandId, logo._id, "png");
      if (result.success && result.data) {
        const a = document.createElement("a");
        a.href = `data:${result.mimeType};base64,${result.data}`;
        a.download = result.fileName || `logo-${logo.subType}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast({ title: "Download started", description: "Your logo is being downloaded." });
      } else throw new Error(result.error || "Failed to download");
    } catch {
      toast({ title: "Error", description: "Failed to download image.", variant: "destructive" });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSetPrimary = async (logo: LogoAsset) => {
    if (!brandId) return;
    setSettingPrimaryId(logo._id);
    try {
      const result = await setPrimaryLogoByImageUrl(brandId, logo.imageUrl);
      if (result.success) {
        toast({ title: "Primary logo updated", description: "This logo is now the primary identity for your brand." });
        router.refresh();
        fetchData();
      } else throw new Error(result.error);
    } catch {
      toast({ title: "Error", description: "Failed to set primary logo", variant: "destructive" });
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) return "File must be smaller than 5MB.";
    if (!ALLOWED_TYPES.includes(file.type)) return "File must be JPEG, PNG, SVG, or WEBP.";
    return null;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || !brandId) return;
    setUploading(true);
    let done = 0;
    let failed = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const err = validateFile(file);
      if (err) {
        toast({ title: "Invalid file", description: err, variant: "destructive" });
        failed++;
        continue;
      }
      try {
        const uploadResult = await uploadFile(file, { brandId, category: "user_upload" });
        if (uploadResult.success && uploadResult.url) {
          const addResult = await addUserAsset(brandId, uploadResult.url, file.name);
          if (addResult.success) done++;
          else failed++;
        } else failed++;
      } catch {
        failed++;
      }
    }
    setUploading(false);
    setDragOver(false);
    if (done) {
      toast({ title: "Upload complete", description: `${done} file(s) added to your assets.` });
      fetchData();
      router.refresh();
    }
    if (failed) toast({ title: "Some uploads failed", description: `${failed} file(s) could not be added.`, variant: "destructive" });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDeleteAsset = async (assetId: string) => {
    if (!brandId) return;
    setDeletingId(assetId);
    try {
      const result = await deleteUserAsset(brandId, assetId);
      if (result.success) {
        toast({ title: "Asset removed", description: "The asset has been deleted." });
        fetchData();
        router.refresh();
      } else toast({ title: "Error", description: result.error, variant: "destructive" });
    } catch {
      toast({ title: "Error", description: "Failed to delete asset", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const getLogoLabel = (subType: string) => LOGO_TYPE_LABELS[subType] || subType;

  const designsEmpty = logos.length === 0 && designProjects.length === 0;
  const assetsEmpty = userAssets.length === 0;

  return (
    <div>
      <PageHeader
        heading="My Designs"
        description="Continue an existing project, create a new design or upload files."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setActiveTab("assets");
              setTimeout(() => document.getElementById("asset-upload")?.click(), 100);
            }}
          >
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
          <Link href={`/dashboard/my-brands/${brandId}/editor`}>
            <Button>
              <Plus className="h-4 w-4" />
              Create Design
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="designs">Designs</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="designs" className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              ))}
            </div>
          ) : designsEmpty ? (
            <div className="flex flex-col items-center justify-center min-h-[320px] border-2 border-dashed rounded-xl p-8 text-center">
              <div className="bg-primary/10 p-6 rounded-full mb-4">
                <Plus className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No designs yet</h3>
              <p className="text-muted-foreground max-w-md mb-8">
                Start from a blank canvas or create logo variations from your brand dashboard.
              </p>
              <Link href={`/dashboard/my-brands/${brandId}/editor`}>
                <Button size="lg" className="px-8">
                  Create Design
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
              {designProjects.map((project: any) => (
                <Link key={project._id} href={`/dashboard/my-brands/${brandId}/editor/${project._id}`}>
                  <AssetCard
                    title={project.name || "Untitled"}
                    description={formatDistanceToNowStrict(new Date(project.updatedAt || project.createdAt), { addSuffix: true })}
                    imageUrl={project.thumbnailUrl || ""}
                    date={formatDistanceToNowStrict(new Date(project.updatedAt || project.createdAt), { addSuffix: true })}
                    className="bg-card"
                  />
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assets" className="mt-4">
          {/* Upload zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-8 max-w-3xl mx-auto",
              dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30 bg-muted/10"
            )}
          >
            <input
              type="file"
              id="asset-upload"
              accept={ALLOWED_TYPES.join(",")}
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
              disabled={uploading}
            />
            <label
              htmlFor="asset-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              {uploading ? (
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              ) : (
                <Upload className="h-10 w-10 text-muted-foreground" />
              )}
              <span className="font-medium">
                {uploading ? "Uploading…" : "Click or drag to upload"}
              </span>
            </label>
            <p className="text-xs text-muted-foreground mt-2">
              Uploaded files must be smaller than 5MB, and must be JPEG, PNG, SVG, or WEBP.
            </p>
          </div>

          {/* My uploads */}
          <h3 className="text-sm font-semibold mb-3">My uploads</h3>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : assetsEmpty ? (
            <div className="rounded-xl border border-border/50 bg-muted/10 p-8 text-center text-muted-foreground text-sm">
              No uploads yet. Add images above to use them in your designs.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {userAssets.map((asset) => (
                <div key={asset._id} className="group relative">
                  <div className="aspect-square rounded-lg border border-border/50 bg-muted/20 overflow-hidden">
                    <img
                      src={asset.imageUrl}
                      alt={asset.subType}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-1.5 text-xs font-medium truncate" title={asset.subType}>
                    {asset.subType.length > 24 ? `${asset.subType.slice(0, 21)}…` : asset.subType}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 bg-background/80 hover:bg-destructive/20 text-destructive"
                    onClick={() => handleDeleteAsset(asset._id)}
                    disabled={deletingId === asset._id}
                  >
                    {deletingId === asset._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "×"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {activeEditorAsset && (
        <BrandCanvasEditor
          initialScene={activeEditorAsset.sceneData}
          brandId={brandId}
          assetId={activeEditorAsset.assetId}
          defaultCategory={activeEditorAsset.defaultCategory}
          defaultSubType={activeEditorAsset.defaultSubType}
          onClose={() => {
            setActiveEditorAsset(null);
            fetchData();
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
