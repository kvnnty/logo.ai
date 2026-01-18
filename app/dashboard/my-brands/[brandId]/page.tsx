"use client";

import { useBrand } from "@/components/providers/brand-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Palette, Image as ImageIcon, Share2, FileText, Settings, ArrowRight, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditBrandDialog } from "@/components/dashboard/shared/edit-brand-dialog";

export default function BrandDashboardPage() {
  const brand = useBrand();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();

  // Get primary color from identity
  const primaryColor = brand.identity?.primary_color || "#2563eb";

  return (
    <div className="space-y-8 pb-12">
      {/* Brand Overview */}
      <div className="flex items-start justify-between bg-white p-8 rounded-3xl border shadow-sm">
        <div className="space-y-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{brand.name}</h1>
            {brand.description && (
              <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
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
            <Button variant="outline" size="sm" className="rounded-full px-4">
              <Share2 className="h-4 w-4 mr-2" />
              Share Kit
            </Button>
          </div>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-2xl shadow-xl flex items-center justify-center relative overflow-hidden group"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors" />
          <Palette className="h-8 w-8 text-white relative z-10" />
        </motion.div>
      </div>

      <EditBrandDialog
        brand={brand}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => router.refresh()}
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

      {/* Brand Kit Highlights */}
      {brand.assets && brand.assets.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold tracking-tight">Your Brand Kit</h2>
              <p className="text-xs text-muted-foreground">Complete branding assets generated for your identity.</p>
            </div>
            <Button variant="ghost" className="text-primary hover:text-primary/80 group">
              View full kit <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: "social-stories",
                title: "Social Stories",
                count: "+100",
                description: "Customizable story templates",
                category: "social_story",
                href: `/dashboard/my-brands/${brand._id}/social/social-stories`,
              },
              {
                id: "social-posts",
                title: "Social Posts",
                count: "+100",
                description: "Ready-to-post designs",
                category: "social_post",
                href: `/dashboard/my-brands/${brand._id}/social/social-posts`,
              },
              {
                id: "social-covers-profiles",
                title: "Covers & Profiles",
                count: "+30",
                description: "Brand-aligned headers & icons",
                category: "social_cover", // mapped to covers
                href: `/dashboard/my-brands/${brand._id}/social/social-covers-profiles`,
              },
              {
                id: "youtube-thumbnails",
                title: "YouTube Thumbnails",
                count: "+50",
                description: "Eye-catching thumbnails",
                category: "youtube_thumbnail",
                href: `/dashboard/my-brands/${brand._id}/social/youtube-thumbnails`,
              },
              {
                id: "business-cards",
                title: "Business Cards",
                count: "+50",
                description: "Professional business cards",
                category: "branding",
                href: `/dashboard/my-brands/${brand._id}/branding/business-cards`,
              },
              {
                id: "letterheads",
                title: "Letterheads",
                count: "+50",
                description: "Letterheads (Microsoft Word)",
                category: "branding",
                href: `/dashboard/my-brands/${brand._id}/branding/letterheads`,
              },
              {
                id: "ads",
                title: "Marketing Ads",
                count: "+50",
                description: "High-conversion ads",
                category: "marketing",
                href: `/dashboard/my-brands/${brand._id}/marketing/ads`,
              },
              {
                id: "flyers",
                title: "Flyers & Brochures",
                count: "+50",
                description: "Print-ready layouts",
                category: "marketing",
                href: `/dashboard/my-brands/${brand._id}/marketing/flyers`,
              },
            ].map((item, index) => {
              // Find a sample asset for this category if it exists
              const sampleAsset = brand.assets?.find((a: any) =>
                a.category === item.category ||
                (item.id === "social-stories" && a.category === "social_story") ||
                (item.id === "social-posts" && a.category === "social_post") ||
                (item.id === "flyers" && a.subType?.includes("flyer")) ||
                (item.id === "ads" && a.subType?.includes("ad"))
              );

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => router.push(item.href)}
                >
                  <Card className="overflow-hidden border shadow-none hover:border-primary/50 transition-all group cursor-pointer bg-white rounded-2xl">
                    <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                      {sampleAsset ? (
                        <img
                          src={sampleAsset.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <ImageIcon className="h-6 w-6 text-primary/20" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-primary shadow-sm">
                        {item.count}
                      </div>
                    </div>
                    <CardContent className="p-4 bg-white">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-sm tracking-tight">{item.title}</h3>
                        <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-white rounded-full p-6 shadow-xl border">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Building your brand kit...</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              We're currently generating your unique brand assets. This will only take a moment.
            </p>
            <div className="flex gap-4">
              <Button className="rounded-full px-8">
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
