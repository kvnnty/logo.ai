"use client";

import { useParams } from "next/navigation";
import { AssetCategoryView } from "@/components/dashboard/shared/asset-category-view";

export default function SocialStoriesPage() {
  const { brandId } = useParams();

  return (
    <AssetCategoryView
      brandId={brandId as string}
      category="social_story"
      title="Social Media Stories"
      description="5 vertical story templates designed to keep your brand looking fresh and engaging."
      aspectRatio="portrait"
    />
  );
}
