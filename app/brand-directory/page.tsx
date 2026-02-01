import Link from "next/link";
import { getPublicBrands } from "@/app/actions/brand-actions";
import type { Metadata } from "next";
import Navbar from "@/components/landing/navbar";
import { INDUSTRIES } from "@/lib/industries";

export const metadata: Metadata = {
  title: "Brand directory | LogoAIpro",
  description: "Browse brands created on LogoAIpro. Get inspiration from logos and brand guidelines.",
  openGraph: {
    title: "Brand directory | LogoAIpro",
    description: "Browse brands created on LogoAIpro.",
  },
};

const DIRECTORY_INDUSTRIES: { value: string; label: string }[] = [
  { value: "", label: "All" },
  ...INDUSTRIES.map((i) => ({ value: i.id, label: i.name })),
];

type Brand = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  primaryLogoUrl: string | null;
};

function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/brand/${brand.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center overflow-hidden">
          {brand.primaryLogoUrl ? (
            <img
              src={brand.primaryLogoUrl}
              alt={brand.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-bold text-muted-foreground">
              {brand.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {brand.name}
          </h2>
          {brand.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {brand.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic mt-1">No description</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function AddNewBrandCard() {
  return (
    <Link
      href="/dashboard/my-brands/create"
      className="flex flex-col rounded-2xl border border-dashed border-border bg-card p-5 shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 justify-center min-h-[100px]"
    >
      <p className="font-semibold text-foreground">Featured Brands</p>
      <p className="text-sm text-muted-foreground mt-0.5">
        Get inspired by brands and businesses around the world.
      </p>
      <span className="text-primary font-medium text-sm mt-2 inline-flex items-center gap-1 hover:underline">
        Add new brand →
      </span>
    </Link>
  );
}

export default async function BrandDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string }>;
}) {
  const params = await searchParams;
  const selectedIndustry = params?.industry?.trim() ?? "";

  const isAll = !selectedIndustry;

  const [featuredResult, ...industryResults] = await Promise.all([
    getPublicBrands({ limit: 6 }),
    ...(isAll
      ? [
          getPublicBrands({ industry: "medical-dental", limit: 6 }),
          getPublicBrands({ industry: "restaurant", limit: 6 }),
          getPublicBrands({ industry: "technology", limit: 6 }),
        ]
      : [getPublicBrands({ industry: selectedIndustry, limit: 48 })]),
  ]);

  const featuredBrands: Brand[] = featuredResult.success ? featuredResult.brands : [];
  type BrandResult = { success: boolean; brands: Brand[] };
  const industrySections = isAll
    ? [
        { label: "Medical Dental", value: "medical-dental", brands: (industryResults[0] as BrandResult)?.success ? (industryResults[0] as BrandResult).brands : [] },
        { label: "Restaurant", value: "restaurant", brands: (industryResults[1] as BrandResult)?.success ? (industryResults[1] as BrandResult).brands : [] },
        { label: "Technology", value: "technology", brands: (industryResults[2] as BrandResult)?.success ? (industryResults[2] as BrandResult).brands : [] },
      ]
    : [];
  const filteredBrands: Brand[] = !isAll && industryResults[0]
    ? (industryResults[0] as BrandResult)?.success
      ? (industryResults[0] as BrandResult).brands
      : []
    : [];

  const currentIndustryLabel =
    DIRECTORY_INDUSTRIES.find((i) => i.value === selectedIndustry)?.label ?? selectedIndustry;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 mt-16 w-full flex">
        {/* Sidebar - Browse By Industry */}
        <aside className="hidden lg:block w-56 flex-shrink-0 border-r border-border bg-background py-8 pl-6 pr-4">
          <h2 className="text-sm font-bold text-foreground mb-4">Browse By Industry</h2>
          <nav className="flex flex-col gap-0.5">
            {DIRECTORY_INDUSTRIES.map((item) => {
              const href = item.value ? `/brand-directory?industry=${encodeURIComponent(item.value)}` : "/brand-directory";
              const isActive = (item.value === "" && isAll) || item.value === selectedIndustry;
              return (
                <Link
                  key={item.value || "all"}
                  href={href}
                  className={`block py-2.5 px-3 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 py-8 px-4 sm:px-6 lg:px-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {/* Mobile industry nav */}
            <div className="lg:hidden mb-6">
              <h2 className="text-sm font-bold text-foreground mb-2">Browse By Industry</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 scrollbar-thin">
                {DIRECTORY_INDUSTRIES.map((item) => {
                  const href = item.value ? `/brand-directory?industry=${encodeURIComponent(item.value)}` : "/brand-directory";
                  const isActive = (item.value === "" && isAll) || item.value === selectedIndustry;
                  return (
                    <Link
                      key={item.value || "all"}
                      href={href}
                      className={`flex-shrink-0 py-2 px-3 rounded-lg text-sm transition-colors whitespace-nowrap ${
                        isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted/50 bg-muted/30"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Banner */}
            <section className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-amber-500/10 border border-border/50 p-8 mb-10">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Brand Directory
              </h1>
              <p className="mt-2 text-muted-foreground">
                Get inspiration from brands and businesses around the world.
              </p>
            </section>

            {isAll ? (
              <>
                {/* Featured Brands */}
                <section className="mb-10">
                  <h2 className="text-xl font-bold text-foreground mb-4">Featured Brands</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredBrands.map((brand) => (
                      <BrandCard key={brand._id} brand={brand} />
                    ))}
                    <AddNewBrandCard />
                  </div>
                </section>

                {/* Industry sections */}
                {industrySections.map(
                  (section) =>
                    section.brands.length > 0 && (
                      <section key={section.label} className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-bold text-foreground">{section.label}</h2>
                          <Link
                            href={`/brand-directory?industry=${encodeURIComponent(section.value)}`}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            View More
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {section.brands.map((brand) => (
                            <BrandCard key={brand._id} brand={brand} />
                          ))}
                        </div>
                      </section>
                    )
                )}

                {featuredBrands.length === 0 &&
                  industrySections.every((s) => s.brands.length === 0) && (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-16 px-6 text-center">
                      <p className="text-muted-foreground mb-2 font-semibold">No public brands yet.</p>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Brands appear here when their owners allow their brands to be listed publicly.
                        Design your brand and make it public to be featured.
                      </p>
                      <Link
                        href="/dashboard/my-brands/create"
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors mt-4"
                      >
                        Create your brand
                      </Link>
                    </div>
                  )}
              </>
            ) : (
              <>
                <section className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">{currentIndustryLabel}</h2>
                    <Link
                      href="/brand-directory"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      View All
                    </Link>
                  </div>
                  {filteredBrands.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-12 px-6 text-center">
                      <p className="text-muted-foreground font-medium">No brands in this category yet.</p>
                      <Link
                        href="/brand-directory"
                        className="text-sm text-primary hover:underline mt-2 inline-block"
                      >
                        Browse all brands
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredBrands.map((brand) => (
                        <BrandCard key={brand._id} brand={brand} />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {/* Bottom CTA - Showcase Your Brand */}
            <section className="mt-12 pt-10 pb-12 rounded-2xl bg-muted/50 border border-border/50 text-center px-6">
              <h2 className="text-2xl font-bold text-foreground">Showcase Your Brand</h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Gain exposure and get discovered by a global community. It&apos;s easy to join and get started.
              </p>
              <Link
                href="/dashboard/my-brands/create"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors mt-6"
              >
                Add new brand
              </Link>
            </section>
          </div>
        </main>
      </div>

      <footer className="border-t border-border py-6">
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
