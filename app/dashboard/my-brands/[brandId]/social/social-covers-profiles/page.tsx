"use client";

import { useParams } from "next/navigation";
import { AssetCategoryView } from "@/components/dashboard/shared/asset-category-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SocialCoversProfilesPage() {
  const { brandId } = useParams();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="covers" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="covers">Social Covers</TabsTrigger>
          <TabsTrigger value="profiles">Profile Pictures</TabsTrigger>
        </TabsList>
        <TabsContent value="covers">
          <AssetCategoryView
            brandId={brandId as string}
            category="social_cover"
            title="Social Media Covers"
            description="20 professional horizontal covers for your Facebook, LinkedIn, and Twitter profiles."
            aspectRatio="video"
          />
        </TabsContent>
        <TabsContent value="profiles">
          <AssetCategoryView
            brandId={brandId as string}
            category="social_profile"
            title="Profile Pictures"
            description="20 square/circular profile avatars optimized for all social platforms."
            aspectRatio="square"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
