"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { useBrand } from "@/components/providers/brand-provider";
import { getPrimaryLogoUrl } from "@/lib/utils/brand-utils";
import { IconMapPin, IconStar } from "@tabler/icons-react";
import { useState } from "react";

const MERCH_CATEGORIES = [
  {
    id: "mens-clothing",
    title: "Men's clothing",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
  },
  {
    id: "womens-clothing",
    title: "Women's clothing",
    image: "https://images.unsplash.com/photo-1583743814966-9f36344ee7c6?w=400&h=400&fit=crop",
  },
  {
    id: "kids-youth",
    title: "Kids' & youth clothing",
    image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&h=400&fit=crop",
  },
  {
    id: "stationery",
    title: "Stationery",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop",
  },
  {
    id: "accessories",
    title: "Accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
  },
  {
    id: "home-living",
    title: "Home & living",
    image: "https://images.unsplash.com/photo-1514228742587-ef4a1d2f1b4a?w=400&h=400&fit=crop",
  },
  {
    id: "hats",
    title: "Hats",
    image: "https://images.unsplash.com/photo-1588850561407-97d06073c2a2?w=400&h=400&fit=crop",
  },
  {
    id: "collections",
    title: "Collections",
    image: "https://images.unsplash.com/photo-1602143407151-9e6b2a0a8c?w=400&h=400&fit=crop",
  },
];

export default function MerchPage() {
  const brand = useBrand();
  const logoUrl = brand?.primaryLogoUrl ?? getPrimaryLogoUrl(brand?.logos);
  const [shippingLocation, setShippingLocation] = useState("Rwanda");

  return (
    <div>
      <PageHeader
        heading="Merchandise"
        description="Preview your logo on a range of great products, including shirts, hats, mugs and more! Select a category, pick a design, and get it delivered directly to you."
      />

      {/* Shipping / location */}
      <div className="flex flex-wrap items-center gap-2 mb-8 text-sm text-muted-foreground">
        <IconStar className="h-4 w-4 fill-amber-400 text-amber-500" />
        <span>Displaying options that ship to {shippingLocation}.</span>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setShippingLocation((prev) => (prev === "Rwanda" ? "United States" : "Rwanda"))}
        >
          <IconMapPin className="h-3.5 w-3.5" />
          Change locations
        </Button>
      </div>

      {/* Browse by */}
      <h3 className="text-lg font-semibold mb-4">Browse by</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {MERCH_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            className="group text-left rounded-xl overflow-hidden border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="relative aspect-square bg-muted/30">
              <img
                src={category.image}
                alt=""
                className="w-full h-full object-cover object-center"
              />
              {logoUrl && (
                <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/10 group-hover:bg-black/5 transition-colors">
                  <img
                    src={logoUrl}
                    alt=""
                    className="max-w-[60%] max-h-[60%] w-auto h-auto object-contain drop-shadow-sm"
                  />
                </div>
              )}
            </div>
            <div className="p-3">
              <span className="font-medium text-sm">{category.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
