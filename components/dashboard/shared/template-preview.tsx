"use client";

import { useEffect, useRef, useState } from "react";
import { GET_TEMPLATE, AssetCategory } from "@/lib/templates/brand-kit-templates";

interface TemplatePreviewProps {
  category: AssetCategory;
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  className?: string;
}

export function TemplatePreview({ 
  category, 
  brandName, 
  primaryColor, 
  secondaryColor, 
  logoUrl,
  className = ""
}: TemplatePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsLoading(false);
      return;
    }

    try {
      const template = GET_TEMPLATE(category, 0, {
        brandName: brandName || "Brand Name",
        primaryColor,
        secondaryColor,
        logoUrl,
      });

      if (!template || !template.elements) {
        setIsLoading(false);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsLoading(false);
        return;
      }

      // Set canvas size (preview size)
      const previewWidth = 400;
      const previewHeight = Math.max(200, (template.height / template.width) * previewWidth);
      canvas.width = previewWidth;
      canvas.height = previewHeight;

      // Scale for rendering
      const scale = previewWidth / template.width;
      ctx.scale(scale, scale);

      // Clear canvas
      ctx.clearRect(0, 0, template.width, template.height);

      // Render elements
      const renderPromises: Promise<void>[] = [];

      for (const el of template.elements || []) {
        if (el.type === "rect" || el.type === "shape") {
          const x = el.x || 0;
          const y = el.y || 0;
          const w = el.width || 100;
          const h = el.height || 100;
          const fill = el.fill || "#000000";
          const opacity = el.opacity !== undefined ? el.opacity : 1;
          const rx = el.cornerRadius || 0;

          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.fillStyle = fill;
          if (rx > 0) {
            ctx.beginPath();
            ctx.moveTo(x + rx, y);
            ctx.lineTo(x + w - rx, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + rx);
            ctx.lineTo(x + w, y + h - rx);
            ctx.quadraticCurveTo(x + w, y + h, x + w - rx, y + h);
            ctx.lineTo(x + rx, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - rx);
            ctx.lineTo(x, y + rx);
            ctx.quadraticCurveTo(x, y, x + rx, y);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.fillRect(x, y, w, h);
          }
          ctx.restore();
        } else if (el.type === "circle") {
          const cx = (el.x || 0) + (el.radius || 50);
          const cy = (el.y || 0) + (el.radius || 50);
          const r = el.radius || 50;
          const fill = el.fill || "#000000";
          const opacity = el.opacity !== undefined ? el.opacity : 1;

          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.fillStyle = fill;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (el.type === "text") {
          const x = el.x || 0;
          const y = el.y || 0;
          const content = el.content || "";
          const fontSize = el.fontSize || 16;
          const fontWeight = el.fontWeight || "normal";
          const fill = el.fill || "#000000";
          const align = el.align || "left";

          ctx.save();
          ctx.fillStyle = fill;
          ctx.font = `${fontWeight} ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          ctx.textAlign = align === "center" ? "center" : align === "right" ? "right" : "left";
          ctx.textBaseline = "top";

          let finalX = x;
          if (align === "center" && el.offsetX) {
            finalX = x - (el.offsetX / 2);
          }

          // Handle text wrapping if width is specified
          if (el.width) {
            const words = content.split(" ");
            let line = "";
            let lineY = y;
            const lineHeight = fontSize * 1.2;

            for (let n = 0; n < words.length; n++) {
              const testLine = line + words[n] + " ";
              const metrics = ctx.measureText(testLine);
              const testWidth = metrics.width;

              if (testWidth > el.width && n > 0) {
                ctx.fillText(line, finalX, lineY);
                line = words[n] + " ";
                lineY += lineHeight;
              } else {
                line = testLine;
              }
            }
            ctx.fillText(line, finalX, lineY);
          } else {
            ctx.fillText(content, finalX, y);
          }
          ctx.restore();
        } else if (el.type === "image" && el.src) {
          const x = el.x || 0;
          const y = el.y || 0;
          const w = el.width || 100;
          const h = el.height || 100;
          const src = el.src;

          const promise = new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              ctx.drawImage(img, x, y, w, h);
              resolve();
            };
            img.onerror = () => {
              // Draw placeholder if image fails to load
              ctx.fillStyle = "#e0e0e0";
              ctx.fillRect(x, y, w, h);
              ctx.fillStyle = "#999";
              ctx.font = "12px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText("Logo", x + w / 2, y + h / 2);
              resolve();
            };
            img.src = src;
          });
          renderPromises.push(promise);
        }
      }

      Promise.all(renderPromises).then(() => {
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Template preview error:", error);
      setIsLoading(false);
    }
  }, [category, brandName, primaryColor, secondaryColor, logoUrl]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 animate-pulse">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-lg"
        style={{ display: isLoading ? "none" : "block" }}
      />
    </div>
  );
}
