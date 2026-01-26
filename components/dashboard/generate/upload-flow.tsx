"use client";

import { createBrandFromUpload } from "@/app/actions/upload-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronLeft, ImageIcon, Loader2, PaintBucket, Sparkles, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function UploadFlow({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [detectedColors, setDetectedColors] = useState<{ primary: string; secondary: string }>({
    primary: "#000000",
    secondary: "#ffffff",
  });
  const [suggestedColors, setSuggestedColors] = useState<string[]>([]);
  const [isPickingColor, setIsPickingColor] = useState(false);
  const [selectedColorType, setSelectedColorType] = useState<'primary' | 'secondary' | null>(null);

  const { toast } = useToast();
  const router = useRouter();
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

        // Count all colors for suggestions
        allColors[hex] = (allColors[hex] || 0) + 1;

        // Skip near-gray junk
        if (s < 0.15) continue;

        // Vibrant / brand color
        if (s > 0.45 && l < 0.75) {
          vibrant[hex] = (vibrant[hex] || 0) + 1;
        }

        // Light / background / contrast color
        if (l > 0.8) {
          light[hex] = (light[hex] || 0) + 1;
        }
      }

      const pick = (bucket: Record<string, number>, fallback: string) =>
        Object.entries(bucket).sort((a, b) => b[1] - a[1])[0]?.[0] || fallback;

      const primary = pick(vibrant, "#2563EB");
      const secondary = pick(light, "#FFFFFF");

      setDetectedColors({ primary, secondary });

      // Generate suggested colors (top 6 excluding current primary and secondary)
      const sortedColors = Object.entries(allColors)
        .sort((a, b) => b[1] - a[1])
        .filter(([hex]) => hex !== primary && hex !== secondary)
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

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isPickingColor || !selectedColorType || !preview) return;

    const img = imageRef.current;
    const canvas = colorPickerCanvasRef.current;
    if (!img || !canvas) return;

    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate scale factors
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to match image natural dimensions
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

    setDetectedColors(prev => ({
      ...prev,
      [selectedColorType]: hex
    }));

    setIsPickingColor(false);
    setSelectedColorType(null);

    toast({
      title: "Color Picked",
      description: `${selectedColorType === 'primary' ? 'Primary' : 'Secondary'} color updated`,
    });
  };

  const handleColorPickStart = (type: 'primary' | 'secondary') => {
    if (!preview) {
      toast({
        title: "No Image",
        description: "Please upload an image first",
        variant: "destructive"
      });
      return;
    }

    setIsPickingColor(true);
    setSelectedColorType(type);

    toast({
      title: "Color Picker Active",
      description: `Click on the logo to pick a ${type} color. Click anywhere else to cancel.`,
    });
  };

  const handleSuggestedColorClick = (color: string, type: 'primary' | 'secondary') => {
    setDetectedColors(prev => ({
      ...prev,
      [type]: color
    }));

    toast({
      title: "Color Updated",
      description: `${type === 'primary' ? 'Primary' : 'Secondary'} color changed to ${color}`,
    });
  };

  const handleGenerateBrandKit = async () => {
    if (!file || !companyName) {
      toast({ title: "Verification Error", description: "Please enter a company name and upload a logo.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      toast({ title: "Analysis Started", description: "Extracting brand DNA from your logo..." });

      const result = await createBrandFromUpload({
        companyName,
        logoUrl: preview!,
        primaryColor: detectedColors.primary,
        secondaryColor: detectedColors.secondary,
      });

      if (result.success && result.brandId) {
        toast({ title: "Success!", description: "Your brand kit is being generated.", variant: "success" });
        router.push(`/dashboard/my-brands/${result.brandId}`);
      } else {
        throw new Error(result.error || "Failed to create brand kit");
      }
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  // Cancel color picker when clicking outside
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
    <div className="space-y-8">
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={colorPickerCanvasRef} className="hidden" />

      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Import Your Existing Brand</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <Card className="border overflow-hidden">
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Logo</label>
                <div
                  className={`border-2 border-gray-200 rounded-xl p-8 text-center transition-all ${preview ? "border-primary/20 bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
                    }`}
                >
                  {preview ? (
                    <div className="space-y-4">
                      <div className={`relative aspect-video overflow-hidden rounded-lg bg-white flex items-center justify-center border ${isPickingColor ? 'cursor-crosshair ring-2 ring-primary ring-offset-2' : ''}`}>
                        <img
                          ref={imageRef}
                          src={preview}
                          alt="Logo"
                          className="max-w-full max-h-full object-contain p-4 color-picker-target"
                          onClick={handleImageClick}
                        />
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm" onClick={() => setPreview(null)}>Change Image</Button>
                      </div>
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
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="h-12"
                />
              </div>

            </CardContent>
          </Card>

          {preview && (
            <Card className="border">
              <CardContent className="py-0 px-6 space-y-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Brand Colors
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Primary Color Section */}
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
                      className="h-8 gap-2 text-xs"
                      onClick={() => handleColorPickStart('primary')}
                      disabled={isPickingColor}
                    >
                      <PaintBucket className="w-3 h-3" />
                      Pick from image
                    </Button>

                    {/* Suggested Primary Colors */}
                    {suggestedColors.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Suggested primary colors:</p>
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

                  {/* Secondary Color Section */}
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
                      className="h-8 gap-2 text-xs"
                      onClick={() => handleColorPickStart('secondary')}
                      disabled={isPickingColor}
                    >
                      <PaintBucket className="w-3 h-3" />
                      Pick from image
                    </Button>

                    {/* Suggested Secondary Colors */}
                    {suggestedColors.length > 3 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Suggested secondary colors:</p>
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
                          {/* Add white as a common secondary option */}
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

                <p className="text-xs text-muted-foreground pt-2 border-t">
                  We will use these colors to generate your matching brand assets. Click "Pick from image" to select colors directly from your logo.
                </p>
              </CardContent>
            </Card>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={!preview || !companyName || isGenerating}
            onClick={handleGenerateBrandKit}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Expanding Your Brand...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Brand Kit
              </>
            )}
          </Button>
        </div>

        <div className="lg:sticky lg:top-8 space-y-6">
          <Card className="border bg-gradient-to-br from-primary/5 to-purple-500/5 min-h-[500px] flex flex-col items-center justify-center p-8 text-center border-gray-200">
            <div className="space-y-6">
              <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center mx-auto border">
                {preview ? <img src={preview} className="w-16 h-16 object-contain" /> : <ImageIcon className="w-12 h-12 text-muted-foreground" />}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Instantly expand your brand</h3>
                <p className="text-muted-foreground">
                  Upload your logo and we'll automatically generate:
                </p>
              </div>
              <div className="flex flex-row flex-wrap justify-center gap-3">
                {[
                  "Social Posts", "Marketing Flyers", "Business Cards", "Letterheads",
                  "Ad Creatives", "Email Headers", "PowerPoint Templates", "Stickers"
                ].map(item => (
                  <div key={item} className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-semibold border border-black/5">
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-sm text-primary font-bold">160+ Assets in seconds</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}