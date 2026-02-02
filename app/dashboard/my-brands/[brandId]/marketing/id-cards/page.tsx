"use client";

import { useParams } from "next/navigation";
import { PolotnoTemplateGrid } from "@/components/dashboard/shared/polotno-template-grid";

export default function IDCardsPage() {
  const { brandId } = useParams();

  return (
    <PolotnoTemplateGrid
      brandId={brandId as string}
      categoryId="id_card"
      title="ID Cards & Badges"
      description="Choose a template to customize in the editor."
    />
  );
}
