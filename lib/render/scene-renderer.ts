import sharp from "sharp";
import PDFDocument from "pdfkit";

interface SceneElement {
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number; // for circle
  fill?: string;
  content?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  align?: string;
  src?: string;
  cornerRadius?: number;
  opacity?: number;
  border?: string;
  rotation?: number;
  offsetX?: number;
}

interface SceneData {
  width: number;
  height: number;
  elements: SceneElement[];
}

/**
 * Render sceneData to SVG string
 */
export function renderSceneToSVG(sceneData: SceneData): string {
  const { width, height, elements } = sceneData;

  const svgElements: string[] = [];

  for (const el of elements || []) {
    if (el.type === "rect" || el.type === "shape") {
      const x = el.x || 0;
      const y = el.y || 0;
      const w = el.width || 100;
      const h = el.height || 100;
      const fill = el.fill || "#000000";
      const rx = el.cornerRadius || 0;
      const opacity = el.opacity !== undefined ? el.opacity : 1;

      svgElements.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}" opacity="${opacity}" />`);
    } else if (el.type === "circle") {
      const cx = (el.x || 0) + (el.radius || 50);
      const cy = (el.y || 0) + (el.radius || 50);
      const r = el.radius || 50;
      const fill = el.fill || "#000000";
      const opacity = el.opacity !== undefined ? el.opacity : 1;
      svgElements.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity}" />`);
    } else if (el.type === "text") {
      const x = el.x || 0;
      const y = el.y || 0;
      const content = el.content || "";
      const fontSize = el.fontSize || 16;
      const fontWeight = el.fontWeight || "normal";
      const fontFamily = el.fontFamily || "Arial, sans-serif";
      const fill = el.fill || "#000000";
      const textAnchor = el.align === "center" ? "middle" : el.align === "right" ? "end" : "start";

      // Handle offsetX for center alignment
      let finalX = x;
      if (el.align === "center" && el.offsetX) {
        finalX = x - el.offsetX / 2;
      }

      svgElements.push(
        `<text x="${finalX}" y="${y + fontSize}" font-size="${fontSize}" font-weight="${fontWeight}" font-family="${fontFamily}" fill="${fill}" text-anchor="${textAnchor}">${escapeXml(content)}</text>`,
      );
    } else if (el.type === "image" && el.src) {
      const x = el.x || 0;
      const y = el.y || 0;
      const w = el.width || 100;
      const h = el.height || 100;
      const src = el.src;

      // Handle data URLs and remote URLs
      svgElements.push(`<image x="${x}" y="${y}" width="${w}" height="${h}" href="${src}" />`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  ${svgElements.join("\n  ")}
</svg>`;
}

export async function renderSceneToPNG(
  sceneData: SceneData,
  scale: number = 2,
  options?: { transparent?: boolean }
): Promise<Buffer> {
  const transparent = options?.transparent ?? false;
  const bg = transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 255, g: 255, b: 255, alpha: 1 };
  try {
    const svg = renderSceneToSVG(sceneData);
    const png = await sharp(Buffer.from(svg), {
      limitInputPixels: false,
    })
      .resize(Math.round(sceneData.width * scale), Math.round(sceneData.height * scale), {
        fit: "contain",
        background: bg,
      })
      .png()
      .toBuffer();
    return png;
  } catch (error) {
    console.error("PNG rendering error:", error);
    return await sharp({
      create: {
        width: sceneData.width * scale,
        height: sceneData.height * scale,
        channels: transparent ? 4 : 4,
        background: bg,
      },
    })
      .png()
      .toBuffer();
  }
}

async function fetchImageAsBuffer(src: string): Promise<Buffer> {
  if (src.startsWith("data:")) {
    const match = /^data:([^;,]+)?(;base64)?,(.*)$/i.exec(src);
    if (match) {
      const isBase64 = Boolean(match[2]);
      const payload = match[3] || "";
      return Buffer.from(payload, isBase64 ? "base64" : "utf8");
    }
  } else if (src.startsWith("http://") || src.startsWith("https://")) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
    const arr = await res.arrayBuffer();
    return Buffer.from(arr);
  }
  throw new Error(`Unsupported image source: ${src.substring(0, 50)}`);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export async function renderSceneToPDF(sceneData: SceneData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [sceneData.width, sceneData.height],
        margin: 0,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const renderElements = async () => {
        for (const el of sceneData.elements || []) {
          if (el.type === "rect" || el.type === "shape") {
            const x = el.x || 0;
            const y = el.y || 0;
            const w = el.width || 100;
            const h = el.height || 100;
            const fill = el.fill || "#000000";
            const opacity = el.opacity !== undefined ? el.opacity : 1;
            const rgb = hexToRgb(fill);

            doc.save();
            doc.opacity(opacity);
            doc.rect(x, y, w, h);
            doc.fillColor(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
            doc.fill();
            doc.restore();
          } else if (el.type === "circle") {
            const x = el.x || 0;
            const y = el.y || 0;
            const r = el.radius || 50;
            const fill = el.fill || "#000000";
            const opacity = el.opacity !== undefined ? el.opacity : 1;
            const rgb = hexToRgb(fill);
            doc.save();
            doc.opacity(opacity);
            doc.circle(x + r, y + r, r);
            doc.fillColor(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
            doc.fill();
            doc.restore();
          } else if (el.type === "text") {
            const x = el.x || 0;
            const y = el.y || 0;
            const content = el.content || "";
            const fontSize = el.fontSize || 16;
            const fontWeight = el.fontWeight || "normal";
            let fontFamily = el.fontFamily || "Helvetica";
            const fill = el.fill || "#000000";
            const rgb = hexToRgb(fill);

            // PDFKit standard fonts: Helvetica, Times-Roman, Courier, Symbol, ZapfDingbats
            // Map common font families to PDFKit equivalents
            const fontMap: Record<string, string> = {
              Arial: "Helvetica",
              "Arial, sans-serif": "Helvetica",
              "sans-serif": "Helvetica",
              "Times New Roman": "Times-Roman",
              "Times, serif": "Times-Roman",
              serif: "Times-Roman",
              "Courier New": "Courier",
              monospace: "Courier",
            };

            fontFamily = fontMap[fontFamily] || fontFamily;
            if (!["Helvetica", "Times-Roman", "Courier", "Symbol", "ZapfDingbats"].includes(fontFamily)) {
              fontFamily = "Helvetica";
            }

            doc.save();
            doc.fontSize(fontSize);
            if (fontWeight === "bold") {
              doc.font(`${fontFamily}-Bold`);
            } else {
              doc.font(fontFamily);
            }
            doc.fillColor(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);

            let finalX = x;
            if (el.align === "center" && el.offsetX) {
              finalX = x - el.offsetX / 2;
            }

            doc.text(content, finalX, y, {
              align: el.align === "center" ? "center" : el.align === "right" ? "right" : "left",
            });
            doc.restore();
          } else if (el.type === "image" && el.src) {
            try {
              const x = el.x || 0;
              const y = el.y || 0;
              const w = el.width || 100;
              const h = el.height || 100;
              const imageBuffer = await fetchImageAsBuffer(el.src);
              doc.image(imageBuffer, x, y, { width: w, height: h });
            } catch (imgError) {
              console.error(`Failed to load image for PDF: ${el.src?.substring(0, 50)}`, imgError);
            }
          }
        }
        doc.end();
      };

      renderElements().catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
