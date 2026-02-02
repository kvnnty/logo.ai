"use client";

import { generateAITemplate } from "@/app/actions/brand-actions";
import { listDesigns } from "@/app/actions/design-actions";
import { getCredits } from "@/app/actions/credits-actions";
import { TEMPLATE_CATEGORIES_BY_GROUP, TEMPLATE_STYLE_OPTIONS } from "@/constants/template-categories";
import { BrandOnboardingDialog } from "@/components/dashboard/brand-onboarding-dialog";
import { BrandCanvasEditor } from "@/components/dashboard/canvas/brand-canvas-editor";
import { EditBrandDialog } from "@/components/dashboard/shared/edit-brand-dialog";
import { PolotnoTemplateGrid } from "@/components/dashboard/shared/polotno-template-grid";
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
  Copy,
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
  const [credits, setCredits] = useState<CreditInfo>({ remaining: 0 });
  const [aiCategory, setAiCategory] = useState<string>("business_card");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStyle, setAiStyle] = useState<string>("modern");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [latestDesigns, setLatestDesigns] = useState<any[]>([]);

  useEffect(() => {
    if (!brand.industry || brand.industry.trim() === "" || !brand.contactInfo?.email || brand.contactInfo?.email.trim() === "") {
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

  useEffect(() => {
    if (!brand?._id) return;
    listDesigns(brand._id).then((r) => {
      if (r.success && r.designs) setLatestDesigns((r.designs as any[]).slice(0, 5));
    });
  }, [brand?._id]);

  const logoUrl = brand.primaryLogoUrl ?? getPrimaryLogoUrl(brand.logos);
  const primaryColor = brand.identity?.primary_color || "#2563eb";
  const secondaryColor = brand.identity?.secondary_color || "#2563eb";

  const copyPublicLink = () => {
    const slug = brand.slug;
    if (!slug) return;
    const url = typeof window !== "undefined" ? `${window.location.origin}/brand/${slug}` : `/brand/${slug}`;
    navigator.clipboard.writeText(url).then(() => toast({ title: "Copied", description: "Public page URL copied to clipboard." }));
  };

  const openEditor = (design: any) => {
    if (design._id) router.push(`/editor/${brand._id}/${design._id}`);
  };

  const handleCreateDesign = () => {
    router.push(`/editor/${brand._id}`);
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
      if (result.success && (result as any).designId) {
        if (typeof (result as any).remainingCredits === "number") {
          setCredits({ remaining: (result as any).remainingCredits });
        }
        toast({ title: "Design generated", description: "Opening in editor…" });
        setAiPrompt("");
        router.push(`/editor/${brand._id}/${(result as any).designId}`);
      } else if (result.success && result.sceneData) {
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
            {brand.slug && (
              <Button variant="outline" size="sm" onClick={copyPublicLink} className="gap-1.5">
                <Copy className="h-4 w-4" />
                Copy public link
              </Button>
            )}
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
        <div className="space-y-2 flex flex-col justify-center items-center">
          <span className="text-sm text-center font-medium text-muted-foreground mr-2">Quick actions</span>
          <div className="flex flex-wrap justify-center items-center gap-2 overflow-x-auto">
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
              onClick={() => router.push(`/dashboard/my-brands/${brand._id}/my-designs?tab=logos`)}
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              Logos
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => router.push(`/dashboard/my-brands/${brand._id}/my-designs?tab=designs`)}
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

        {/* Designs — single row of latest */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent designs</h2>
            <Link
              href={`/dashboard/my-brands/${brand._id}/my-designs?tab=designs`}
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              View all designs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex items-start gap-5 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border -mx-6 px-6">
            <button
              type="button"
              onClick={handleCreateDesign}
              className="flex-shrink-0 w-[200px] block group text-left"
            >
              <div className="rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 overflow-hidden transition-all group-hover:border-primary/50 group-hover:bg-muted/30 aspect-[4/3] flex flex-col items-center justify-center gap-2">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Plus className="w-7 h-7" />
                </div>
                <span className="text-sm font-medium">Create Design</span>
              </div>
            </button>
            {latestDesigns.map((design: any) => (
              <button
                key={design._id}
                type="button"
                onClick={() => openEditor(design)}
                className="flex-shrink-0 w-[200px] text-left group"
              >
                <div className="rounded-xl border-2 bg-card overflow-hidden transition-all group-hover:border-primary/50 group-hover:shadow-md aspect-[4/3] flex items-center justify-center">
                  {design.thumbnailUrl ? (
                    <img
                      src={design.thumbnailUrl}
                      alt={design.name || "Design"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/50">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium truncate">
                  {design.name || "Untitled"}
                </p>

              </button>
            ))}

          </div>
        </section>

        {/* Templates from Polotno */}
        <PolotnoTemplateGrid
          brandId={brand._id}
          title="Templates"
          description="Start from a template and customize it in the editor."
        />
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
