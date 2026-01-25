"use client";

import { useBrand } from "@/components/providers/brand-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Palette, Image as ImageIcon, Share2, FileText, Settings, ArrowRight, Loader2, Type, Layout } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditBrandDialog } from "@/components/dashboard/shared/edit-brand-dialog";
import { BrandOnboardingDialog } from "@/components/dashboard/brand-onboarding-dialog";
import { useEffect } from "react";
import { BrandCanvasEditor } from "@/components/dashboard/canvas/brand-canvas-editor";
import { generateInteractiveAsset } from "@/app/actions/actions";

export default function BrandDashboardPage() {
  const brand = useBrand();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [activeEditorAsset, setActiveEditorAsset] = useState<{ sceneData: any, assetId: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show onboarding if industry is missing (undefined, null, or empty string)
    if (!brand.industry || brand.industry.trim() === "") {
      setIsOnboardingOpen(true);
    }
  }, [brand.industry]);

  const handleOpenEditor = async (category: string, subType: string) => {
    // Check if we already have an asset with sceneData for this category
    const existingAsset = brand.assets?.find((a: any) => a.category === category && a.subType === subType && a.sceneData);

    if (existingAsset) {
      setActiveEditorAsset({ sceneData: existingAsset.sceneData, assetId: (existingAsset as any)._id });
      return;
    }

    // Otherwise generate a new one
    setIsGenerating(true);
    try {
      const result = await generateInteractiveAsset(brand._id, category, subType);
      if (result.success && result.sceneData) {
        // Since we saved it to the DB, we can just find it or use the returned data
        // We'll use the returned data for immediate entry
        // Note: For a real app, you might want to refresh the brand context here
        // But for now, we just open the editor with the new data
        setActiveEditorAsset({ sceneData: result.sceneData, assetId: "new" });
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to generate asset:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Get primary color from identity
  const primaryColor = brand.identity?.primary_color || "#2563eb";

  return (
    <div className="pb-12">
      {/* Brand Overview */}
      <div className="flex items-start justify-between bg-white p-8 rounded-3xl border shadow-sm">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{brand.name}</h1>
            {brand.description && (
              <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                {brand.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-4"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Brand Details
            </Button>
          </div>
        </div>
      </div>

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
          onClose={() => setActiveEditorAsset(null)}
        />
      )}

      {isGenerating && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 border-4 border-primary/30 border-t-primary animate-spin rounded-full mb-6" />
          <h2 className="text-2xl font-bold mb-2">AI is Designing Your Canvas</h2>
          <p className="text-muted-foreground max-w-sm">
            We're arranging layouts, typography, and generating custom visuals...
          </p>
        </div>
      )}
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Assets</CardDescription>
            <CardTitle className="text-2xl">{brand.assets?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Primary Color</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: primaryColor }}
              />
              {primaryColor}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Brand Style</CardDescription>
            <CardTitle className=" capitalize">
              {brand.strategy?.archetype || "Not set"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Created</CardDescription>
            <CardTitle className="">
              {new Date(brand.createdAt).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Logo Collection Section */}
      {brand.assets?.some((a: any) => a.category === 'logo' && (a.subType === 'primary_logo' || a.subType === 'primary_variation')) && (
        <div className="space-y-6 mt-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Active Logo Collection</h2>
              <p className="text-muted-foreground">The primary variations for your brand identity.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/my-brands/${brand._id}/branding`)}>
              Manage All
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {brand.assets
              ?.filter((a: any) => a.category === 'logo' && (a.subType === 'primary_logo' || a.subType === 'primary_variation'))
              .sort((a: any, b: any) => {
                const order = ['primary_logo', 'primary_variation'];
                return order.indexOf(a.subType) - order.indexOf(b.subType);
              })
              .map((asset: any, idx: number) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="group relative cursor-pointer"
                  onClick={() => setActiveEditorAsset({ sceneData: asset.sceneData, assetId: asset._id })}
                >
                  <Card className="overflow-hidden border-border/50 bg-white shadow-sm hover:shadow-md transition-all">
                    <div className="aspect-square flex items-center justify-center p-8 bg-gradient-to-br from-white to-gray-50 relative">
                      {asset.subType === 'primary_logo' && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                          PRIMARY
                        </div>
                      )}

                      {asset.imageUrl ? (
                        <img src={asset.imageUrl} alt={asset.subType} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center opacity-80 group-hover:opacity-100 transition-opacity">
                          {asset.subType === 'logo_text' || (asset.sceneData?.elements?.length === 1 && asset.sceneData.elements[0].type === 'text') ? (
                            <Type className="w-8 h-8 text-muted-foreground mb-2" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                          )}
                          <span className="text-[10px] font-medium text-muted-foreground uppercase">{asset.subType.replace('primary_', '').replace('_', ' ')}</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border">
                          <Layout className="w-3.5 h-3.5" />
                          Edit in Canvas
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
          </div>
        </div>
      )}
      <div className="space-y-8 mt-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Your Brand Kit</h2>
          <p className="text-muted-foreground">Select a category to manage and design your brand assets.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Social Media",
              description: "Ready-to-post designs for Instagram, YouTube, and more.",
              href: `/dashboard/my-brands/${brand._id}/social`,
              icon: Share2,
              color: "bg-blue-500/10",
              textColor: "text-blue-600",
              count: brand.assets?.filter((a: any) => a.category?.includes('social') || a.category?.includes('youtube')).length || 0,
            },
            {
              title: "Marketing Materials",
              description: "Professional flyers, ads, and promotional content.",
              href: `/dashboard/my-brands/${brand._id}/marketing`,
              icon: FileText,
              color: "bg-purple-500/10",
              textColor: "text-purple-600",
              count: brand.assets?.filter((a: any) => a.category?.includes('marketing') || a.category?.includes('flyer')).length || 0,
            },
            {
              title: "Branding Assets",
              description: "Business cards, logos, and core identity items.",
              href: `/dashboard/my-brands/${brand._id}/branding`,
              icon: Palette,
              color: "bg-orange-500/10",
              textColor: "text-orange-600",
              count: brand.assets?.filter((a: any) => a.category?.includes('branding') || a.category?.includes('business') || a.category === 'logo').length || 0,
            }
          ].map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => router.push(cat.href)}
              className="cursor-pointer group"
            >
              <Card className="h-full border-border/50 bg-card/50 hover:bg-card transition-all duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-2xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <cat.icon className={`w-6 h-6 ${cat.textColor}`} />
                  </div>
                  <CardTitle className="text-xl font-bold">{cat.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {cat.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {cat.count} ASSETS GENERATED
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Brand Identity / Color Strategy */}
      {brand.identity && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <Card className="lg:col-span-2 rounded-3xl border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6">
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Visual Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Core Palette</h4>
                  <div className="flex flex-wrap gap-4">
                    <div className="space-y-2">
                      <div className="w-20 h-20 rounded-2xl shadow-inner border border-black/5" style={{ backgroundColor: brand.identity.primary_color }} />
                      <p className="text-xs font-mono text-center">{brand.identity.primary_color}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-20 h-20 rounded-2xl shadow-inner border border-black/5" style={{ backgroundColor: brand.identity.secondary_color }} />
                      <p className="text-xs font-mono text-center">{brand.identity.secondary_color}</p>
                    </div>
                    {brand.identity.accent_color && (
                      <div className="space-y-2">
                        <div className="w-20 h-20 rounded-2xl shadow-inner border border-black/5" style={{ backgroundColor: brand.identity.accent_color }} />
                        <p className="text-xs font-mono text-center">{brand.identity.accent_color}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Typography & Rules</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground italic">
                    "{brand.identity.visual_style_rules}"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border shadow-sm bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="">Quick Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm py-2 border-b border-primary/10">
                <span className="text-muted-foreground">Archetype</span>
                <span className="font-bold capitalize">{brand.strategy?.archetype || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-2 border-b border-primary/10">
                <span className="text-muted-foreground">Assets</span>
                <span className="font-bold">{brand.assets?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-2">
                <span className="text-muted-foreground">Style</span>
                <span className="font-bold capitalize">{brand.identity?.visual_style || "Minimal"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
