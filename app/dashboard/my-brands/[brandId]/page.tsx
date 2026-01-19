"use client";

import { useBrand } from "@/components/providers/brand-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Palette, Image as ImageIcon, Share2, FileText, Settings, ArrowRight, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditBrandDialog } from "@/components/dashboard/shared/edit-brand-dialog";
import { BrandOnboardingDialog } from "@/components/dashboard/brand-onboarding-dialog";
import { useEffect } from "react";

export default function BrandDashboardPage() {
  const brand = useBrand();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show onboarding if industry is missing (undefined, null, or empty string)
    if (!brand.industry || brand.industry.trim() === "") {
      setIsOnboardingOpen(true);
    }
  }, [brand.industry]);

  // Get primary color from identity
  const primaryColor = brand.identity?.primary_color || "#2563eb";

  return (
    <div className="space-y-8 pb-12">
      {/* Brand Overview */}
      <div className="flex items-start justify-between bg-white p-8 rounded-3xl border shadow-sm">
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{brand.name}</h1>
            {brand.description && (
              <p className="text-muted-foreground mt-2 max-w-2xl text-lg leading-relaxed">
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
        brandId={brand._id}
        brandName={brand.name}
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          router.refresh();
        }}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Assets</CardDescription>
            <CardTitle className="text-3xl">{brand.assets?.length || 0}</CardTitle>
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
            <CardTitle className="text-lg capitalize">
              {brand.strategy?.archetype || "Not set"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Created</CardDescription>
            <CardTitle className="text-lg">
              {new Date(brand.createdAt).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Your Brand Kit */}
      <div className="space-y-12">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Your Brand Kit</h2>
          <p className="text-muted-foreground text-lg">Everything you need to grow your brand, all in one place.</p>
        </div>

        {[
          {
            title: "Social Media",
            description: "Ready-to-post designs for all major platforms",
            items: [
              { name: "Social Stories", count: "+100", desc: "Customizable story templates", href: `/dashboard/my-brands/${brand._id}/social/social-stories`, category: "social_story" },
              { name: "Social Posts", count: "+100", desc: "Ready-to-post designs", href: `/dashboard/my-brands/${brand._id}/social/social-posts`, category: "social_post" },
              { name: "Social Covers", count: "+50", desc: "High-quality profile and cover images", href: `/dashboard/my-brands/${brand._id}/social/social-covers-profiles`, category: "social_cover" },
              { name: "YouTube Thumbnails", count: "+50", desc: "Eye-catching thumbnails", href: `/dashboard/my-brands/${brand._id}/social/youtube-thumbnails`, category: "youtube_thumbnail" },
            ]
          },
          {
            title: "Marketing Materials",
            description: "Professional assets for your marketing campaigns",
            items: [
              { name: "Marketing Ads", count: "+50", desc: "High-conversion ad designs", href: `/dashboard/my-brands/${brand._id}/marketing/ads`, category: "marketing" },
              { name: "Flyers & Posters", count: "+50", desc: "Print-ready marketing material", href: `/dashboard/my-brands/${brand._id}/marketing/flyers`, category: "marketing" },
              { name: "Business Posters", count: "+50", desc: "Large format designs", href: `/dashboard/my-brands/${brand._id}/marketing/posters`, category: "marketing" },
              { name: "ID Cards", count: "+20", desc: "Professional identification", href: `/dashboard/my-brands/${brand._id}/marketing/id-cards`, category: "marketing" },
              { name: "Marketing Cards", count: "+50", desc: "Themed cards and stationary", href: `/dashboard/my-brands/${brand._id}/marketing/cards`, category: "marketing" },
            ]
          },
          {
            title: "Branding Assets",
            description: "Core identity assets for your business",
            items: [
              { name: "Brand Book", count: "", desc: "Detailed brand guidelines", href: `/dashboard/my-brands/${brand._id}/branding/brand-book`, category: "branding" },
              { name: "Business Cards", count: "+50", desc: "Professional business cards", href: `/dashboard/my-brands/${brand._id}/branding/business-cards`, category: "branding" },
              { name: "Letterheads", count: "+50", desc: "Letterheads(Microsoft word)", href: `/dashboard/my-brands/${brand._id}/branding/letterheads`, category: "branding" },
              { name: "Email Signatures", count: "+10", desc: "Branded email footers", href: `/dashboard/my-brands/${brand._id}/branding/email-signature`, category: "branding" },
              { name: "Favicon Pack", count: "+5", desc: "Digital markers for web", href: `/dashboard/my-brands/${brand._id}/branding/favicon-pack`, category: "branding" },
              { name: "Brand License", count: "", desc: "Commercial usage rights", href: `/dashboard/my-brands/${brand._id}/branding/license`, category: "branding" },
            ]
          }
        ].map((section, sIndex) => (
          <div key={sIndex} className="space-y-6">
            <div className="flex items-end justify-between border-b pb-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight">{section.title}</h3>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {section.items.map((item, iIndex) => {
                const asset = brand.assets?.find(a => a.category === item.category);
                return (
                  <motion.div
                    key={iIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (sIndex * 4 + iIndex) * 0.05 }}
                    onClick={() => router.push(item.href)}
                  >
                    <Card className="overflow-hidden border shadow-sm hover:shadow-xl transition-all group cursor-pointer bg-white rounded-2xl flex flex-col h-full border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                      <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                        {asset ? (
                          <img
                            src={asset.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 transition-colors">
                            <Sparkles className="h-8 w-8 text-primary/20 group-hover:text-primary/40 transition-colors" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <CardContent className="p-6 flex-grow flex flex-col space-y-1.5">
                        <h4 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">
                          {item.name}
                        </h4>
                        {item.count && (
                          <p className="text-primary font-bold text-sm">
                            {item.count}
                          </p>
                        )}
                        <p className="text-[13px] text-muted-foreground leading-snug">
                          {item.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Brand Identity / Color Strategy */}
      {brand.identity && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              <CardTitle className="text-lg">Quick Summary</CardTitle>
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
