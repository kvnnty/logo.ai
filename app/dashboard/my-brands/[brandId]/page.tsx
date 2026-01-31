"use client";

import { getDefaultTemplateScene, generateAITemplate } from "@/app/actions/brand-actions";
import { getCredits } from "@/app/actions/credits-actions";
import { TEMPLATE_CATEGORIES_BY_GROUP, TEMPLATE_STYLE_OPTIONS } from "@/constants/template-categories";
import { BrandOnboardingDialog } from "@/components/dashboard/brand-onboarding-dialog";
import { BrandCanvasEditor } from "@/components/dashboard/canvas/brand-canvas-editor";
import { EditBrandDialog } from "@/components/dashboard/shared/edit-brand-dialog";
import { GetStartedScrollWithBrand } from "@/components/dashboard/shared/get-started-scroll";
import { useBrand } from "@/components/providers/brand-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { getPrimaryLogoUrl } from "@/lib/utils/brand-utils";
import {
  ArrowRight,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  Loader2,
  Plus,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

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
  const [aiCategory, setAiCategory] = useState<string>("business_card");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStyle, setAiStyle] = useState<string>("modern");
  const [aiGenerating, setAiGenerating] = useState(false);

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
  const secondaryColor = brand.identity?.secondary_color || "#2563eb";

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

  const handleGenerateAIDesign = async () => {
    if (credits.remaining <= 0) {
      toast({ title: "No credits left", description: "Buy credits to generate new designs.", variant: "destructive" });
      return;
    }
    setAiGenerating(true);
    try {
      const styleInstruction = TEMPLATE_STYLE_OPTIONS.find((s) => s.id === aiStyle)?.promptInstruction;
      const result = await generateAITemplate(brand._id, aiCategory, aiPrompt, styleInstruction);
      if (result.success && result.sceneData) {
        if (typeof (result as any).remainingCredits === "number") {
          setCredits({ remaining: (result as any).remainingCredits });
        }
        setActiveEditorAsset({
          sceneData: result.sceneData,
          assetId: (result as any).assetId ?? "new",
          defaultCategory: aiCategory,
          defaultSubType: aiPrompt.trim().slice(0, 50) || `AI ${aiCategory}`,
        });
        toast({ title: "Design generated", description: "Customize it in the editor, then save or export." });
        setAiPrompt("");
      } else {
        toast({ title: "Generation failed", description: result.error || "Something went wrong", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to generate design", variant: "destructive" });
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-start justify-between gap-6 pb-6">
          <div className="flex items-start gap-6 flex-1">
            {logoUrl ? (
              <div className="w-28 h-28 bg-white border-2 border-border/50 p-4 flex items-center justify-center flex-shrink-0">
                <img src={logoUrl} alt={brand.name} className="w-full h-full object-contain rounded-xl" width={112} height={112} />
            </div>
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-dashed border-primary/30 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-10 w-10 text-primary/40" />
              </div>
            )}
            <div className="space-y-2 flex-1 min-w-0">
              <h1 className="text-3xl font-bold tracking-tight">{brand.name}</h1>
              {brand.description && (
                <p className="text-muted-foreground max-w-2xl leading-relaxed">
                  {brand.description}
                </p>
              )}
              <div className="flex items-start gap-6 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className="w-6 h-6 rounded-full border border-border/50 shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span className="text-muted-foreground font-mono text-xs">
                      {primaryColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className="w-6 h-6 rounded-full border border-border/50 shadow-sm"
                      style={{ backgroundColor: secondaryColor }}
                    />
                    <span className="text-muted-foreground font-mono text-xs">
                      {secondaryColor}
                    </span>
                  </div>
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

      {/* Main Content */}
      <div className="space-y-10">
        {/* Quick Actions - moved up, compact UI */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Quick actions</span>
          <div className="flex flex-wrap items-center gap-2">
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
        </div>

        {/* AI-powered Generate New Design */}
        <section>
          <h2 className="text-xl text-center font-bold">What do you want to create?</h2>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto text-center mt-2 leading-relaxed">
            Choose what to create, add a short description, and we&apos;ll generate a template you can customize in the editor—or use a default template if you leave the prompt empty.
          </p>
          <div className="max-w-4xl mx-auto space-y-4 mt-4">
            <div className="bg-card border focus-within:border-primary rounded-2xl p-6 shadow-sm">
              <div className="space-y-4">
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g. Bold red flyer for summer sale, minimal business card with geometric shapes, social cover with logo centered"
                  className="w-full min-h-[88px] resize-y rounded-none border-none outline-none focus-visible:ring-0 p-0 shadow-none"
                />
                <div className="flex justify-between items-start">
                  <div className="flex flex-wrap gap-3 items-center">
                    <Select value={aiStyle} onValueChange={setAiStyle}>
                      <SelectTrigger className="w-fit rounded border border-primary bg-primary/10 text-primary focus:ring-0">
                        <SelectValue placeholder="Style" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_STYLE_OPTIONS.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={aiCategory} onValueChange={setAiCategory}>
                      <SelectTrigger className="w-fit rounded border border-primary bg-primary/10 text-primary focus:ring-0">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Branding</SelectLabel>
                          {TEMPLATE_CATEGORIES_BY_GROUP.branding.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Social</SelectLabel>
                          {TEMPLATE_CATEGORIES_BY_GROUP.social.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Marketing</SelectLabel>
                          {TEMPLATE_CATEGORIES_BY_GROUP.marketing.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleGenerateAIDesign}
                    disabled={aiGenerating || credits.remaining <= 0}
                  >
                    {aiGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate design
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {credits.remaining} credits · 1 per generation
            </div>
          </div>
        </section>

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
      </div >

      {/* Dialogs */}
      < EditBrandDialog
        brand={brand}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => router.refresh()
        }
      />

      < BrandOnboardingDialog
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
    </div >
  );
}
