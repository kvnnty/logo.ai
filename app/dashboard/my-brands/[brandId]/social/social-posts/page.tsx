"use client";

import { useParams } from "next/navigation";
import { AssetCategoryView } from "@/components/dashboard/shared/asset-category-view";

export default function SocialPostsPage() {
  const { brandId } = useParams();

  return (
    <AssetCategoryView
      brandId={brandId as string}
      category="social_post"
      title="Social Media Posts"
      description="5 high-engagement social media post templates tailored to your brand identity."
      aspectRatio="square"
    />
  );
}
