"use client";

import { useParams } from "next/navigation";
import { PolotnoTemplateGrid } from "@/components/dashboard/shared/polotno-template-grid";

export default function AdsPage() {
  const { brandId } = useParams();

  return (
    <PolotnoTemplateGrid
      brandId={brandId as string}
      categoryId="ads"
      title="Ads"
      description="Choose a template to customize in the editor."
    />
  );
}
