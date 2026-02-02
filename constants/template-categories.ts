/**
 * All template categories available in the app, grouped by Branding, Marketing, Social.
 * Used for the "Generate new design" dropdown and for routing.
 */

export interface TemplateCategoryOption {
  id: string;
  label: string;
  group: "branding" | "marketing" | "social";
  description?: string;
  /** Default canvas dimensions [width, height] for this category */
  defaultSize: [number, number];
}

export const TEMPLATE_CATEGORIES: TemplateCategoryOption[] = [
  // Branding
  { id: "business_card", label: "Business Cards", group: "branding", defaultSize: [1050, 600] },
  { id: "letterhead", label: "Letterheads", group: "branding", defaultSize: [1275, 1650] },
  { id: "email_signature", label: "Email Signature", group: "branding", defaultSize: [800, 250] },
  { id: "favicon", label: "Favicon Pack", group: "branding", defaultSize: [512, 512] },
  { id: "brand_book", label: "Brand Book", group: "branding", defaultSize: [1920, 1080] },
  { id: "branding_license", label: "License / Certificate", group: "branding", defaultSize: [1275, 1650] },
  // Social
  { id: "social_story", label: "Social Stories", group: "social", defaultSize: [1080, 1920] },
  { id: "social_post", label: "Social Posts", group: "social", defaultSize: [1080, 1080] },
  { id: "social_cover", label: "Social Covers & Profiles", group: "social", defaultSize: [1500, 500] },
  { id: "social_profile", label: "Profile Avatar", group: "social", defaultSize: [800, 800] },
  { id: "youtube_thumbnail", label: "YouTube Thumbnails", group: "social", defaultSize: [1280, 720] },
  // Marketing
  { id: "ads", label: "Ads", group: "marketing", defaultSize: [1080, 1080] },
  { id: "marketing_flyer", label: "Flyers", group: "marketing", defaultSize: [1275, 1650] },
  { id: "marketing_poster", label: "Posters", group: "marketing", defaultSize: [1650, 2338] },
  { id: "id_card", label: "ID Cards", group: "marketing", defaultSize: [638, 1012] },
];

export const TEMPLATE_CATEGORIES_BY_GROUP = {
  branding: TEMPLATE_CATEGORIES.filter((c) => c.group === "branding"),
  marketing: TEMPLATE_CATEGORIES.filter((c) => c.group === "marketing"),
  social: TEMPLATE_CATEGORIES.filter((c) => c.group === "social"),
};

export function getTemplateCategory(id: string): TemplateCategoryOption | undefined {
  return TEMPLATE_CATEGORIES.find((c) => c.id === id);
}

/** Map our category id to Polotno API / client-side filter query (e.g. for YouTube Thumbnails → "youtube thumbnail"). */
export const POLOTNO_QUERY_BY_CATEGORY: Record<string, string> = {
  business_card: "business card",
  letterhead: "letterhead",
  email_signature: "email signature",
  favicon: "favicon",
  brand_book: "brand book",
  branding_license: "license certificate",
  social_story: "story",
  social_post: "social post",
  social_cover: "cover profile",
  social_profile: "profile avatar",
  youtube_thumbnail: "youtube thumbnail",
  ads: "ad",
  marketing_flyer: "flyer",
  marketing_poster: "poster",
  id_card: "id card",
  cards: "card",
  merch: "merch",
};

/**
 * Style options for AI template generation. "promptInstruction" is injected into the AI prompt.
 */
export interface TemplateStyleOption {
  id: string;
  label: string;
  promptInstruction: string;
}

export const TEMPLATE_STYLE_OPTIONS: TemplateStyleOption[] = [
  { id: "minimal", label: "Minimal", promptInstruction: "Minimal: clean, lots of whitespace, simple shapes, no clutter, understated." },
  { id: "bold", label: "Bold", promptInstruction: "Bold: strong colors, large typography, high contrast, confident, attention-grabbing." },
  {
    id: "illustration",
    label: "Illustration",
    promptInstruction: "Illustration-led: graphic illustrations, icons, flat or hand-drawn style, decorative shapes, friendly.",
  },
  {
    id: "photorealistic",
    label: "Photorealistic",
    promptInstruction: "Photorealistic: realistic photography-style imagery, lifelike, premium, use image placeholders for photos.",
  },
  { id: "elegant", label: "Elegant", promptInstruction: "Elegant: refined, subtle, serif or classic typography, sophisticated, luxury feel." },
  { id: "modern", label: "Modern", promptInstruction: "Modern: contemporary, geometric, sans-serif, tech-forward, crisp." },
  { id: "classic", label: "Classic", promptInstruction: "Classic: traditional, timeless, professional, trusted." },
  { id: "playful", label: "Playful", promptInstruction: "Playful: fun, rounded shapes, bright colors, approachable, energetic." },
  { id: "corporate", label: "Corporate", promptInstruction: "Corporate: professional, trustworthy, clear hierarchy, business-appropriate." },
];
