"use client";

import { useParams } from "next/navigation";
import { PolotnoTemplateGrid } from "@/components/dashboard/shared/polotno-template-grid";

export default function YoutubeThumbnailsPage() {
  const { brandId } = useParams();

  return (
    <PolotnoTemplateGrid
      brandId={brandId as string}
      categoryId="youtube_thumbnail"
      title="YouTube Thumbnails"
      description="Choose a template to customize in the editor."
    />
  );
}
