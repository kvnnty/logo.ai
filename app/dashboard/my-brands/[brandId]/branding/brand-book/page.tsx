"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { checkHistory } from "@/app/actions/brand-actions";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrandBookPage() {
  const [brandData, setBrandData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBrandData() {
      try {
        const history = await checkHistory();
        if (history && history.length > 0) {
          // Use the most recent logo for brand book
          setBrandData(history[0]);
        }
      } catch (error) {
        console.error("Failed to fetch brand data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBrandData();
  }, []);

  const primaryColor = brandData?.primary_color || "#2563EB";
  const backgroundColor = brandData?.background_color || "#FFFFFF";

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <PageHeader
        heading="Brand Book"
        description="Your official brand guidelines including logo usage, colors, and typography."
      >
        <Button variant="outline">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </PageHeader>

      <div className="grid gap-8">
        {/* Logo Section */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">1. Logo Guidelines</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Primary Logo</CardTitle>
              </CardHeader>
              <CardContent className="min-h-[300px] flex items-center justify-center bg-gray-50 border-t">
                {loading ? (
                  <Skeleton className="h-40 w-40 rounded-full" />
                ) : brandData?.image_url ? (
                  <img src={brandData.image_url} alt="Brand Logo" className="w-48 h-48 object-contain" />
                ) : (
                  <div className="text-muted-foreground">No logo generated yet</div>
                )}
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Dark Mode / Inverted</CardTitle>
              </CardHeader>
              <CardContent className="min-h-[300px] flex items-center justify-center bg-gray-900 border-t">
                {loading ? (
                  <Skeleton className="h-40 w-40 rounded-full opacity-20" />
                ) : brandData?.image_url ? (
                  <img src={brandData.image_url} alt="Brand Logo Inverted" className="w-48 h-48 object-contain contrast-125 brightness-150" />
                ) : (
                  <div className="text-gray-500">No logo generated yet</div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-semibold mb-2">Clear Space</div>
                <p className="text-xs text-muted-foreground">Always maintain minimum clear space around the logo equivalent to 50% of the logo height to ensure visibility and impact.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-semibold mb-2">Minimum Size</div>
                <p className="text-xs text-muted-foreground">Digital: 32px height<br />Print: 0.5 inches height<br />Do not scale below these dimensions.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-semibold mb-2">Usage Violations</div>
                <p className="text-xs text-muted-foreground">Do not stretch, distort, rotate, or apply dropshadows to the logo. Avoid placing on busy backgrounds.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">2. Color Palette</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div
                className="h-32 rounded-xl shadow-sm border"
                style={{ backgroundColor: primaryColor }}
              />
              <div>
                <div className="font-semibold">Primary Brand</div>
                <div className="text-xs text-muted-foreground uppercase">{primaryColor}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div
                className="h-32 rounded-xl shadow-sm border"
                style={{ backgroundColor: backgroundColor }}
              />
              <div>
                <div className="font-semibold">Background</div>
                <div className="text-xs text-muted-foreground uppercase">{backgroundColor}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-32 rounded-xl shadow-sm border bg-gray-900" />
              <div>
                <div className="font-semibold">Neutral Black</div>
                <div className="text-xs text-muted-foreground uppercase">#111827</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-32 rounded-xl shadow-sm border bg-gray-100" />
              <div>
                <div className="font-semibold">Neutral Gray</div>
                <div className="text-xs text-muted-foreground uppercase">#F3F4F6</div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">3. Typography</h3>
          <Card>
            <CardContent className="p-8 space-y-8">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Primary Typeface</div>
                <div className="text-4xl font-bold">Inter</div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <div className="font-bold mb-1">Bold</div>
                    <div className="text-sm text-muted-foreground">Headlines & Emphasis</div>
                    <p className="mt-2 text-2xl font-bold">Aa Bb Cc</p>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Medium</div>
                    <div className="text-sm text-muted-foreground">Subheadings</div>
                    <p className="mt-2 text-2xl font-medium">Aa Bb Cc</p>
                  </div>
                  <div>
                    <div className="font-normal mb-1">Regular</div>
                    <div className="text-sm text-muted-foreground">Body Text</div>
                    <p className="mt-2 text-2xl font-normal">Aa Bb Cc</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
