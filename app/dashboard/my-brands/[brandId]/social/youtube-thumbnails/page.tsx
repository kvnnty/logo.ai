"use client";

import { useParams } from "next/navigation";
import { AssetCategoryView } from "@/components/dashboard/shared/asset-category-view";

export default function YoutubeThumbnailsPage() {
  const { brandId } = useParams();

  return (
    <AssetCategoryView
      brandId={brandId as string}
      category="youtube_thumbnail"
      title="YouTube Thumbnails"
      description="20 high-impact thumbnails designed to drive clicks and maintain brand consistency."
      aspectRatio="video"
    />
  );
}
