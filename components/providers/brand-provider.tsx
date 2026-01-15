"use client";

import { createContext, useContext, ReactNode } from "react";

export interface BrandContextType {
  _id: string;
  name: string;
  description?: string;
  strategy?: any;
  identity?: any;
  blueprints?: any;
  assets?: Array<{
    type: string;
    imageUrl: string;
    prompt: string;
    createdAt: string | Date;
  }>;
  createdAt: string | Date;
  updatedAt: string | Date;
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
