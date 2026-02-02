import { getBrandById } from "@/app/actions/brand-actions";
import { BrandProvider } from "@/components/providers/brand-provider";
import { notFound } from "next/navigation";

export default async function EditorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;
  const result = await getBrandById(brandId);

  if (!result.success || !result.brand) {
    notFound();
  }

  return (
    <BrandProvider brand={result.brand}>
      <div className="h-screen w-screen overflow-hidden">
        {children}
      </div>
    </BrandProvider>
  );
}
