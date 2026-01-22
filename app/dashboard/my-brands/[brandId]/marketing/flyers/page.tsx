"use client";

import { useParams } from "next/navigation";
import { AssetCategoryView } from "@/components/dashboard/shared/asset-category-view";

export default function FlyersPage() {
  const { brandId } = useParams();

  return (
    <AssetCategoryView
      brandId={brandId as string}
      category="marketing"
      title="Marketing Flyers"
      description="5 professional flyer designs for your brand's promotional needs."
      aspectRatio="portrait"
    />
  );
}
