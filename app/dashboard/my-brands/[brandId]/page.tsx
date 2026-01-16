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
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Brand Kit Highlights</h2>
              <p className="text-muted-foreground">A curated selection of your brand's core visual assets.</p>
            </div>
            <Button variant="ghost" className="text-primary hover:text-primary/80 group">
              View full kit <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {brand.assets.slice(0, 8).map((asset, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group cursor-pointer bg-white rounded-2xl">
                  <div className="aspect-[4/3] bg-muted relative">
                    <img
                      src={asset.imageUrl}
                      alt={`${brand.name} ${asset.category}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardContent className="p-4 bg-white">
                    <p className="font-bold text-sm tracking-tight capitalize mb-0.5">
                      {asset.category?.replace("_", " ")}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                      {asset.subType?.replace("_", " ")}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
