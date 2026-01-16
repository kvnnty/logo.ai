"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Check,
  Circle,
  Monitor,
  Building2,
  Paintbrush,
  Shapes,
  Sparkles,
} from "lucide-react";
import { generateLogo, downloadImage, generateBrandIdentity, prepareAssetBlueprints, generateBrandAsset } from "@/app/actions/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const STYLE_OPTIONS = [
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

const MODEL_OPTIONS = [
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

const SIZE_OPTIONS = [
  { id: "256x256", name: "Small (256x256)" },
  { id: "512x512", name: "Medium (512x512)" },
  { id: "1024x1024", name: "Large (1024x1024)" },
];

const COLOR_OPTIONS = [
  { id: "#2563EB", name: "Blue" },
  { id: "#DC2626", name: "Red" },
  { id: "#D97706", name: "Orange" },
  { id: "#16A34A", name: "Green" },
  { id: "#9333EA", name: "Purple" },
  { id: "#000000", name: "Black" },
];

const BACKGROUND_OPTIONS = [
  { id: "#FFFFFF", name: "White" },
  { id: "#F8FAFC", name: "Light Gray" },
  { id: "#FEE2E2", name: "Light Red" },
  { id: "#000000", name: "Black" },
  { id: "#FEF2F2", name: "Light Red" },
  { id: "#EFF6FF", name: "Light Blue" },
  { id: "#F0FFF4", name: "Light Green" },
];

const TOTAL_STEPS = 4;

export function AIFlow({ onBack }: { onBack: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("minimal");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(null);
  const [lastBrandId, setLastBrandId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedLogo, setGeneratedLogo] = useState("");
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();

  type ModelType = "black-forest-labs/flux-schnell" | "black-forest-labs/flux-dev" | "dall-e-3";
  const [selectedModel, setSelectedModel] = useState<ModelType>("black-forest-labs/flux-schnell");
  type SizeType = "256x256" | "512x512" | "1024x1024";
  const [selectedSize, setSelectedSize] = useState<SizeType>("512x512");
  type QualityType = "standard" | "hd";
  const [selectedQuality, setSelectedQuality] = useState<QualityType>("standard");

  const isFormValid = useMemo(() => {
    return companyName.trim().length > 0;
  }, [companyName]);

  const canProceedToNextStep = useMemo(() => {
    switch (currentStep) {
      case 1:
        return companyName.trim().length > 0;
      case 2:
        return selectedStyle !== "";
      case 3:
        return !!selectedModel && !!selectedSize && !!selectedQuality;
      case 4:
        return true;
      default:
        return false;
    }
  }, [currentStep, companyName, selectedStyle, selectedModel, selectedSize, selectedQuality]);

  const nextStep = () => {
    if (canProceedToNextStep && currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!isFormValid) return;

    setLoading(true);
    setGeneratedOptions([]);
    try {
      // STAGE 1: Generate Brand Identity
      toast({ title: "Phase 1/3", description: "Generating Brand Strategy & Identity..." });

      const identityResult = await generateBrandIdentity({
        companyName,
        description: additionalInfo,
        style: selectedStyle,
        model: selectedModel,
      });

      if (!identityResult.success || !identityResult.brandId) {
        throw new Error(identityResult.error || "Failed to generate brand identity");
      }

      const brandId = identityResult.brandId;
      setLastBrandId(brandId);

      // STAGE 2: Prepare Blueprints
      toast({ title: "Phase 2/3", description: "Designing Asset Blueprints..." });

      const blueprintResult = await prepareAssetBlueprints(brandId);
      if (!blueprintResult.success) {
        throw new Error(blueprintResult.error || "Failed to prepare blueprints");
      }

      // STAGE 3: Generate 10 Logo Variations
      toast({ title: "Phase 3/3", description: "Generating 10 diverse logo variations..." });

      const logoPromises = Array.from({ length: 10 }).map((_, i) =>
        generateBrandAsset(brandId, 'logo', `variant_${i + 1}`, selectedModel)
      );

      const results = await Promise.all(logoPromises);
      const successfulUrls = results
        .filter(r => r.success && r.imageUrl)
        .map(r => r.imageUrl as string);

      if (successfulUrls.length > 0) {
        setGeneratedOptions(successfulUrls);
        window.dispatchEvent(new CustomEvent('refreshCredits'));
      } else {
        throw new Error("Failed to generate any logo variations");
      }

      // Pre-generate some other assets in background
      const otherCategories = ['social_post', 'social_story', 'youtube_thumbnail', 'marketing', 'branding'];
      otherCategories.forEach(cat => {
        generateBrandAsset(brandId, cat, 'variant_1', selectedModel);
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [companyName, selectedStyle, selectedModel, selectedSize, selectedQuality, additionalInfo, isFormValid, toast]);

  const handleDownload = useCallback(async () => {
    if (!generatedLogo) return;

    setIsDownloading(true);
    try {
      const result = await downloadImage(generatedLogo);
      if (result.success && result.data) {
        const a = document.createElement("a");
        a.href = result.data;
        a.download = `${companyName.trim()}-brand.webp`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast({
          title: "Download started",
          description: "Your brand assets are being downloaded",
        });
      } else {
        throw new Error("Failed to download logo");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while downloading",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  }, [generatedLogo, companyName, toast]);

  // Steps Logic
  const steps = [
    { number: 1, label: "Brand Name", completed: companyName.trim().length > 0 },
    { number: 2, label: "Style", completed: selectedStyle !== "" },
    { number: 3, label: "AI Model & Size", completed: !!selectedModel && !!selectedSize && !!selectedQuality },
    { number: 4, label: "Additional Details", completed: true },
  ];

  // Render Step Logic (Extracted from orig file)
  const renderStepContent = () => {
    // ... same switch case as before, just referencing the local state ...
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold">What's your brand name?</h2>
              <p className="text-muted-foreground">Enter the name you want to appear in your brand assets</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium ml-2">Brand Name</label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your brand name"
                className="h-14 text-lg border-2"
                autoFocus
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold">Choose a style</h2>
              <p className="text-muted-foreground">Select the design style that matches your brand</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {STYLE_OPTIONS.map((style) => {
                const IconComponent = style.icon;
                return (
                  <motion.button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-6 rounded-xl border-2 flex flex-col items-center gap-3 text-center transition-all ${selectedStyle === style.id
                      ? "border-primary bg-primary/10 text-foreground font-semibold ring-0.5 ring-primary"
                      : "border-border hover:bg-accent/50 hover:border-primary/50"
                      }`}
                  >
                    <IconComponent className={`w-5 h-5 ${selectedStyle === style.id ? "text-primary" : ""}`} />
                    <div className="text-sm font-semibold">{style.name}</div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold">AI Model & Settings</h2>
              <p className="text-muted-foreground">Choose your AI model and output settings</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium ml-2">AI Model</label>
                <Select
                  value={selectedModel}
                  onValueChange={(value) => setSelectedModel(value as ModelType)}
                >
                  <SelectTrigger className="h-14 border-2">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_OPTIONS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs text-muted-foreground">{model.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium ml-2">Image Size</label>
                  <Select
                    value={selectedSize}
                    onValueChange={(value) => setSelectedSize(value as SizeType)}
                  >
                    <SelectTrigger className="h-14 border-2">
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium ml-2">Quality</label>
                  <Select
                    value={selectedQuality}
                    onValueChange={(value) => setSelectedQuality(value as QualityType)}
                  >
                    <SelectTrigger className="h-14 border-2">
                      <SelectValue placeholder="Select Quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="hd">HD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold">Additional Details</h2>
              <p className="text-muted-foreground">Tell us more about your brand (optional)</p>
            </div>
            <div className="space-y-2">
              <Textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Describe your brand personality, target audience, or any specific preferences..."
                className="min-h-[200px] text-base border p-4"
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };


  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold border-2 transition-all ${currentStep > step.number
                      ? "bg-primary border-primary text-primary-foreground"
                      : currentStep === step.number
                        ? "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "border-border bg-background text-muted-foreground"
                      }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="absolute top-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium text-center mt-2 hidden sm:block">
                    {step.label}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 transition-all ${currentStep > step.number ? "bg-primary" : "bg-border"
                  }`} />
              )}
            </div>
          ))}
        </div>
        <div className="w-full bg-border h-1 rounded-full overflow-hidden mt-16">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <Card className="border">
          <CardContent className="p-8 min-h-[500px] flex flex-col">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-auto pt-8">
              <Button
                onClick={prevStep}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {currentStep === 1 ? "Back" : "Previous"}
              </Button>
              {currentStep < TOTAL_STEPS ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceedToNextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleGenerate}
                  disabled={!isFormValid || loading}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/80"
                >
                  {loading ? (
                    <>
                      Generating...
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      Generate Brand
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Preview (Only show after step 4) */}
        <Card className="h-full rounded-2xl border overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 h-full">
            {generatedOptions.length > 0 ? (
              <motion.div
                className="space-y-6 h-full flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold">Pick your favorite</h3>
                  <p className="text-sm text-muted-foreground">Select the best logo to continue to your dashboard</p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 gap-4">
                  {generatedOptions.map((url, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedResultIndex(idx);
                        toast({ title: "Brand Selected!", description: "Opening your brand dashboard..." });
                        // Extract brandId from URL or pass it through state. 
                        // Since generateBrandAsset updates the brand, we can just redirect.
                        // However, we need the brandId. I should have stored it.
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-4 transition-all ${selectedResultIndex === idx ? "border-primary shadow-lg" : "border-transparent hover:border-primary/30"
                        }`}
                    >
                      <img src={url} alt={`Option ${idx + 1}`} className="w-full h-full object-cover" />
                      {selectedResultIndex === idx && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground rounded-full p-2">
                            <Check className="w-6 h-6" />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <Button
                  className="w-full h-12 text-lg font-bold"
                  disabled={selectedResultIndex === null || !lastBrandId}
                  onClick={() => {
                    if (lastBrandId) {
                      router.push(`/dashboard/my-brands/${lastBrandId}`);
                    }
                  }}
                >
                  Continue with Selection
                </Button>
              </motion.div>
            ) : (
              <motion.div
                className="h-full min-h-[500px] rounded-2xl flex items-center justify-center text-center p-8 relative overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-orange-500/5"></div>

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-primary/20"></div>

                {/* Content */}
                <div className="relative z-10 max-w-md space-y-6">
                  {/* Icon with animated background */}
                  <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-full p-6 backdrop-blur-sm">
                      <Sparkles className="h-16 w-16 text-primary" />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Your Brand kit
                    </h3>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {currentStep >= 4
                        ? "Ready to generate! Click 'Generate Brand' to create 10 diverse variations."
                        : "Complete the steps to see your AI-generated brand assets here."
                      }
                    </p>
                  </div>

                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
