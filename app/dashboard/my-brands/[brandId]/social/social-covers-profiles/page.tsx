"use client";

import { useParams } from "next/navigation";
import { PolotnoTemplateGrid } from "@/components/dashboard/shared/polotno-template-grid";

export default function SocialCoversProfilesPage() {
  const { brandId } = useParams();

  return (
    <PolotnoTemplateGrid
      brandId={brandId as string}
      categoryId="social_cover"
      title="Social Covers & Profiles"
      description="Choose a template to customize in the editor."
    />
  );
}
