"use client";

import { useParams } from "next/navigation";
import { AssetCategoryView } from "@/components/dashboard/shared/asset-category-view";

export default function AdsPage() {
  const { brandId } = useParams();

  return (
    <AssetCategoryView
      brandId={brandId as string}
      category="marketing"
      title="Marketing Ads"
      description="20 high-converting ad templates designed for various platforms."
      aspectRatio="video"
    />
  );
}
