"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Upload, ImageIcon, Check, Loader2 } from "lucide-react";

export function UploadFlow({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      setIsComplete(false); // Reset completion status on new file
    }
  };

  const handleUploadAndAnalyze = () => {
    if (!file) return;

    setIsAnalyzing(true);
    // Simulate specific time for analysis (replace with actual API call)
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsComplete(true);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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
        <h2 className="text-2xl font-bold">Upload Your Brand</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Card */}
        <Card className="border-2 border-dashed border-primary/20 bg-muted/10">
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center gap-6">
            {preview ? (
              <div className="relative w-full max-w-sm aspect-square bg-card rounded-xl border-2 shadow-sm overflow-hidden flex items-center justify-center">
                <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain p-4" />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setIsComplete(false);
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Click to upload your logo</h3>
                  <p className="text-sm text-muted-foreground">
                    SVG, PNG, JPG or WEBP (max. 800x400px)
                  </p>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="logo-upload"
                  onChange={handleFileChange}
                />
                <Button asChild variant="outline">
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    Select File
                  </label>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status/Results Card */}
        <Card className="h-full border-2 shadow-lg">
          <CardContent className="p-8 h-full flex flex-col justify-center gap-6">
            {!file ? (
              <div className="text-center text-muted-foreground space-y-4">
                <ImageIcon className="w-16 h-16 mx-auto opacity-20" />
                <p>Upload a logo to start expanding your brand identity.</p>
              </div>
            ) : isAnalyzing ? (
              <div className="text-center space-y-6">
                <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Analyzing your brand...</h3>
                  <p className="text-muted-foreground">Extracting colors, shapes, and style.</p>
                </div>
              </div>
            ) : isComplete ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Brand Analysis Complete!</h3>
                  <p className="text-muted-foreground">We've extracted your brand DNA.</p>
                </div>
                <Button className="w-full" size="lg">
                  View Brand Kit
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Ready to analyze</h3>
                  <p className="text-muted-foreground">We will identify your primary colors and visual style to generate matching assets.</p>
                </div>
                <Button onClick={handleUploadAndAnalyze} className="w-full" size="lg">
                  <Upload className="mr-2 h-4 w-4" />
                  Generate Brand Kit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
