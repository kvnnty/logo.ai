/**
 * Utility functions for working with brand data
 */

export interface BrandAsset {
  category?: string;
  subType?: string;
  imageUrl?: string;
  _id?: string;
  [key: string]: any;
}

/**
 * Get the primary logo URL from brand assets
 */
export function getPrimaryLogoUrl(assets?: BrandAsset[]): string | null {
  if (!assets || !Array.isArray(assets)) return null;
  
  const primaryLogo = assets.find((a: BrandAsset) => a.subType === 'primary_logo');
  return primaryLogo?.imageUrl || null;
}

/**
 * Get the primary logo asset object
 */
export function getPrimaryLogo(assets?: BrandAsset[]): BrandAsset | null {
  if (!assets || !Array.isArray(assets)) return null;
  
  return assets.find((a: BrandAsset) => a.subType === 'primary_logo') || null;
}
