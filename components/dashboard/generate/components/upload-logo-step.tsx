"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, PaintBucket, Sparkles, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, Dispatch, SetStateAction } from "react";

interface UploadLogoStepProps {
  file: File | null;
  setFile: (file: File | null) => void;
  preview: string | null;
  setPreview: (preview: string | null) => void;
  detectedColors: { primary: string; secondary: string };
  setDetectedColors: Dispatch<SetStateAction<{ primary: string; secondary: string }>>;
  suggestedColors: string[];
  setSuggestedColors: (colors: string[]) => void;
}

export function UploadLogoStep({
  file,
  setFile,
  preview,
  setPreview,
  detectedColors,
  setDetectedColors,
  suggestedColors,
  setSuggestedColors,
}: UploadLogoStepProps) {
  const [isPickingColor, setIsPickingColor] = useState(false);
  const [selectedColorType, setSelectedColorType] = useState<'primary' | 'secondary' | null>(null);
  const [zoomPreview, setZoomPreview] = useState<{ x: number; y: number; color: string; dataUrl: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const colorPickerCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      extractColors(objectUrl);
    }
  };

  const extractColors = (imgUrl: string) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 120;
      canvas.height = 120;
      ctx.drawImage(img, 0, 0, 120, 120);

      const data = ctx.getImageData(0, 0, 120, 120).data;

      const vibrant: Record<string, number> = {};
      const light: Record<string, number> = {};
      const allColors: Record<string, number> = {};

      for (let i = 0; i < data.length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a < 150) continue;

        const { s, l } = rgbToHsl(r, g, b);
        const hex = rgbToHex(r, g, b);

        if (s < 0.15) continue;

        allColors[hex] = (allColors[hex] || 0) + 1;

        if (s > 0.45 && l < 0.75) {
          vibrant[hex] = (vibrant[hex] || 0) + 1;
        }

        if (l > 0.8) {
          light[hex] = (light[hex] || 0) + 1;
        }
      }

      const pick = (bucket: Record<string, number>, fallback: string) =>
        Object.entries(bucket).sort((a, b) => b[1] - a[1])[0]?.[0] || fallback;

      const primary = pick(vibrant, "#2563EB");
      const secondary = pick(light, "#FFFFFF");

      setDetectedColors({ primary, secondary });

      const sortedColors = Object.entries(allColors)
        .sort((a, b) => b[1] - a[1])
        .filter(([hex]) => {
          if (hex === primary || hex === secondary) return false;

          const hexToRgb = (h: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
            return result ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
            } : null;
          };

          const colorRgb = hexToRgb(hex);
          const primaryRgb = hexToRgb(primary);
          const secondaryRgb = hexToRgb(secondary);

          if (!colorRgb) return false;

          const distance = (c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }) => {
            return Math.sqrt(
              Math.pow(c1.r - c2.r, 2) +
              Math.pow(c1.g - c2.g, 2) +
              Math.pow(c1.b - c2.b, 2)
            );
          };

          if (primaryRgb && distance(colorRgb, primaryRgb) < 30) return false;
          if (secondaryRgb && distance(colorRgb, secondaryRgb) < 30) return false;

          return true;
        })
        .slice(0, 6)
        .map(([hex]) => hex);

      setSuggestedColors(sortedColors);
    };
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h, s, l };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isPickingColor || !selectedColorType || !preview) {
      setZoomPreview(null);
      return;
    }

    const img = imageRef.current;
    const canvas = colorPickerCanvasRef.current;
    if (!img || !canvas) return;

    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setZoomPreview(null);
      return;
    }

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const pixelX = Math.floor(x * scaleX);
    const pixelY = Math.floor(y * scaleY);

    const pixel = ctx.getImageData(pixelX, pixelY, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

    const zoomSize = 9;
    const zoomScale = 8;
    const zoomCanvasSize = zoomSize * zoomScale;

    const zoomCanvas = document.createElement('canvas');
    zoomCanvas.width = zoomCanvasSize;
    zoomCanvas.height = zoomCanvasSize;
    const zoomCtx = zoomCanvas.getContext('2d');
    if (!zoomCtx) return;

    const sourceX = Math.max(0, pixelX - Math.floor(zoomSize / 2));
    const sourceY = Math.max(0, pixelY - Math.floor(zoomSize / 2));
    const sourceWidth = Math.min(zoomSize, img.naturalWidth - sourceX);
    const sourceHeight = Math.min(zoomSize, img.naturalHeight - sourceY);

    const sourceData = ctx.getImageData(sourceX, sourceY, sourceWidth, sourceHeight);
    const zoomData = zoomCtx.createImageData(zoomCanvasSize, zoomCanvasSize);

    for (let sy = 0; sy < sourceHeight; sy++) {
      for (let sx = 0; sx < sourceWidth; sx++) {
        const srcIdx = (sy * sourceWidth + sx) * 4;
        const r = sourceData.data[srcIdx];
        const g = sourceData.data[srcIdx + 1];
        const b = sourceData.data[srcIdx + 2];
        const a = sourceData.data[srcIdx + 3];

        for (let zy = 0; zy < zoomScale; zy++) {
          for (let zx = 0; zx < zoomScale; zx++) {
            const zoomX = sx * zoomScale + zx;
            const zoomY = sy * zoomScale + zy;
            const zoomIdx = (zoomY * zoomCanvasSize + zoomX) * 4;
            zoomData.data[zoomIdx] = r;
            zoomData.data[zoomIdx + 1] = g;
            zoomData.data[zoomIdx + 2] = b;
            zoomData.data[zoomIdx + 3] = a;
          }
        }
      }
    }

    zoomCtx.putImageData(zoomData, 0, 0);

    zoomCtx.strokeStyle = '#fff';
    zoomCtx.lineWidth = 2;
    const center = Math.floor(zoomCanvasSize / 2);
    zoomCtx.beginPath();
    zoomCtx.moveTo(center - zoomScale, center);
    zoomCtx.lineTo(center + zoomScale, center);
    zoomCtx.moveTo(center, center - zoomScale);
    zoomCtx.lineTo(center, center + zoomScale);
    zoomCtx.stroke();

    zoomCtx.strokeStyle = '#000';
    zoomCtx.lineWidth = 1;
    zoomCtx.beginPath();
    zoomCtx.moveTo(center - zoomScale, center);
    zoomCtx.lineTo(center + zoomScale, center);
    zoomCtx.moveTo(center, center - zoomScale);
    zoomCtx.lineTo(center, center + zoomScale);
    zoomCtx.stroke();

    setZoomPreview({
      x: e.clientX,
      y: e.clientY,
      color: hex,
      dataUrl: zoomCanvas.toDataURL()
    });
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isPickingColor || !selectedColorType || !preview) return;

    const img = imageRef.current;
    const canvas = colorPickerCanvasRef.current;
    if (!img || !canvas) return;

    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

    setDetectedColors((prev: { primary: string; secondary: string }) => ({
      ...prev,
      [selectedColorType]: hex
    }));

    setIsPickingColor(false);
    setSelectedColorType(null);
    setZoomPreview(null);
  };

  const handleColorPickStart = (type: 'primary' | 'secondary') => {
    if (!preview) return;
    setIsPickingColor(true);
    setSelectedColorType(type);
  };

  const handleSuggestedColorClick = (color: string, type: 'primary' | 'secondary') => {
    setDetectedColors((prev: { primary: string; secondary: string }) => ({
      ...prev,
      [type]: color
    }));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isPickingColor && selectedColorType) {
        const target = e.target as HTMLElement;
        if (!target.closest('.color-picker-target')) {
          setIsPickingColor(false);
          setSelectedColorType(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPickingColor, selectedColorType]);

  return (
    <motion.div
      key="step-upload"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={colorPickerCanvasRef} className="hidden" />

      <div className="space-y-2">
        <h2 className="text-xl font-bold">Upload Your Logo</h2>
        <p className="text-sm text-muted-foreground">
          Upload your existing logo and we'll automatically extract brand colors and prepare it for your brand kit.
        </p>
      </div>

      <Card className="border-none shadow-none p-0">
        <CardContent className="space-y-4 p-0">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              preview ? "border-primary/20 bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
            }`}
          >
            {preview ? (
              <div className="space-y-4">
                <div className={`relative aspect-video overflow-visible rounded-lg bg-white flex items-center justify-center border ${isPickingColor ? 'cursor-crosshair ring-2 ring-primary ring-offset-2' : ''}`}>
                  <img
                    ref={imageRef}
                    src={preview}
                    alt="Logo"
                    className="max-w-full max-h-full object-contain p-4 color-picker-target"
                    onClick={handleImageClick}
                    onMouseMove={handleImageMouseMove}
                    onMouseLeave={() => setZoomPreview(null)}
                  />
                  {isPickingColor && zoomPreview && (
                    <div
                      className="fixed pointer-events-none z-50"
                      style={{
                        left: `${Math.min(zoomPreview.x + 20, window.innerWidth - 180)}px`,
                        top: `${Math.max(20, zoomPreview.y - 180)}px`,
                      }}
                    >
                      <div className="bg-white border-2 border-gray-800 rounded-lg shadow-2xl p-2">
                        <img
                          src={zoomPreview.dataUrl}
                          alt="Zoom preview"
                          className="block"
                          style={{ width: '144px', height: '144px', imageRendering: 'pixelated' }}
                        />
                        <div className="mt-2 text-center">
                          <div
                            className="w-8 h-8 rounded border-2 border-gray-300 mx-auto mb-1"
                            style={{ backgroundColor: zoomPreview.color }}
                          />
                          <p className="text-xs font-mono font-semibold">{zoomPreview.color}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  setPreview(null);
                  setFile(null);
                }}>
                  Change Image
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-4 cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">Drop your logo here</p>
                  <p className="text-xs text-muted-foreground">PNG, SVG or JPG supported</p>
                </div>
                <Input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                <Button variant="secondary" asChild>
                  <span>Select File</span>
                </Button>
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {preview && (
        <Card className="border">
          <CardContent className="py-4 px-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Detected Brand Colors
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Primary Color */}
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Primary Color</p>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <div className="w-12 h-12 rounded-full shadow-sm border" style={{ backgroundColor: detectedColors.primary }} />
                  <div className="flex-1">
                    <span className="font-mono text-sm uppercase block">{detectedColors.primary}</span>
                    <p className="text-xs text-muted-foreground">Main brand color</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-2 text-xs w-full"
                  onClick={() => handleColorPickStart('primary')}
                  disabled={isPickingColor}
                >
                  <PaintBucket className="w-3 h-3" />
                  Pick from image
                </Button>
                {suggestedColors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Suggested:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedColors.slice(0, 3).map((color, index) => (
                        <button
                          key={index}
                          className={`w-8 h-8 rounded-full border shadow-sm hover:scale-110 transition-transform ${detectedColors.primary === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleSuggestedColorClick(color, 'primary')}
                          title={color}
                        >
                          {detectedColors.primary === color && (
                            <Check className="w-4 h-4 text-white mx-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Secondary Color */}
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Secondary Color</p>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <div className="w-12 h-12 rounded-full shadow-sm border" style={{ backgroundColor: detectedColors.secondary }} />
                  <div className="flex-1">
                    <span className="font-mono text-sm uppercase block">{detectedColors.secondary}</span>
                    <p className="text-xs text-muted-foreground">Background/contrast color</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-2 text-xs w-full"
                  onClick={() => handleColorPickStart('secondary')}
                  disabled={isPickingColor}
                >
                  <PaintBucket className="w-3 h-3" />
                  Pick from image
                </Button>
                {suggestedColors.length > 3 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Suggested:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedColors.slice(3, 6).map((color, index) => (
                        <button
                          key={index}
                          className={`w-8 h-8 rounded-full border shadow-sm hover:scale-110 transition-transform ${detectedColors.secondary === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleSuggestedColorClick(color, 'secondary')}
                          title={color}
                        >
                          {detectedColors.secondary === color && (
                            <Check className="w-4 h-4 text-white mx-auto" />
                          )}
                        </button>
                      ))}
                      <button
                        className={`w-8 h-8 rounded-full border shadow-sm hover:scale-110 transition-transform ${detectedColors.secondary === '#FFFFFF' ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                        style={{ backgroundColor: '#FFFFFF' }}
                        onClick={() => handleSuggestedColorClick('#FFFFFF', 'secondary')}
                        title="#FFFFFF"
                      >
                        {detectedColors.secondary === '#FFFFFF' && (
                          <Check className="w-4 h-4 text-black mx-auto" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
