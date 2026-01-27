import { Building2, Circle, Monitor, Paintbrush, Shapes, Sparkles, Gem, Palette, Waves, Clock, PenTool } from "lucide-react";

export interface StyleOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  logoExamples: Array<{
    name: string;
    logoUrl: string;
  }>;
}

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: "minimal",
    name: "Minimal",
    icon: Circle,
    description: "Clean layouts, lots of whitespace, simple shapes.",
    logoExamples: [
      { name: "Apple", logoUrl: "https://logo.clearbit.com/apple.com" },
      { name: "Google", logoUrl: "https://logo.clearbit.com/google.com" },
      { name: "Nike", logoUrl: "https://logo.clearbit.com/nike.com" },
      { name: "Microsoft", logoUrl: "https://logo.clearbit.com/microsoft.com" },
    ],
  },
  {
    id: "tech",
    name: "Technology",
    icon: Monitor,
    description: "Modern, high-contrast, suitable for SaaS or apps.",
    logoExamples: [
      { name: "Meta", logoUrl: "https://logo.clearbit.com/meta.com" },
      { name: "Tesla", logoUrl: "https://logo.clearbit.com/tesla.com" },
      { name: "Adobe", logoUrl: "https://logo.clearbit.com/adobe.com" },
      { name: "IBM", logoUrl: "https://logo.clearbit.com/ibm.com" },
    ],
  },
  {
    id: "corporate",
    name: "Corporate",
    icon: Building2,
    description: "Professional, conservative, ideal for B2B brands.",
    logoExamples: [
      { name: "Goldman Sachs", logoUrl: "https://logo.clearbit.com/gs.com" },
      { name: "Deloitte", logoUrl: "https://logo.clearbit.com/deloitte.com" },
      { name: "Accenture", logoUrl: "https://logo.clearbit.com/accenture.com" },
      { name: "JP Morgan", logoUrl: "https://logo.clearbit.com/jpmorgan.com" },
    ],
  },
  {
    id: "luxury",
    name: "Luxury",
    icon: Gem,
    description: "Premium feel with refined details and balance.",
    logoExamples: [
      { name: "Rolex", logoUrl: "https://logo.clearbit.com/rolex.com" },
      { name: "Mercedes-Benz", logoUrl: "https://logo.clearbit.com/mercedes-benz.com" },
      { name: "Tiffany & Co", logoUrl: "https://logo.clearbit.com/tiffany.com" },
      { name: "Cartier", logoUrl: "https://logo.clearbit.com/cartier.com" },
    ],
  },
  {
    id: "creative",
    name: "Creative",
    icon: Paintbrush,
    description: "Expressive compositions and unconventional layouts.",
    logoExamples: [
      { name: "Spotify", logoUrl: "https://logo.clearbit.com/spotify.com" },
      { name: "Behance", logoUrl: "https://logo.clearbit.com/behance.net" },
      { name: "Dribbble", logoUrl: "https://logo.clearbit.com/dribbble.com" },
      { name: "Pinterest", logoUrl: "https://logo.clearbit.com/pinterest.com" },
    ],
  },
  {
    id: "abstract",
    name: "Abstract",
    icon: Shapes,
    description: "Symbolic and conceptual, less literal visuals.",
    logoExamples: [
      { name: "Starbucks", logoUrl: "https://logo.clearbit.com/starbucks.com" },
      { name: "Shell", logoUrl: "https://logo.clearbit.com/shell.com" },
      { name: "Target", logoUrl: "https://logo.clearbit.com/target.com" },
      { name: "BP", logoUrl: "https://logo.clearbit.com/bp.com" },
    ],
  },
  {
    id: "flashy",
    name: "Flashy",
    icon: Sparkles,
    description: "Bold, loud and attention-grabbing compositions.",
    logoExamples: [
      { name: "Red Bull", logoUrl: "https://logo.clearbit.com/redbull.com" },
      { name: "MTV", logoUrl: "https://logo.clearbit.com/mtv.com" },
      { name: "Nintendo", logoUrl: "https://logo.clearbit.com/nintendo.com" },
      { name: "PlayStation", logoUrl: "https://logo.clearbit.com/playstation.com" },
    ],
  },
  {
    id: "playful",
    name: "Playful",
    icon: Palette,
    description: "Friendly, rounded forms and bright colors.",
    logoExamples: [
      { name: "LEGO", logoUrl: "https://logo.clearbit.com/lego.com" },
      { name: "Disney", logoUrl: "https://logo.clearbit.com/disney.com" },
      { name: "Coca-Cola", logoUrl: "https://logo.clearbit.com/coca-cola.com" },
      { name: "Ben & Jerry's", logoUrl: "https://logo.clearbit.com/benjerry.com" },
    ],
  },
  {
    id: "geometric",
    name: "Geometric",
    icon: Shapes,
    description: "Strong shapes, grids and symmetry-driven.",
    logoExamples: [
      { name: "BMW", logoUrl: "https://logo.clearbit.com/bmw.com" },
      { name: "Audi", logoUrl: "https://logo.clearbit.com/audi.com" },
      { name: "Mastercard", logoUrl: "https://logo.clearbit.com/mastercard.com" },
      { name: "Chase", logoUrl: "https://logo.clearbit.com/chase.com" },
    ],
  },
  {
    id: "organic",
    name: "Organic",
    icon: Waves,
    description: "Soft, flowing forms inspired by nature.",
    logoExamples: [
      { name: "Whole Foods", logoUrl: "https://logo.clearbit.com/wholefoodsmarket.com" },
      { name: "Patagonia", logoUrl: "https://logo.clearbit.com/patagonia.com" },
      { name: "The Body Shop", logoUrl: "https://logo.clearbit.com/thebodyshop.com" },
      { name: "Lush", logoUrl: "https://logo.clearbit.com/lush.com" },
    ],
  },
  {
    id: "vintage",
    name: "Vintage",
    icon: Clock,
    description: "Retro aesthetics and timeless layouts.",
    logoExamples: [
      { name: "Levi's", logoUrl: "https://logo.clearbit.com/levi.com" },
      { name: "Harley-Davidson", logoUrl: "https://logo.clearbit.com/harley-davidson.com" },
      { name: "Jack Daniel's", logoUrl: "https://logo.clearbit.com/jackdaniels.com" },
      { name: "Marlboro", logoUrl: "https://logo.clearbit.com/marlboro.com" },
    ],
  },
  {
    id: "handcrafted",
    name: "Handcrafted",
    icon: PenTool,
    description: "Imperfect, hand-drawn and artisanal feel.",
    logoExamples: [
      { name: "Ben & Jerry's", logoUrl: "https://logo.clearbit.com/benjerry.com" },
      { name: "Kellogg's", logoUrl: "https://logo.clearbit.com/kelloggs.com" },
      { name: "Coca-Cola", logoUrl: "https://logo.clearbit.com/coca-cola.com" },
      { name: "Johnson & Johnson", logoUrl: "https://logo.clearbit.com/jnj.com" },
    ],
  },
];

export const MODEL_OPTIONS = [
  {
    id: "black-forest-labs/flux-schnell",
    name: "Flux Schnell",
    description: "Faster generation",
  },
  {
    id: "black-forest-labs/flux-dev",
    name: "Flux Dev",
    description: "Higher quality",
  },
];

export const SIZE_OPTIONS = [
  { id: "256x256", name: "Small (256x256)" },
  { id: "512x512", name: "Medium (512x512)" },
  { id: "1024x1024", name: "Large (1024x1024)" },
];

export const COLOR_OPTIONS = [
  { id: "#2563EB", name: "Blue" },
  { id: "#DC2626", name: "Red" },
  { id: "#D97706", name: "Orange" },
  { id: "#16A34A", name: "Green" },
  { id: "#9333EA", name: "Purple" },
  { id: "#000000", name: "Black" },
];

export const BACKGROUND_OPTIONS = [
  { id: "#FFFFFF", name: "White" },
  { id: "#F8FAFC", name: "Light Gray" },
  { id: "#FEE2E2", name: "Light Red" },
  { id: "#000000", name: "Black" },
  { id: "#FEF2F2", name: "Light Red" },
  { id: "#EFF6FF", name: "Light Blue" },
  { id: "#F0FFF4", name: "Light Green" },
];

export const TOTAL_STEPS = 7;

export const STEPS = [
  { number: 1, label: "Company" },
  { number: 2, label: "About" },
  { number: 3, label: "Industry" },
  { number: 4, label: "Colors" },
  { number: 5, label: "Style" },
  { number: 6, label: "Configs" },
  { number: 7, label: "Selection" },
];
