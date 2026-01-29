"use client";

import { getDefaultTemplateScene } from "@/app/actions/brand-actions";
import { getCredits } from "@/app/actions/credits-actions";
import { BrandOnboardingDialog } from "@/components/dashboard/brand-onboarding-dialog";
import { BrandCanvasEditor } from "@/components/dashboard/canvas/brand-canvas-editor";
import { EditBrandDialog } from "@/components/dashboard/shared/edit-brand-dialog";
import { GetStartedScrollWithBrand } from "@/components/dashboard/shared/get-started-scroll";
import { useBrand } from "@/components/providers/brand-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getPrimaryLogoUrl } from "@/lib/utils/brand-utils";
import {
  ArrowRight,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  Plus,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CreditInfo {
  remaining: number;
}

export default function BrandDashboardPage() {
  const brand = useBrand();
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [activeEditorAsset, setActiveEditorAsset] = useState<{
    sceneData: any;
    assetId: string;
    defaultCategory?: string;
    defaultSubType?: string;
  } | null>(null);
  const [createDesignLoading, setCreateDesignLoading] = useState(false);
  const [credits, setCredits] = useState<CreditInfo>({ remaining: 0 });

  useEffect(() => {
    if (!brand.industry || brand.industry.trim() === "") {
      setIsOnboardingOpen(true);
    }
  }, [brand.industry]);

  useEffect(() => {
    async function fetchCredits() {
      const result = await getCredits();
      setCredits(result);
    }
    fetchCredits();
  }, []);

  const logoUrl = getPrimaryLogoUrl(brand.assets);
  const primaryColor = brand.identity?.primary_color || "#2563eb";

  // Recent projects: assets that have sceneData (editable), newest first
  const recentProjects = (brand.assets || [])
    .filter((a: any) => a.sceneData)
    .sort((a: any, b: any) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 12);

  const openEditor = (asset: any) => {
    if (asset.sceneData) {
      setActiveEditorAsset({ sceneData: asset.sceneData, assetId: asset._id });
    } else {
      toast({
        title: "Cannot edit",
        description: "This asset has no editable design.",
        variant: "destructive",
      });
    }
  };

  const handleCreateDesign = async () => {
    setCreateDesignLoading(true);
    try {
      const result = await getDefaultTemplateScene(brand._id, "business_card");
      if (result.success && result.sceneData) {
        setActiveEditorAsset({
          sceneData: result.sceneData,
          assetId: "new",
          defaultCategory: "business_card",
          defaultSubType: "New Design",
        });
      } else {
        toast({ title: "Error", description: result.error || "Could not load template", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to open editor", variant: "destructive" });
    } finally {
      setCreateDesignLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-6 flex-1">
              {logoUrl ? (
                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-border/50 p-4 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <img src={logoUrl} alt={brand.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-dashed border-primary/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-10 w-10 text-primary/40" />
                </div>
              )}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">{brand.name}</h1>
                  <Badge variant="outline" className="text-xs">
                    {brand.assets?.length ?? 0} assets
                  </Badge>
                </div>
                {brand.description && (
                  <p className="text-muted-foreground max-w-2xl leading-relaxed">
                    {brand.description}
                  </p>
                )}
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className="w-4 h-4 rounded-full border border-border/50 shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span className="text-muted-foreground font-mono text-xs">
                      {primaryColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4" />
                    <span>{credits.remaining} credits</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push(`/dashboard/my-brands/${brand._id}/link-in-bio`)}
              >
                <LinkIcon className="h-4 w-4" />
                Link in Bio
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 space-y-10">
        {/* Quick Actions - moved up, compact UI */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Quick actions</span>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => router.push(`/dashboard/my-brands/${brand._id}/create`)}
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            Generate Logo
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => router.push(`/dashboard/my-brands/${brand._id}/my-designs`)}
          >
            <Layers className="h-4 w-4 mr-1.5" />
            My Designs
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => router.push(`/dashboard/my-brands/${brand._id}/link-in-bio`)}
          >
            <LinkIcon className="h-4 w-4 mr-1.5" />
            Link in Bio
          </Button>
          <Link href="/dashboard/credits">
            <Button variant="secondary" size="sm" className="rounded-full">
              <Zap className="h-4 w-4 mr-1.5" />
              Buy Credits
            </Button>
          </Link>
        </div>

        {/* Your recent projects */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Your recent projects</h2>
          <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border -mx-6 px-6">
            {recentProjects.map((asset: any) => (
              <button
                key={asset._id}
                type="button"
                onClick={() => openEditor(asset)}
                className="flex-shrink-0 w-[200px] text-left group"
              >
                <div className="rounded-xl border-2 bg-card overflow-hidden transition-all group-hover:border-primary/50 group-hover:shadow-md aspect-[4/3] flex items-center justify-center">
                  {asset.imageUrl ? (
                    <img
                      src={asset.imageUrl}
                      alt={asset.subType || "Project"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/50">
                      <div className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center shadow-sm">
                        <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium truncate">
                  {asset.subType?.replace(/_/g, " ") || "Untitled"}
                </p>
              </button>
            ))}
            {/* Create Design card - opens editor with default template */}
            <button
              type="button"
              onClick={handleCreateDesign}
              disabled={createDesignLoading}
              className="flex-shrink-0 w-[200px] block group text-left"
            >
              <div className="rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 overflow-hidden transition-all group-hover:border-primary/50 group-hover:bg-muted/30 aspect-[4/3] flex flex-col items-center justify-center gap-2">
                {createDesignLoading ? (
                  <span className="text-sm text-muted-foreground">Loading...</span>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Plus className="w-7 h-7" />
                    </div>
                    <span className="text-sm font-medium">Create Design</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </section>

        {/* Get started - horizontal scroll */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Set up your business</h2>
          <GetStartedScrollWithBrand
            logoUrl={logoUrl}
            brandName={brand.name}
            email={brand.contactInfo?.email}
            domainName={brand.contactInfo?.website?.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            primaryColor={primaryColor}
            onDomainClick={() => {
              toast({ title: "Coming Soon", description: "Domain management will be available soon" });
            }}
            onEmailClick={() => {
              toast({ title: "Coming Soon", description: "Business email setup will be available soon" });
            }}
            onSignatureClick={() =>
              router.push(`/dashboard/my-brands/${brand._id}/branding/email-signature`)
            }
            onWebsiteClick={() =>
              toast({ title: "Coming Soon", description: "Website builder will be available soon" })
            }
            onLinkInBioClick={() => router.push(`/dashboard/my-brands/${brand._id}/link-in-bio`)}
          />
        </section>

        {/* Brand Boards - horizontal scroll */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Brand Boards</h2>
            <Link
              href={`/dashboard/my-brands/${brand._id}/my-designs`}
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              View more
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border -mx-6 px-6">
            {[
              { id: "1", title: "Simple and Clean Brand Board", subtitle: "2550×3300 Brand Boards" },
              { id: "2", title: "Elegant Brand Board", subtitle: "2550×3300 Brand Boards" },
              { id: "3", title: "Color Gradients Brand Board", subtitle: "2550×3300 Brand Boards" },
              { id: "4", title: "Logo Versions Brand Board", subtitle: "2550×3300 Brand Boards" },
            ].map((board) => (
              <button
                key={board.id}
                type="button"
                onClick={() => router.push(`/dashboard/my-brands/${brand._id}/my-designs`)}
                className="flex-shrink-0 w-[280px] rounded-xl border-2 bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all text-left group"
              >
                <div className="aspect-[2550/3300] max-h-[320px] bg-muted/30 flex items-center justify-center relative">
                  <span className="text-xs font-medium text-muted-foreground absolute top-2 left-2 px-2 py-0.5 rounded bg-background/80">
                    Pro
                  </span>
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt=""
                      className="max-w-[120px] max-h-16 object-contain opacity-90"
                    />
                  ) : (
                    <div className="w-24 h-12 rounded bg-muted-foreground/20" />
                  )}
                </div>
                <div className="p-3 border-t">
                  <p className="font-semibold text-sm truncate">{board.title}</p>
                  <p className="text-xs text-muted-foreground">{board.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Dialogs */}
      <EditBrandDialog
        brand={brand}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => router.refresh()}
      />

      <BrandOnboardingDialog
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          router.refresh();
        }}
        brand={brand}
      />

      {activeEditorAsset && (
        <BrandCanvasEditor
          initialScene={activeEditorAsset.sceneData}
          brandId={brand._id}
          assetId={activeEditorAsset.assetId}
          defaultCategory={activeEditorAsset.defaultCategory}
          defaultSubType={activeEditorAsset.defaultSubType}
          onClose={() => {
            setActiveEditorAsset(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
