"use client";

import { createContext, useContext, ReactNode } from "react";

export interface BrandContextType {
  _id: string;
  name: string;
  slug?: string | null;
  listedPublicly?: boolean;
  description?: string;
  strategy?: any;
  identity?: any;
  primaryLogoUrl?: string | null;
  logos?: Array<{
    _id: string;
    category?: string;
    subType?: string;
    imageUrl?: string;
    image_url?: string;
    isPrimary?: boolean;
    createdAt?: string | Date;
  }>;
  createdAt: string | Date;
  updatedAt: string | Date;
  industry?: string;
  pageViewCount?: number;
  pageLastViewedAt?: string | Date;
  contactInfo?: {
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
    mobile?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

const BrandContext = createContext<BrandContextType | null>(null);

export function BrandProvider({
  brand,
  children,
}: {
  brand: BrandContextType;
  children: ReactNode;
}) {
  return (
    <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
}
