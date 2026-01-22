"use client";

import { useParams } from "next/navigation";
import { AssetCategoryView } from "@/components/dashboard/shared/asset-category-view";

export default function LetterheadsPage() {
  const { brandId } = useParams();

  return (
    <AssetCategoryView
      brandId={brandId as string}
      category="branding"
      title="Brand Letterheads"
      description="5 official letterhead templates for your corporate communication."
      aspectRatio="portrait"
    />
  );
}
