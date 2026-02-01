/**
 * Utility functions for working with brand data
 */

export interface BrandAsset {
  category?: string;
  subType?: string;
  imageUrl?: string;
  image_url?: string;
  isPrimary?: boolean;
  sceneData?: any;
  _id?: string;
  [key: string]: any;
}

/**
 * Get the primary logo URL from brand logos (Logo collection) or legacy assets
 */
export function getPrimaryLogoUrl(assetsOrLogos?: BrandAsset[] | null): string | null {
  if (!assetsOrLogos || !Array.isArray(assetsOrLogos)) return null;

  const primary = assetsOrLogos.find(
    (a) => a.isPrimary === true || a.subType === "primary_logo"
  );
  const first = primary ?? assetsOrLogos[0];
  if (!first) return null;

  const url = first.imageUrl ?? first.image_url;
  if (url) return url;

  if (first.sceneData?.elements) {
    const imageElement = first.sceneData.elements.find((el: any) => el.type === "image");
    if (imageElement?.src) return imageElement.src;
  }

  return null;
}

/**
 * Get the primary logo asset/logo object
 */
export function getPrimaryLogo(assetsOrLogos?: BrandAsset[] | null): BrandAsset | null {
  if (!assetsOrLogos || !Array.isArray(assetsOrLogos)) return null;
  return (
    assetsOrLogos.find((a) => a.isPrimary === true || a.subType === "primary_logo") ??
    assetsOrLogos[0] ??
    null
  );
}
