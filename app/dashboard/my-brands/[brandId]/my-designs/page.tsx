"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { AssetCard } from "@/components/dashboard/shared/asset-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Loader2, Sparkles, LayoutGrid, ImageIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getBrandById,
  listBrandUploads,
  setPrimaryLogoByImageUrl,
  addUserAsset,
  deleteUserAsset,
} from "@/app/actions/brand-actions";
import { listDesigns, deleteDesign } from "@/app/actions/design-actions";
import { downloadLogoComponent, deleteLogo } from "@/app/actions/logo-actions";
import { downloadImage } from "@/app/actions/utils-actions";
import { uploadFile } from "@/lib/utils/upload";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageViewerModal } from "@/components/dashboard/shared/image-viewer-modal";
import { BrandCanvasEditor } from "@/components/dashboard/canvas/brand-canvas-editor";

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
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const initialTab = tabFromUrl === "logos" || tabFromUrl === "designs" || tabFromUrl === "assets" ? tabFromUrl : "designs";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeEditorAsset, setActiveEditorAsset] = useState<{
    sceneData: any;
    assetId: string;
    defaultCategory?: string;
    defaultSubType?: string;
  } | null>(null);
  const [imageViewer, setImageViewer] = useState<{
    open: boolean;
    url: string;
    title: string;
    variant: "logo" | "design" | "asset";
    logo?: LogoAsset;
    design?: any;
    asset?: UserAsset;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    type: "logo" | "design" | "asset";
    id: string;
    name: string;
  } | null>(null);
  const [deletingLogoId, setDeletingLogoId] = useState<string | null>(null);
  const [deletingDesignId, setDeletingDesignId] = useState<string | null>(null);
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

  // Sync tab from URL (e.g. sidebar "Logos" / "My Designs" links)
  useEffect(() => {
    const t = tabFromUrl === "logos" || tabFromUrl === "designs" || tabFromUrl === "assets" ? tabFromUrl : "designs";
    setActiveTab(t);
  }, [tabFromUrl]);

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

  const getLogoLabel = (subType: string) => LOGO_TYPE_LABELS[subType] || subType;

  const openLogoViewer = (logo: LogoAsset) => {
    setImageViewer({
      open: true,
      url: logo.imageUrl,
      title: getLogoLabel(logo.subType),
      variant: "logo",
      logo,
    });
  };

  const openDesignViewer = (project: any) => {
    setImageViewer({
      open: true,
      url: project.thumbnailUrl || "",
      title: project.name || "Untitled",
      variant: "design",
      design: project,
    });
  };

  const openAssetViewer = (asset: UserAsset) => {
    setImageViewer({
      open: true,
      url: asset.imageUrl,
      title: asset.subType,
      variant: "asset",
      asset,
    });
  };

  const closeViewer = () => setImageViewer(null);

  const openDeleteConfirm = (type: "logo" | "design" | "asset", id: string, name: string) => {
    setDeleteConfirm({ open: true, type, id, name });
  };

  const performDelete = async () => {
    if (!deleteConfirm || !brandId) return;
    const { type, id } = deleteConfirm;
    try {
      if (type === "logo") {
        setDeletingLogoId(id);
        const result = await deleteLogo(brandId, id);
        if (result.success) {
          toast({ title: "Logo deleted", description: "The logo has been removed." });
          fetchData();
          router.refresh();
          setDeleteConfirm(null);
          closeViewer();
        } else toast({ title: "Error", description: result.error, variant: "destructive" });
      } else if (type === "design") {
        setDeletingDesignId(id);
        const result = await deleteDesign(id);
        if (result.success) {
          toast({ title: "Design deleted", description: "The design has been removed." });
          fetchData();
          router.refresh();
          setDeleteConfirm(null);
          closeViewer();
        } else toast({ title: "Error", description: result.error, variant: "destructive" });
      } else if (type === "asset") {
        setDeletingId(id);
        const result = await deleteUserAsset(brandId, id);
        if (result.success) {
          toast({ title: "Asset deleted", description: "The asset has been removed." });
          fetchData();
          router.refresh();
          setDeleteConfirm(null);
          closeViewer();
        } else toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } finally {
      setDeletingLogoId(null);
      setDeletingDesignId(null);
      setDeletingId(null);
    }
  };

  const logosEmpty = logos.length === 0;
  const designsEmpty = designProjects.length === 0;
  const assetsEmpty = userAssets.length === 0;

  const setTab = (value: string) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        heading="Logos & Designs"
        description="Brand logos, canvas designs, and uploaded assets."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-2"
            onClick={() => {
              setTab("assets");
              setTimeout(() => document.getElementById("asset-upload")?.click(), 100);
            }}
          >
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
          <Link href={`/editor/${brandId}`}>
            <Button size="sm" className="gap-2 rounded-full shadow-md">
              <Plus className="h-4 w-4" />
              Create Design
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setTab} className="mt-8">
        <TabsList className="flex h-11 w-full max-w-md rounded-xl bg-muted/50 p-1.5 border border-border/50 shadow-inner">
          <TabsTrigger
            value="logos"
            className="flex-1 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            <Sparkles className="h-4 w-4 mr-2 opacity-80" />
            Logos
            {!loading && <Badge variant="secondary" className="ml-2 h-5 min-w-5 rounded-full px-1.5 text-xs">{logos.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger
            value="designs"
            className="flex-1 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            <LayoutGrid className="h-4 w-4 mr-2 opacity-80" />
            Designs
            {!loading && <Badge variant="secondary" className="ml-2 h-5 min-w-5 rounded-full px-1.5 text-xs">{designProjects.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger
            value="assets"
            className="flex-1 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            <ImageIcon className="h-4 w-4 mr-2 opacity-80" />
            Assets
            {!loading && <Badge variant="secondary" className="ml-2 h-5 min-w-5 rounded-full px-1.5 text-xs">{userAssets.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logos" className="mt-6">
          <div className="rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <Skeleton className="h-5 w-[120px] rounded-md" />
                    <Skeleton className="h-4 w-[80px] rounded-md" />
                  </div>
                ))}
              </div>
            ) : logosEmpty ? (
              <div className="flex flex-col items-center justify-center min-h-[340px] rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-10 text-center">
                <div className="rounded-full bg-primary/10 p-6 ring-4 ring-primary/10 mb-6">
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No logos yet</h3>
                <p className="text-muted-foreground max-w-sm mb-8 text-sm leading-relaxed">
                  Generate logo variations from your brand overview or upload logo files in Assets.
                </p>
                <Link href={`/dashboard/my-brands/${brandId}`}>
                  <Button size="lg" variant="outline" className="rounded-full px-8 border-2">
                    Go to Overview
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  {logos.length} logo{logos.length !== 1 ? "s" : ""} · Download or set as primary
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {logos.map((logo) => (
                    <div key={logo._id} className="relative">
                      {logo.subType === "primary_logo" && (
                        <Badge className="absolute top-3 left-3 z-10 rounded-full bg-primary shadow-md">Primary</Badge>
                      )}
                      <AssetCard
                        title={getLogoLabel(logo.subType)}
                        description={formatDistanceToNowStrict(new Date(logo.createdAt), { addSuffix: true })}
                        imageUrl={logo.imageUrl}
                        date={formatDistanceToNowStrict(new Date(logo.createdAt), { addSuffix: true })}
                        onPreview={() => openLogoViewer(logo)}
                        onDownload={() => handleDownload(logo)}
                        downloading={downloadingId === logo._id}
                        onAction={() => handleSetPrimary(logo)}
                        actionLabel={logo.subType === "primary_logo" ? "Primary ✓" : "Set as Primary"}
                        actionLoading={settingPrimaryId === logo._id}
                        onDelete={() => openDeleteConfirm("logo", logo._id, getLogoLabel(logo.subType))}
                        className="bg-card border-2 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="designs" className="mt-6">
          <div className="rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <Skeleton className="h-5 w-[120px] rounded-md" />
                    <Skeleton className="h-4 w-[80px] rounded-md" />
                  </div>
                ))}
              </div>
            ) : designsEmpty ? (
              <div className="flex flex-col items-center justify-center min-h-[340px] rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-10 text-center">
                <div className="rounded-full bg-primary/10 p-6 ring-4 ring-primary/10 mb-6">
                  <LayoutGrid className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No designs yet</h3>
                <p className="text-muted-foreground max-w-sm mb-8 text-sm leading-relaxed">
                  Start from a blank canvas or pick a template from your brand overview.
                </p>
                <Link href={`/editor/${brandId}`}>
                  <Button size="lg" className="rounded-full px-8 shadow-md">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Design
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  {designProjects.length} design{designProjects.length !== 1 ? "s" : ""} · Click to open in editor
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {designProjects.map((project: any) => (
                    <div key={project._id} className="group">
                      <AssetCard
                        title={project.name || "Untitled"}
                        description={formatDistanceToNowStrict(new Date(project.updatedAt || project.createdAt), { addSuffix: true })}
                        imageUrl={project.thumbnailUrl || ""}
                        date={formatDistanceToNowStrict(new Date(project.updatedAt || project.createdAt), { addSuffix: true })}
                        onPreview={() => project.thumbnailUrl && openDesignViewer(project)}
                        onEdit={() => router.push(`/editor/${brandId}/${project._id}`)}
                        onAction={() => router.push(`/editor/${brandId}/${project._id}`)}
                        actionLabel="Open in Editor"
                        onDelete={() => openDeleteConfirm("design", project._id, project.name || "Untitled")}
                        className="bg-card border-2 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assets" className="mt-6">
          <div className="rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm space-y-8">
            {/* Upload zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 max-w-2xl mx-auto",
                dragOver
                  ? "border-primary bg-primary/10 scale-[1.01] shadow-lg"
                  : "border-muted-foreground/30 bg-muted/20 hover:border-muted-foreground/50 hover:bg-muted/30"
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
              <label htmlFor="asset-upload" className="cursor-pointer flex flex-col items-center gap-4">
                <div className={cn(
                  "rounded-full p-5 transition-colors",
                  dragOver ? "bg-primary/20" : "bg-muted"
                )}>
                  {uploading ? (
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  ) : (
                    <Upload className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <span className="font-semibold text-base">
                  {uploading ? "Uploading…" : "Click or drag files here"}
                </span>
                <p className="text-xs text-muted-foreground max-w-sm">
                  JPEG, PNG, SVG or WEBP · Max 5MB per file
                </p>
              </label>
            </div>

            {/* My uploads */}
            <div>
              <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                My uploads
                {!loading && <Badge variant="outline" className="font-normal">{userAssets.length}</Badge>}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">Images you’ve uploaded for use in designs</p>
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              ) : assetsEmpty ? (
                <div className="rounded-xl border border-border/50 bg-muted/10 p-10 text-center text-muted-foreground text-sm">
                  No uploads yet. Add images above to use them in your designs.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {userAssets.map((asset) => (
                    <div key={asset._id} className="group relative rounded-xl border-2 border-border/50 bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                      <div
                        className="aspect-square bg-muted/20 overflow-hidden relative cursor-pointer"
                        onClick={() => openAssetViewer(asset)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && openAssetViewer(asset)}
                      >
                        <img
                          src={asset.imageUrl}
                          alt={asset.subType}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 bg-background/90 hover:bg-destructive hover:text-destructive-foreground shadow-md transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteConfirm("asset", asset._id, asset.subType);
                          }}
                          disabled={deletingId === asset._id}
                        >
                          {deletingId === asset._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "×"
                          )}
                        </Button>
                      </div>
                      <p className="p-3 text-xs font-medium truncate border-t bg-card/80" title={asset.subType}>
                        {asset.subType.length > 22 ? `${asset.subType.slice(0, 19)}…` : asset.subType}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Image viewer popup */}
      {imageViewer && (
        <ImageViewerModal
          open={imageViewer.open}
          onOpenChange={(open) => !open && closeViewer()}
          imageUrl={imageViewer.url}
          title={imageViewer.title}
          variant={imageViewer.variant}
          onDownload={
            imageViewer.variant === "logo" && imageViewer.logo
              ? () => handleDownload(imageViewer.logo!)
              : undefined
          }
          downloading={imageViewer.variant === "logo" && imageViewer.logo ? downloadingId === imageViewer.logo._id : false}
          onSetPrimary={
            imageViewer.variant === "logo" && imageViewer.logo
              ? () => handleSetPrimary(imageViewer.logo!)
              : undefined
          }
          primaryLoading={imageViewer.variant === "logo" && imageViewer.logo ? settingPrimaryId === imageViewer.logo._id : false}
          isPrimary={imageViewer.variant === "logo" && imageViewer.logo ? imageViewer.logo.subType === "primary_logo" : false}
          onDelete={
            imageViewer.variant === "logo" && imageViewer.logo
              ? () => openDeleteConfirm("logo", imageViewer.logo!._id, getLogoLabel(imageViewer.logo!.subType))
              : imageViewer.variant === "design" && imageViewer.design
                ? () => openDeleteConfirm("design", imageViewer.design!._id, imageViewer.design!.name || "Untitled")
                : imageViewer.variant === "asset" && imageViewer.asset
                  ? () => openDeleteConfirm("asset", imageViewer.asset!._id, imageViewer.asset!.subType)
                  : undefined
          }
          deleting={
            (imageViewer.variant === "logo" && imageViewer.logo && deletingLogoId === imageViewer.logo._id) ||
            (imageViewer.variant === "design" && imageViewer.design && deletingDesignId === imageViewer.design._id) ||
            (imageViewer.variant === "asset" && imageViewer.asset && deletingId === imageViewer.asset._id)
          }
          onOpenInEditor={
            imageViewer.variant === "design" && imageViewer.design
              ? () => router.push(`/editor/${brandId}/${imageViewer.design!._id}`)
              : undefined
          }
        />
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteConfirm?.open} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {deleteConfirm?.type === "logo" ? "logo" : deleteConfirm?.type === "design" ? "design" : "asset"}?</DialogTitle>
            <DialogDescription>
              This will permanently remove &quot;{deleteConfirm?.name}&quot;. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && performDelete()}
              disabled={!!deletingId || !!deletingLogoId || !!deletingDesignId}
            >
              {(deletingId || deletingLogoId || deletingDesignId) ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
