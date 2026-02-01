import { notFound } from "next/navigation";
import { getBrandBySlug } from "@/app/actions/brand-actions";
import Link from "next/link";
import { Sparkles, Globe, Mail, Phone, MapPin, Share2 } from "lucide-react";
import type { Metadata } from "next";
import RecordBrandView from "./record-view";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getBrandBySlug(slug);
  if (!result.success || !result.brand) {
    return { title: "Brand not found" };
  }
  const brand = result.brand;
  const name = brand.name ?? "Brand";
  const primaryLogoUrl = brand.primaryLogoUrl ?? undefined;
  return {
    title: `${name} | Brand Guidelines`,
    description: brand.description || `Brand profile and guidelines for ${name}.`,
    openGraph: {
      title: `${name} | Brand Guidelines`,
      description: brand.description || undefined,
      images: primaryLogoUrl ? [{ url: primaryLogoUrl, alt: name }] : undefined,
    },
    twitter: {
      card: "summary",
      title: `${name} | Brand Guidelines`,
      description: brand.description || undefined,
    },
  };
}

export default async function PublicBrandPage({ params }: Props) {
  const { slug } = await params;
  const result = await getBrandBySlug(slug);
  if (!result.success || !result.brand) notFound();
  const brand = result.brand;
  const name = brand.name ?? "Brand";
  const primaryColor = brand.identity?.primary_color || "#2563eb";
  const secondaryColor = brand.identity?.secondary_color || "#64748b";

  return (
    <div className="min-h-screen bg-background">
      <RecordBrandView slug={slug} />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold">LogoAIpro</span>
          </Link>
          <Link
            href="/brand-directory"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            Browse brands
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero: logo + name */}
        <section className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-10">
          {brand.primaryLogoUrl && (
            <div
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center bg-muted/50 overflow-hidden shrink-0"
              style={{ borderColor: primaryColor, borderWidth: 2 }}
            >
              <img
                src={brand.primaryLogoUrl}
                alt={name}
                className="w-full h-full object-contain p-2"
              />
            </div>
          )}
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {name}
            </h1>
            {brand.slogan && (
              <p className="mt-2 text-lg text-muted-foreground">{brand.slogan}</p>
            )}
            {brand.industry && (
              <p className="mt-1 text-sm text-muted-foreground capitalize">{brand.industry}</p>
            )}
          </div>
        </section>

        {/* About */}
        {brand.description && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-3">About {name}</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {brand.description}
            </p>
          </section>
        )}

        {/* Contact */}
        {(brand.contactInfo?.website || brand.contactInfo?.email || brand.contactInfo?.phone || brand.contactInfo?.address) && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-4">Contact</h2>
            <ul className="space-y-2 text-muted-foreground">
              {brand.contactInfo.website && (
                <li>
                  <a
                    href={brand.contactInfo.website.startsWith("http") ? brand.contactInfo.website : `https://${brand.contactInfo.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    {brand.contactInfo.website}
                  </a>
                </li>
              )}
              {brand.contactInfo.email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  <a href={`mailto:${brand.contactInfo.email}`} className="hover:text-primary transition-colors">
                    {brand.contactInfo.email}
                  </a>
                </li>
              )}
              {brand.contactInfo.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0" />
                  <a href={`tel:${brand.contactInfo.phone}`} className="hover:text-primary transition-colors">
                    {brand.contactInfo.phone}
                  </a>
                </li>
              )}
              {brand.contactInfo.address && (
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {brand.contactInfo.address}
                </li>
              )}
            </ul>
          </section>
        )}

        {/* Brand colors */}
        {(primaryColor || secondaryColor) && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-4">Brand colors</h2>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-12 h-12 rounded-lg border border-border shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                />
                <span className="text-sm text-muted-foreground">Primary</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-12 h-12 rounded-lg border border-border shadow-sm"
                  style={{ backgroundColor: secondaryColor }}
                />
                <span className="text-sm text-muted-foreground">Secondary</span>
              </div>
            </div>
          </section>
        )}

        {/* Logo assets grid (other logos) */}
        {brand.logos && brand.logos.filter((a: any) => (a.imageUrl || a.image_url) && a.subType !== "primary_logo").length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-4">Logos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {brand.logos
                .filter((a: any) => a.imageUrl || a.image_url)
                .slice(0, 8)
                .map((asset: any) => (
                  <div
                    key={asset._id}
                    className="aspect-square rounded-xl bg-muted/50 flex items-center justify-center p-3 overflow-hidden"
                  >
                    <img
                      src={asset.imageUrl || asset.image_url}
                      alt={asset.subType || "Logo"}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm mb-2">Create your own brand in minutes.</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get started with LogoAIpro
          </Link>
        </section>
      </main>

      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
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
