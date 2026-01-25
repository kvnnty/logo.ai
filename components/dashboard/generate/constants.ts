import { Building2, Circle, Monitor, Paintbrush, Shapes, Sparkles } from "lucide-react";

export const STYLE_OPTIONS = [
  {
    id: "minimal",
    name: "Minimal",
    icon: Circle,
  },
  {
    id: "tech",
    name: "Technology",
    icon: Monitor,
  },
  {
    id: "corporate",
    name: "Corporate",
    icon: Building2,
  },
  {
    id: "creative",
    name: "Creative",
    icon: Paintbrush,
  },
  {
    id: "abstract",
    name: "Abstract",
    icon: Shapes,
  },
  {
    id: "flashy",
    name: "Flashy",
    icon: Sparkles,
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

export const TOTAL_STEPS = 5;

export const STEPS = [
  { number: 1, label: "Company" },
  { number: 2, label: "About" },
  { number: 3, label: "Style" },
  { number: 4, label: "Configs" },
  { number: 5, label: "Selection" },
];
