"use client";

import { useParams } from "next/navigation";
import { PolotnoTemplateGrid } from "@/components/dashboard/shared/polotno-template-grid";

export default function CardsPage() {
  const { brandId } = useParams();

  return (
    <PolotnoTemplateGrid
      brandId={brandId as string}
      categoryId="cards"
      title="Cards"
      description="Choose a template to customize in the editor."
    />
  );
}
