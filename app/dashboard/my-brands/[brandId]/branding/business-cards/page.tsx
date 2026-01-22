"use client";

import { useParams } from "next/navigation";
import { AssetCategoryView } from "@/components/dashboard/shared/asset-category-view";

export default function BusinessCardsPage() {
  const { brandId } = useParams();

  return (
    <AssetCategoryView
      brandId={brandId as string}
      category="branding"
      title="Business Cards"
      description="5 unique business card designs maintaining your brand's professional identity."
      aspectRatio="video"
    />
  );
}
