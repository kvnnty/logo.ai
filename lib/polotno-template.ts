/**
 * Convert Polotno template JSON to our scene format (width, height, elements).
 * Polotno uses pages[].children with type: text | image | svg.
 * We use sceneData.elements with type: text | image | rect | circle.
 */

export interface PolotnoTemplate {
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
