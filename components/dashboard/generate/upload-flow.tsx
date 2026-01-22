"use client";

import { createBrandFromUpload } from "@/app/actions/upload-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ImageIcon, Loader2, Sparkles, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function UploadFlow({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [detectedColors, setDetectedColors] = useState<{ primary: string; secondary: string }>({
    primary: "#000000",
    secondary: "#ffffff",
  });

  const { toast } = useToast();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

      // Draw image to small canvas for sampling
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);

      const imageData = ctx.getImageData(0, 0, 100, 100).data;
      const colorCounts: Record<string, number> = {};

      for (let i = 0; i < imageData.length; i += 4 * 10) { // Sample every 10 pixels
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const alpha = imageData[i + 3];

        if (alpha < 128) continue; // Skip transparent pixels

        const hex = rgbToHex(r, g, b);
        // Exclude extreme white/black if possibly background
        if (hex === "#ffffff" || hex === "#000000") continue;

        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }

      // Sort colors by frequency
      const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);

      const primary = sortedColors[0]?.[0] || "#2563EB";
      const secondary = sortedColors[1]?.[0] || "#000000";

      setDetectedColors({ primary, secondary });
    };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  const handleGenerateBrandKit = async () => {
    if (!file || !companyName) {
      toast({ title: "Verification Error", description: "Please enter a company name and upload a logo.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      // In a real app, you'd upload the file to S3/Blob storage first.
      // For this demo, we'll use the local preview URL or simulate the upload.
      // Since it's a client component, we'll just pass the colors and name.

      toast({ title: "Analysis Started", description: "Extracting brand DNA from your logo..." });

      const result = await createBrandFromUpload({
        companyName,
        logoUrl: preview!, // This should be a permanent URL in production
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <canvas ref={canvasRef} className="hidden" />

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
          <Card className="border shadow-sm overflow-hidden">
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Logo</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${preview ? "border-primary/20 bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
                    }`}
                >
                  {preview ? (
                    <div className="space-y-4">
                      <div className="relative aspect-video max-w-[240px] mx-auto overflow-hidden rounded-lg bg-white shadow-inner flex items-center justify-center border">
                        <img src={preview} alt="Logo" className="max-w-full max-h-full object-contain p-4" />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setPreview(null)}>Change Image</Button>
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
            <Card className="border shadow-sm">
              <CardContent className="p-8 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Detected Brand Colors
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Primary</p>
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                      <div className="w-10 h-10 rounded-full shadow-sm border" style={{ backgroundColor: detectedColors.primary }} />
                      <span className="font-mono text-sm uppercase">{detectedColors.primary}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Secondary</p>
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                      <div className="w-10 h-10 rounded-full shadow-sm border" style={{ backgroundColor: detectedColors.secondary }} />
                      <span className="font-mono text-sm uppercase">{detectedColors.secondary}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">We will use these colors to generate your matching brand assets.</p>
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
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Expanding Your Brand...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Brand Kit
              </>
            )}
          </Button>
        </div>

        <div className="lg:sticky lg:top-8 space-y-6">
          <Card className="border bg-gradient-to-br from-primary/5 to-purple-500/5 min-h-[500px] flex flex-col items-center justify-center p-8 text-center border-dashed">
            <div className="max-w-sm space-y-6">
              <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center mx-auto -rotate-6 border">
                {preview ? <img src={preview} className="w-16 h-16 object-contain" /> : <ImageIcon className="w-12 h-12 text-muted-foreground" />}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Instantly expand your brand</h3>
                <p className="text-muted-foreground">
                  Upload your logo and we'll automatically generate:
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Social Posts", "Marketing Flyers", "Business Cards", "Letterheads",
                  "Ad Creatives", "Email Headers", "PowerPoint Templates", "Stickers"
                ].map(item => (
                  <div key={item} className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-semibold shadow-sm border border-black/5">
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

