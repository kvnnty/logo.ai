"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { getTemplates } from "@/app/actions/template-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplatePreview } from "./template-preview";
import type { AssetCategory } from "@/lib/templates/brand-kit-templates";

interface TemplatePreviewCardProps {
  category: string;
  primaryColor?: string;
  secondaryColor?: string;
  brandName?: string;
  logoUrl?: string;
  onClick?: () => void;
  className?: string;
}

const ASSET_CATEGORIES: AssetCategory[] = [
  "business_card", "social_post", "social_story", "youtube_thumbnail", "marketing_flyer",
  "letterhead", "email_signature", "ads", "favicon", "brand_book", "branding_license",
  "social_cover", "social_profile", "marketing_poster", "id_card",
];

export function TemplatePreviewCard({
  category,
  primaryColor = "#2563eb",
  secondaryColor,
  brandName = "Brand",
  logoUrl,
  onClick,
  className = "",
}: TemplatePreviewCardProps) {
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplate() {
      try {
        const result = await getTemplates(category);
        if (result.success && result.templates && result.templates.length > 0) {
          setTemplate(result.templates[0]);
        }
      } catch (error) {
        console.error("Failed to fetch template:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplate();
  }, [category]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-0">
          <Skeleton className="w-full aspect-video rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // When DB has no preview image, render live preview from in-code template
  if (!template?.previewImageUrl) {
    const safeCategory = ASSET_CATEGORIES.includes(category as AssetCategory) ? (category as AssetCategory) : "business_card";
    return (
      <Card
        className={`overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${className}`}
        onClick={onClick}
      >
        <CardContent className="p-0">
          <div className="w-full aspect-video rounded-lg overflow-hidden flex items-center justify-center bg-muted/30">
            <TemplatePreview
              category={safeCategory}
              brandName={brandName}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor ?? primaryColor}
              logoUrl={logoUrl}
              className="w-full h-full object-contain"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${className}`} onClick={onClick}>
      <CardContent className="p-0">
        <div
          className="w-full rounded-lg overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: primaryColor, minHeight: "200px" }}
        >
          <img
            src={template.previewImageUrl}
            alt={template.name || "Template Preview"}
            className="w-full h-auto object-contain"
            style={{ mixBlendMode: "normal" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
