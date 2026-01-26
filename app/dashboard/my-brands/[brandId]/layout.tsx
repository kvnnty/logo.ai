import { getBrandById } from "@/app/actions/actions";
import { BrandProvider } from "@/components/providers/brand-provider";
import { notFound } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/sidebar";
import DashboardTopbar from "@/components/dashboard/topbar";

export default async function BrandLayout({
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
      <div className="h-screen flex-1 flex flex-col overflow-hidden">
        <DashboardSidebar brandId={brandId} brandName={result.brand.name} />
        <div className="flex-1 lg:ml-72 flex flex-col p-4 overflow-hidden">
          <div className="flex-1 flex flex-col border border-border/50 rounded-xl sm:rounded-2xl bg-card overflow-hidden">
            <DashboardTopbar />
            <main className="flex-1 overflow-y-auto p-4">
              {children}
            </main>
          </div>
        </div>
      </div>
    </BrandProvider>
  );
}
