import Link from "next/link";
import { getPublicBrands } from "@/app/actions/brand-actions";
import type { Metadata } from "next";
import Navbar from "@/components/landing/navbar";
import { INDUSTRIES } from "@/lib/industries";
import { ArrowUpRight } from "lucide-react";
import { BrandDirectorySearch } from "./brand-directory-search";

export const metadata: Metadata = {
  title: "Brand directory | LogoAIpro",
  description: "Browse brands created on LogoAIpro. Get inspiration from logos and brand guidelines.",
  openGraph: {
    title: "Brand directory | LogoAIpro",
    description: "Browse brands created on LogoAIpro.",
  },
};

type Brand = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  primaryLogoUrl: string | null;
  primaryColor: string | null;
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function getIndustryLabel(industryId: string): string {
  return INDUSTRIES.find((i) => i.id === industryId)?.name ?? industryId;
}

/** Foggy banner: primary color at low opacity so it feels soft and washed. */
function foggyBannerStyle(primaryColor: string | null): React.CSSProperties {
  if (!primaryColor) {
    return { background: "linear-gradient(135deg, hsl(0 0% 94%) 0%, hsl(0 0% 98%) 100%)" };
  }
  return {
    background: `linear-gradient(135deg, ${primaryColor}22 0%, ${primaryColor}08 50%, ${primaryColor}04 100%)`,
  };
}

function AddYourBrandCard() {
  return (
    <Link
      href="/dashboard/my-brands/create"
      className="group flex flex-col rounded-2xl border border-border/60 overflow-hidden shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-200 min-h-[200px]"
      style={{
        background: "radial-gradient(ellipse 80% 70% at 50% 0%, hsl(210 40% 96%) 0%, hsl(0 0% 100%) 50%)",
      }}
    >
      <div className="relative flex-1 p-5 flex flex-col">
        <div className="flex items-start justify-between">
          <span className="text-3xl" role="img" aria-label="Wave">
            👋
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/80 text-muted-foreground group-hover:bg-muted group-hover:text-foreground transition-colors">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-auto pt-4 text-center">
          <p className="font-semibold text-foreground">Add your brand</p>
          <p className="font-semibold text-foreground">on LogoAIPro</p>
        </div>
      </div>
    </Link>
  );
}

function BrandCard({
  brand,
  showIndustry = false,
}: {
  brand: Brand;
  showIndustry?: boolean;
}) {
  const industryLabel = showIndustry ? getIndustryLabel(brand.industry) : null;
  const handleText = industryLabel ? industryLabel : `@${brand.slug || brand.name.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <Link
      href={`/brand/${brand.slug}`}
      className="group block rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-200"
      title={`Visit ${brand.name}`}
    >
      {/* Header / banner: brand primary color, foggy */}
      <div
        className="relative h-24 w-full"
        style={foggyBannerStyle(brand.primaryColor)}
      />

      {/* Circular logo overlaid at bottom-left of banner */}
      <div className="relative -mt-10 px-4 pb-0">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-background">
          {brand.primaryLogoUrl ? (
            <img
              src={brand.primaryLogoUrl}
              alt={brand.name}
              className="h-full w-full object-contain p-1.5"
            />
          ) : (
            <span className="text-lg font-bold text-muted-foreground">
              {brand.name.charAt(0)}
            </span>
          )}
        </div>
      </div>

      {/* Text: name, handle, description */}
      <div className="px-4 pb-4 pt-1">
        <h2 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {brand.name}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {handleText}
        </p>
        {brand.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5">
            {brand.description}
          </p>
        )}
      </div>
    </Link>
  );
}

export default async function BrandDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string; q?: string }>;
}) {
  const params = await searchParams;
  const selectedIndustry = params?.industry?.trim() ?? "";
  const searchQuery = params?.q?.trim() ?? "";
  const isAll = !selectedIndustry;
  const searchOpt = searchQuery ? { search: searchQuery } : {};

  // Featured: pool of brands, randomized, take 6 (filtered by search when q is set)
  const featuredPoolResult = await getPublicBrands({ limit: 24, ...searchOpt });
  const featuredPool: Brand[] = featuredPoolResult.success ? featuredPoolResult.brands : [];
  const featuredBrands = shuffle(featuredPool).slice(0, 6);

  // Per-industry: fetch all industries in parallel; only show industries that have brands (filtered by search when q is set)
  const industryResults = await Promise.all(
    INDUSTRIES.map(async (ind) => {
      const res = await getPublicBrands({ industry: ind.id, limit: 9, ...searchOpt });
      const brands: Brand[] = res.success ? res.brands : [];
      return { id: ind.id, name: ind.name, brands };
    })
  );
  const industrySections = industryResults.filter((s) => s.brands.length > 0);

  // Single-industry view: when user selected an industry, fetch full list for that category (with search when q is set)
  let filteredBrands: Brand[] = [];
  if (!isAll) {
    const singleRes = await getPublicBrands({ industry: selectedIndustry, limit: 48, ...searchOpt });
    filteredBrands = singleRes.success ? singleRes.brands : [];
  }

  // When user is searching (and on "All" view), show search results in one section
  let searchResults: Brand[] = [];
  if (searchQuery && isAll) {
    const res = await getPublicBrands({ limit: 48, ...searchOpt });
    searchResults = res.success ? res.brands : [];
  }

  const currentIndustryLabel = industrySections.find((s) => s.id === selectedIndustry)?.name ?? selectedIndustry;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 my-24 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero banner - minimal */}
          <section className="rounded-2xl border border-primary/50 bg-primary/10 p-4 sm:p-6 mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Explore brands that are using LogoAIpro
            </h1>
            <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-md">
              Get inspiration from brands and businesses around the world.
            </p>
            <BrandDirectorySearch
              initialQuery={searchQuery}
              industry={selectedIndustry}
            />
          </section>

          {/* Horizontal category tabs - Featured + industries (preserve search q) */}
          <div className="mb-8 -mx-1">
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin min-h-[44px]">
              <Link
                href={searchQuery ? `/brand-directory?q=${encodeURIComponent(searchQuery)}` : "/brand-directory"}
                className={`flex-shrink-0 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${isAll
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "bg-muted/50 text-foreground hover:bg-muted"
                  }`}
              >
                Featured
              </Link>
              {industrySections.map((s) => {
                const isActive = s.id === selectedIndustry;
                const industryHref = searchQuery
                  ? `/brand-directory?industry=${encodeURIComponent(s.id)}&q=${encodeURIComponent(searchQuery)}`
                  : `/brand-directory?industry=${encodeURIComponent(s.id)}`;
                return (
                  <Link
                    key={s.id}
                    href={industryHref}
                    className={`flex-shrink-0 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${isActive
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "bg-muted/50 text-foreground hover:bg-muted"
                      }`}
                  >
                    {s.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {isAll && searchQuery ? (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Search results for &quot;{searchQuery}&quot;
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AddYourBrandCard />
                {searchResults.map((brand) => (
                  <BrandCard key={brand._id} brand={brand} showIndustry />
                ))}
              </div>
              {searchResults.length === 0 && (
                <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/20 py-8 px-6 text-center">
                  <p className="text-muted-foreground font-medium">No brands match your search.</p>
                  <Link
                    href="/brand-directory"
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    Clear search
                  </Link>
                </div>
              )}
            </section>
          ) : isAll ? (
            <>
              <section className="mb-12">
                <h2 className="text-xl font-bold text-foreground mb-4">Featured brands</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <AddYourBrandCard />
                  {featuredBrands.map((brand) => (
                    <BrandCard key={brand._id} brand={brand} showIndustry />
                  ))}
                </div>
              </section>
              {industrySections.map((section) => (
                <section key={section.id} className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">{section.name}</h2>
                    <Link
                      href={searchQuery ? `/brand-directory?industry=${encodeURIComponent(section.id)}&q=${encodeURIComponent(searchQuery)}` : `/brand-directory?industry=${encodeURIComponent(section.id)}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      See all &rarr;
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {section.brands.map((brand) => (
                      <BrandCard key={brand._id} brand={brand} showIndustry />
                    ))}
                  </div>
                </section>
              ))}
              {featuredBrands.length === 0 && industrySections.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-16 px-6 text-center">
                  <p className="text-muted-foreground mb-2 font-semibold">No public brands yet.</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Brands appear here when their owners allow their brands to be listed publicly.
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
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">{currentIndustryLabel}</h2>
                <Link
                  href={searchQuery ? `/brand-directory?q=${encodeURIComponent(searchQuery)}` : "/brand-directory"}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  See all &rarr;
                </Link>
              </div>
              {filteredBrands.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-12 px-6 text-center">
                  <p className="text-muted-foreground font-medium">No brands in this category yet.</p>
                  <Link
                    href="/brand-directory"
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    Browse all brands
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredBrands.map((brand) => (
                    <BrandCard key={brand._id} brand={brand} showIndustry />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Bottom CTA */}
          <section className="mt-12 pt-10 pb-12 rounded-2xl bg-muted/30 border border-border/50 text-center px-6">
            <h2 className="text-2xl font-bold text-foreground">Showcase your brand</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Gain exposure and get discovered. Create your brand and list it publicly to appear here.
            </p>
            <Link
              href="/dashboard/my-brands/create"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors mt-6"
            >
              Add new brand
            </Link>
          </section>
        </div>
      </div>

      <footer className="border-t border-border/60 py-6">
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
