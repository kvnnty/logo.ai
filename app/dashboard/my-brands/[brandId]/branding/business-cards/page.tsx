"use client";

import { useParams } from "next/navigation";
import { PolotnoTemplateGrid } from "@/components/dashboard/shared/polotno-template-grid";

export default function BusinessCardsPage() {
  const { brandId } = useParams();

  return (
    <PolotnoTemplateGrid
      brandId={brandId as string}
      categoryId="business_card"
      title="Business Cards"
      description="Choose a template to customize in the editor."
    />
  );
}
