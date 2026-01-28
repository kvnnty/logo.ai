"use client";

import { getCredits } from "@/app/actions/credits-actions";
import { BrandOnboardingDialog } from "@/components/dashboard/brand-onboarding-dialog";
import { BrandCanvasEditor } from "@/components/dashboard/canvas/brand-canvas-editor";
import { EditBrandDialog } from "@/components/dashboard/shared/edit-brand-dialog";
import { TemplateCards } from "@/components/dashboard/shared/template-cards";
import { useBrand } from "@/components/providers/brand-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { getPrimaryLogoUrl } from "@/lib/utils/brand-utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Download,
  Edit,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  Plus,
  Settings,
  Sparkles,
  Zap
} from "lucide-react";
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
  const [activeEditorAsset, setActiveEditorAsset] = useState<{ sceneData: any, assetId: string } | null>(null);
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
  const secondaryColor = brand.identity?.secondary_color || "#ffffff";

  // Count assets by category
  const assetCounts = {
    logos: brand.assets?.filter((a: any) => a.category === 'logo').length || 0,
    social: brand.assets?.filter((a: any) => ['social_post', 'social_story', 'social_cover', 'youtube_thumbnail'].includes(a.category)).length || 0,
    branding: brand.assets?.filter((a: any) => ['business_card', 'letterhead', 'email_signature'].includes(a.category)).length || 0,
    marketing: brand.assets?.filter((a: any) => ['marketing_flyer', 'ads'].includes(a.category)).length || 0,
  };

  const totalAssets = Object.values(assetCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header Section */}
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
                    {totalAssets} assets
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push(`/dashboard/my-brands/${brand._id}/link-in-bio`)}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Link in Bio
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Progression Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: 1,
              title: "Create",
              description: "Generate logos & assets",
              icon: Sparkles,
              href: `/dashboard/my-brands/${brand._id}/create`,
              count: assetCounts.logos
            },
            {
              step: 2,
              title: "Customize",
              description: "Edit in canvas",
              icon: Edit,
              href: `/dashboard/my-brands/${brand._id}/my-designs`,
              count: totalAssets
            },
            {
              step: 3,
              title: "Export",
              description: "Download assets",
              icon: Download,
              href: `/dashboard/my-brands/${brand._id}/my-designs`,
              count: 0
            },
            {
              step: 4,
              title: "Publish",
              description: "Share & deploy",
              icon: LinkIcon,
              href: `/dashboard/my-brands/${brand._id}/link-in-bio`,
              count: 0
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  className="cursor-pointer hover:border-primary/50 transition-all group"
                  onClick={() => router.push(item.href)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      {item.count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {item.count}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Asset Overview Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logos Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Logos</CardTitle>
                    <CardDescription>Your brand identity</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/dashboard/my-brands/${brand._id}/my-designs`)}
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {assetCounts.logos > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {brand.assets
                    ?.filter((a: any) => a.category === 'logo')
                    .slice(0, 4)
                    .map((asset: any, idx: number) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg border bg-white p-4 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors group"
                        onClick={() => setActiveEditorAsset({ sceneData: asset.sceneData, assetId: asset._id })}
                      >
                        {asset.imageUrl ? (
                          <img
                            src={asset.imageUrl}
                            alt={asset.subType}
                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="text-center opacity-50">
                            <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-xs">{asset.subType}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mb-4">No logos yet</p>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/dashboard/my-brands/${brand._id}/create`)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Logo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Brand Kit Templates */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Brand Kit</CardTitle>
                    <CardDescription>160+ professional templates</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/dashboard/my-brands/${brand._id}/my-designs`)}
                >
                  Browse
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: "Social Posts", count: assetCounts.social, category: "social_post" },
                  { title: "Business Cards", count: assetCounts.branding, category: "business_card" },
                  { title: "Marketing", count: assetCounts.marketing, category: "marketing_flyer" },
                  { title: "More Templates", count: 0, category: "all" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border bg-gradient-to-br from-card to-muted/30 cursor-pointer hover:border-primary/50 transition-all group"
                    onClick={() => {
                      if (item.category === 'all') {
                        router.push(`/dashboard/my-brands/${brand._id}/my-designs`);
                      } else {
                        toast({
                          title: "Coming Soon",
                          description: `${item.title} templates will be available soon`
                        });
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      {item.count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {item.count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.category === "all" ? "View all templates" : "Ready to customize"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Cards */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Get Started</h2>
            <p className="text-muted-foreground">
              Choose a template to get started with your brand
            </p>
          </div>
          <TemplateCards
            logoUrl={logoUrl}
            brandName={brand.name}
            email={brand.contactInfo?.email}
            domainName={brand.contactInfo?.website?.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            primaryColor={primaryColor}
            onDomainClick={() => {
              // TODO: Navigate to domains page when implemented
              toast({ title: "Coming Soon", description: "Domain management will be available soon" });
            }}
            onEmailClick={() => {
              // TODO: Navigate to business email page when implemented
              toast({ title: "Coming Soon", description: "Business email setup will be available soon" });
            }}
            onSignatureClick={() => router.push(`/dashboard/my-brands/${brand._id}/branding/email-signature`)}
          />
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto flex-col py-4 gap-2"
                onClick={() => router.push(`/dashboard/my-brands/${brand._id}/create`)}
              >
                <Sparkles className="h-5 w-5" />
                <span className="text-xs">Generate Logo</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col py-4 gap-2"
                onClick={() => router.push(`/dashboard/my-brands/${brand._id}/my-designs`)}
              >
                <Layers className="h-5 w-5" />
                <span className="text-xs">My Designs</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col py-4 gap-2"
                onClick={() => router.push(`/dashboard/my-brands/${brand._id}/link-in-bio`)}
              >
                <LinkIcon className="h-5 w-5" />
                <span className="text-xs">Link in Bio</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col py-4 gap-2"
                onClick={() => router.push(`/dashboard/credits`)}
              >
                <Zap className="h-5 w-5" />
                <span className="text-xs">Buy Credits</span>
              </Button>
            </div>
          </CardContent>
        </Card>
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
          onClose={() => setActiveEditorAsset(null)}
        />
      )}
    </div>
  );
}
