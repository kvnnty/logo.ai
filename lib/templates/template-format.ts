/**
 * Single canonical format for all templates (default and AI-generated).
 * Used by the canvas editor, scene renderer (PNG/SVG/PDF), and AI generation.
 *
 * SCENE SHAPE:
 *   { width: number, height: number, elements: SceneElement[] }
 *
 * ELEMENT TYPES:
 *   - rect: x, y, width, height, fill (hex or "{{primaryColor}}" / "{{secondaryColor}}"), cornerRadius?, opacity?, draggable?
 *   - circle: x, y, radius, fill (same as rect), draggable?
 *   - text: x, y, content, fontSize, fontWeight?, fontFamily?, fill, align?, offsetX?, width? (wrap), draggable?
 *   - image: x, y, width, height, src (URL or data:... base64), draggable?
 *
 * BRAND PLACEHOLDERS (replaced at hydration):
 *   {{brandName}}, {{primaryColor}}, {{secondaryColor}}, {{logoUrl}}, {{website}}, {{email}}, {{phone}}, {{address}}
 *
 * Images: use full URLs (e.g. from Unsplash/Pexels) or data URLs (base64). Graphic illustrations
 * that "react" to brand color use rect/circle with fill: "{{primaryColor}}" or "{{secondaryColor}}".
 */

export type SceneElement =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      fill: string;
      cornerRadius?: number;
      opacity?: number;
      border?: string;
      draggable?: boolean;
    }
  | { type: "circle"; x: number; y: number; radius: number; fill: string; draggable?: boolean }
  | {
      type: "text";
      x: number;
      y: number;
      content: string;
      fontSize: number;
      fontWeight?: string;
      fontFamily?: string;
      fill: string;
      align?: "left" | "center" | "right";
      offsetX?: number;
      width?: number;
      draggable?: boolean;
    }
  | { type: "image"; x: number; y: number; width: number; height: number; src: string; draggable?: boolean; filter?: string };

export interface SceneData {
  width: number;
  height: number;
  elements: SceneElement[];
}

export const TEMPLATE_PLACEHOLDERS = [
  "{{brandName}}",
  "{{primaryColor}}",
  "{{secondaryColor}}",
  "{{logoUrl}}",
  "{{website}}",
  "{{email}}",
  "{{phone}}",
  "{{address}}",
] as const;

/** Empty canvas scene for "New Design" — white background, no elements. */
export const EMPTY_SCENE_DATA: SceneData = {
  width: 1080,
  height: 1080,
  elements: [
    { type: "rect", x: 0, y: 0, width: 1080, height: 1080, fill: "#ffffff", draggable: false },
  ],
};
