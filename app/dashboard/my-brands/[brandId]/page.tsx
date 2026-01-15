"use client";

import { useBrand } from "@/components/providers/brand-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Palette, Image as ImageIcon, Share2, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function BrandDashboardPage() {
  const brand = useBrand();

  // Get primary color from identity
  const primaryColor = brand.identity?.primary_color || "#2563eb";

  return (
    <div className="space-y-8">
      {/* Brand Overview */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">{brand.name}</h1>
          {brand.description && (
            <p className="text-muted-foreground mt-2 max-w-2xl">
              {brand.description}
            </p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl shadow-lg"
          style={{ backgroundColor: primaryColor }}
        />
      </div>

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

      {/* Assets Grid */}
      {brand.assets && brand.assets.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Brand Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brand.assets.map((asset, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <div className="aspect-square bg-muted">
                    <img
                      src={asset.imageUrl}
                      alt={`${brand.name} ${asset.type}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="font-medium capitalize">{asset.type.replace("_", " ")}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No assets yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate your first brand asset to get started.
            </p>
            <Button>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Assets
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Brand Identity Summary - if available */}
      {brand.identity && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Brand Identity</h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Palette className="h-4 w-4" /> Color Palette
                  </h3>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded-lg border"
                      style={{ backgroundColor: brand.identity.primary_color }}
                      title="Primary"
                    />
                    <div
                      className="w-10 h-10 rounded-lg border"
                      style={{ backgroundColor: brand.identity.secondary_color }}
                      title="Secondary"
                    />
                    {brand.identity.accent_color && (
                      <div
                        className="w-10 h-10 rounded-lg border"
                        style={{ backgroundColor: brand.identity.accent_color }}
                        title="Accent"
                      />
                    )}
                  </div>
                </div>
                {brand.identity.visual_style_rules && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Visual Style
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {brand.identity.visual_style_rules}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
