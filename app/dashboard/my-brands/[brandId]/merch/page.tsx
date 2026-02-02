"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { PolotnoTemplateGrid } from "@/components/dashboard/shared/polotno-template-grid";

export default function MerchPage() {
  const { brandId } = useParams();

  return (
    <div>
      <PageHeader
        heading="Merchandise"
        description="Start from a template and customize it in the editor for merch and products."
      />
      <PolotnoTemplateGrid
        brandId={brandId as string}
        categoryId="merch"
        title="Templates"
        description="Choose a template to customize in the editor."
      />
    </div>
  );
}
