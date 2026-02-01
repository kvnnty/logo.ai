import Link from "next/link";
import { getPublicBrands } from "@/app/actions/brand-actions";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Navbar from "@/components/landing/navbar";

export const metadata: Metadata = {
  title: "Brand directory | LogoAIpro",
  description: "Browse brands created on LogoAIpro. Get inspiration from logos and brand guidelines.",
  openGraph: {
    title: "Brand directory | LogoAIpro",
    description: "Browse brands created on LogoAIpro.",
  },
};

export default async function BrandDirectoryPage() {
  const result = await getPublicBrands({ limit: 48 });
  const brands = result.success ? result.brands : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 mt-16 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <section className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Brand directory
          </h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            Browse brands created on our platform. Each brand has a unique public page with logos, colors, and guidelines.
          </p>
        </section>

        {brands.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-16 px-6 text-center">
            <p className="text-muted-foreground mb-2 font-semibold">No public brands yet.</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Brands appear here when their owners allow their brands to be listed publicly. Design your brand and make it public to be featured.
            </p>
            <Link
              href="/dashboard/my-brands/create"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors mt-4"
            >
              Create your brand
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {brands.map((brand) => (
              <Link
                key={brand._id}
                href={`/brand/${brand.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
              >
                <div className="aspect-square bg-muted/30 flex items-center justify-center p-6">
                  {brand.primaryLogoUrl ? (
                    <img
                      src={brand.primaryLogoUrl}
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-muted-foreground/50">
                      {brand.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-1">
                  <h2 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {brand.name}
                  </h2>
                  {brand.industry && (
                    <p className="text-xs text-muted-foreground capitalize">{brand.industry}</p>
                  )}
                  {brand.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {brand.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <section className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm mb-2">Design your own brand and get featured on our public page.</p>
          <Link
            href="/dashboard/my-brands/create"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get started with LogoAIpro
          </Link>
        </section>
      </main>

      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/my-brands/create" className="hover:text-foreground transition-colors">
            © {new Date().getFullYear()} LogoAIpro
          </Link>
          <Link href="/brand-directory" className="hover:text-foreground transition-colors">
            Brand directory
          </Link>
        </div>
      </footer>
    </div>
  );
}
