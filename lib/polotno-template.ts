/**
 * Convert Polotno template JSON to our scene format (width, height, elements).
 * Polotno uses pages[].children with type: text | image | svg.
 * We use sceneData.elements with type: text | image | rect | circle.
 */

export interface PolotnoTemplate {
  version?: number;
  width: number;
  height: number;
  pages?: Array<{
    id?: string;
    children?: Array<Record<string, unknown>>;
    background?: string;
  }>;
}

export interface OurSceneData {
  width: number;
  height: number;
  elements: Array<Record<string, unknown>>;
}

function convertPolotnoElement(el: Record<string, unknown>): Record<string, unknown> | null {
  const type = el.type as string;
  const x = Number(el.x) ?? 0;
  const y = Number(el.y) ?? 0;
  const w = Number(el.width) ?? 100;
  const h = Number(el.height) ?? 100;

  if (type === "text") {
    return {
      type: "text",
      content: (el.text as string) ?? "",
      x,
      y,
      width: w,
      height: h,
      fontSize: Number(el.fontSize) ?? 40,
      fill: (el.fill as string) ?? "#000000",
      fontFamily: (el.fontFamily as string) ?? "Arial",
      fontWeight: el.fontWeight,
      fontStyle: el.fontStyle,
      align: (el.align as string) ?? "left",
      draggable: true,
    };
  }

  if (type === "image" || type === "svg") {
    const src = (el.src as string) ?? "";
    if (!src) return null;
    return {
      type: "image",
      src,
      x,
      y,
      width: w,
      height: h,
      draggable: true,
    };
  }

  if (type === "figure") {
    const figure = (el.figure as string) ?? "rect";
    const fill = (el.fill as string) ?? "#000000";
    const opacity = el.opacity !== undefined ? Number(el.opacity) : undefined;
    const cornerRadius = el.cornerRadius !== undefined ? Number(el.cornerRadius) : undefined;
    if (figure === "ellipse") {
      const radius = Math.min(w, h) / 2;
      return { type: "circle", x, y, radius, fill, opacity, draggable: true };
    }
    return {
      type: "rect",
      x,
      y,
      width: w,
      height: h,
      fill,
      cornerRadius,
      opacity,
      draggable: true,
    };
  }

  return null;
}

export function polotnoTemplateToScene(template: PolotnoTemplate): OurSceneData {
  const width = template.width ?? 1080;
  const height = template.height ?? 1080;
  const firstPage = template.pages?.[0];
  const children = firstPage?.children ?? [];
  const background = (firstPage?.background as string) ?? "#ffffff";

  const elements: Array<Record<string, unknown>> = [
    {
      type: "rect",
      x: 0,
      y: 0,
      width,
      height,
      fill: background,
      draggable: false,
    },
  ];

  for (const el of children) {
    const converted = convertPolotnoElement(el as Record<string, unknown>);
    if (converted) elements.push(converted);
  }

  return { width, height, elements };
}

/** Convert our scene format to Polotno store JSON (design.pages[].children). */
export function sceneToPolotnoJson(scene: OurSceneData): PolotnoTemplate {
  const width = scene.width ?? 1080;
  const height = scene.height ?? 1080;
  const elements = scene.elements ?? [];
  let background = "#ffffff";
  const children: Array<Record<string, unknown>> = [];

  for (const el of elements) {
    const type = (el.type as string) ?? "";
    if (type === "rect") {
      const fill = (el.fill as string) ?? "#ffffff";
      const x = Number(el.x) ?? 0;
      const y = Number(el.y) ?? 0;
      const w = Number(el.width) ?? 100;
      const h = Number(el.height) ?? 100;
      if (x === 0 && y === 0 && w === width && h === height) {
        background = fill;
        continue;
      }
      children.push({
        type: "figure",
        figure: "rect",
        x,
        y,
        width: w,
        height: h,
        fill,
        cornerRadius: el.cornerRadius !== undefined ? Number(el.cornerRadius) : 0,
        opacity: el.opacity !== undefined ? Number(el.opacity) : 1,
      });
      continue;
    }
    if (type === "circle") {
      const radius = Number(el.radius) ?? 50;
      const cx = Number(el.x) ?? 0;
      const cy = Number(el.y) ?? 0;
      children.push({
        type: "figure",
        figure: "ellipse",
        x: cx,
        y: cy,
        width: radius * 2,
        height: radius * 2,
        fill: (el.fill as string) ?? "#000000",
        opacity: el.opacity !== undefined ? Number(el.opacity) : 1,
      });
      continue;
    }
    if (type === "text") {
      children.push({
        type: "text",
        text: (el.content as string) ?? "",
        x: Number(el.x) ?? 0,
        y: Number(el.y) ?? 0,
        width: Number(el.width) ?? 200,
        height: Number(el.height) ?? 100,
        fontSize: Number(el.fontSize) ?? 40,
        fill: (el.fill as string) ?? "#000000",
        fontFamily: (el.fontFamily as string) ?? "Arial",
        fontWeight: el.fontWeight,
        fontStyle: el.fontStyle,
        align: (el.align as string) ?? "left",
      });
      continue;
    }
    if (type === "image") {
      const src = (el.src as string) ?? "";
      if (src) {
        children.push({
          type: "image",
          src,
          x: Number(el.x) ?? 0,
          y: Number(el.y) ?? 0,
          width: Number(el.width) ?? 100,
          height: Number(el.height) ?? 100,
        });
      }
    }
  }

  return {
    version: 1,
    width,
    height,
    pages: [{ id: "page-1", background, children }],
  };
}
