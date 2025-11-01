"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Download, RefreshCw, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { generateLogo, downloadImage } from "../../actions/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  IconBolt,
  IconBulb,
  IconColorFilter,
  IconComponents,
  IconCube,
  IconFlame,
  IconMinimize,
  IconSparkles,
  IconCircle,
  IconBriefcase,
  IconPalette,
  IconGeometry,
  IconBuildingSkyscraper,
} from "@tabler/icons-react";
import {
  IconBrandDribbble,
  IconBrandLinkedin,
  IconBrandYoutube,
} from "@tabler/icons-react";

const STYLE_OPTIONS = [
  {
    id: "minimal",
    name: "Minimal",
    icon: IconCircle,
    details:
      "Flashy, attention grabbing, bold, futuristic, and eye-catching. Use vibrant neon colors with metallic, shiny, and glossy accents.",
  },
  {
    id: "tech",
    name: "Technology",
    icon: IconBolt,
    details:
      "highly detailed, sharp focus, cinematic, photorealistic, Minimalist, clean, sleek, neutral color pallete with subtle accents, clean lines, shadows, and flat.",
  },
  {
    id: "corporate",
    name: "Corporate",
    icon: IconBriefcase,
    details:
      "modern, forward-thinking, flat design, geometric shapes, clean lines, natural colors with subtle accents, use strategic negative space to create visual interest.",
  },
  {
    id: "creative",
    name: "Creative",
    icon: IconPalette,
    details:
      "playful, lighthearted, bright bold colors, rounded shapes, lively.",
  },
  {
    id: "abstract",
    name: "Abstract",
    icon: IconGeometry,
    details:
      "abstract, artistic, creative, unique shapes, patterns, and textures to create a visually interesting and wild logo.",
  },
  {
    id: "flashy",
    name: "Flashy",
    icon: IconSparkles,
    details:
      "Flashy, attention grabbing, bold, futuristic, and eye-catching. Use vibrant neon colors with metallic, shiny, and glossy accents.",
  },
];

const MODEL_OPTIONS = [
  {
    id: "black-forest-labs/flux-schnell",
    name: "Flux Schnell",
    description: "Better for realistic and detailed logos",
  },
  {
    id: "black-forest-labs/flux-dev",
    name: "Flux Dev",
    description: "Better for realistic and detailed logos",
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

const Footer = () => (
  <div className="flex justify-between items-center mt-4 px-4 max-sm:flex-col">
    <div className="px-4 py-2 text-sm max-sm:hidden">
      <span className="text-muted-foreground">AI-powered logo generation</span>
    </div>

    <div className="px-4 py-2 text-sm">
      Made with ❤️ by{" "}
      <Link 
        href="https://www.webbuddy.agency" 
        target="_blank"
        className="text-foreground hover:text-primary transition-colors"
      >
        Webbuddy
      </Link>
    </div>

    <div className="flex gap-4 items-center max-sm:hidden">
      {[
        { href: "https://dribbble.com/webbuddy", Icon: IconBrandDribbble },
        { href: "https://www.linkedin.com/company/webbuddy-agency/posts/?feedView=all", Icon: IconBrandLinkedin },
        { href: "https://www.youtube.com/@WebBuddyAgency", Icon: IconBrandYoutube }
      ].map(({ href, Icon }) => (
        <Link 
          key={href}
          href={href} 
          target="_blank"
          className="hover:text-primary transition-colors"
        >
          <Icon className="size-5" />
        </Link>
      ))}
    </div>
  </div>
);

const TOTAL_STEPS = 5;

export default function GeneratePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("minimal");
  const [primaryColor, setPrimaryColor] = useState("#2563EB");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedLogo, setGeneratedLogo] = useState("");
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [selectedModel, setSelectedModel] = useState<
    | "dall-e-3"
    | "black-forest-labs/flux-schnell"
    | "black-forest-labs/flux-dev"
  >("black-forest-labs/flux-schnell");
  const [selectedSize, setSelectedSize] = useState<
    "256x256" | "512x512" | "1024x1024"
  >("512x512");
  const [selectedQuality, setSelectedQuality] = useState<"standard" | "hd">(
    "standard"
  );
  
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
        return primaryColor !== "" && backgroundColor !== "" && !!selectedModel;
      case 4:
        return !!selectedSize && !!selectedQuality;
      case 5:
        return true; // Additional details are optional
      default:
        return false;
    }
  }, [currentStep, companyName, selectedStyle, primaryColor, backgroundColor, selectedModel, selectedSize, selectedQuality]);

  const nextStep = () => {
    if (canProceedToNextStep && currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    try {
      const result = await generateLogo({
        companyName,
        style: selectedStyle,
        symbolPreference: "modern and professional",
        primaryColor,
        secondaryColor: backgroundColor,
        model: selectedModel,
        size: selectedSize,
        quality: selectedQuality,
        additionalInfo,
      });

      if (result.success && result.url) {
        setImageLoaded(false);
        setGeneratedLogo(result.url);
        // Dispatch event to refresh credits in topbar
        window.dispatchEvent(new CustomEvent('refreshCredits'));
        toast({
          title: "Success!",
          description: "Your logo has been generated successfully",
          variant: "success"
        });
      } else {
        throw new Error(result.error || "Failed to generate logo");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [companyName, selectedStyle, primaryColor, backgroundColor, selectedModel, selectedSize, selectedQuality, additionalInfo, isFormValid, toast]);

  const handleDownload = useCallback(async () => {
    if (!generatedLogo) return;
    
    setIsDownloading(true);
    try {
      const result = await downloadImage(generatedLogo);
      if (result.success && result.data) {
        const a = document.createElement("a");
        a.href = result.data;
        a.download = `${companyName.trim()}-logo.webp`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast({
          title: "Download started",
          description: "Your logo is being downloaded",
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

  const steps = [
    { number: 1, label: "Brand Name", completed: companyName.trim().length > 0 },
    { number: 2, label: "Style", completed: selectedStyle !== "" },
    { number: 3, label: "Colors & Model", completed: primaryColor !== "" && backgroundColor !== "" && !!selectedModel },
    { number: 4, label: "Size & Quality", completed: !!selectedSize && !!selectedQuality },
    { number: 5, label: "Additional Details", completed: true },
  ];

  const renderStepContent = () => {
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
            <div className="text-center space-y-2 mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold">What's your brand name?</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Enter the name you want to appear in your logo</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium ml-2">Brand Name</label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your brand name"
                className="h-12 sm:h-14 text-base sm:text-lg border-2"
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
            <div className="text-center space-y-2 mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold">Choose a style</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Select the design style that matches your brand</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {STYLE_OPTIONS.map((style) => (
                <motion.button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 sm:p-6 rounded-xl border-2 flex flex-col items-center gap-2 sm:gap-3 text-center transition-all ${
                    selectedStyle === style.id
                      ? "border-primary bg-primary/10 text-foreground font-semibold ring-2 ring-primary shadow-lg"
                      : "border-border hover:bg-accent/50 hover:border-primary/50"
                  }`}
                >
                  <style.icon
                    className={`w-6 h-6 sm:w-8 sm:h-8 ${selectedStyle === style.id ? "text-primary" : "text-muted-foreground"}`}
                    strokeWidth={1.5}
                  />
                  <div className="font-semibold text-sm sm:text-base">{style.name}</div>
                </motion.button>
              ))}
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
            <div className="text-center space-y-2 mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold">Colors & AI Model</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Customize colors and choose your AI model</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium ml-2">Primary Color</label>
                <Select value={primaryColor} onValueChange={setPrimaryColor}>
                  <SelectTrigger className="h-12 sm:h-14 border-2">
                    <SelectValue>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-border"
                          style={{ backgroundColor: primaryColor }}
                        />
                        {COLOR_OPTIONS.find((c) => c.id === primaryColor)?.name || "Select Color"}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((color) => (
                      <SelectItem key={color.id} value={color.id}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: color.id }}
                          />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium ml-2">Background</label>
                <Select value={backgroundColor} onValueChange={setBackgroundColor}>
                  <SelectTrigger className="h-12 sm:h-14 border-2">
                    <SelectValue>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full border-2"
                          style={{ backgroundColor: backgroundColor }}
                        />
                        {BACKGROUND_OPTIONS.find((c) => c.id === backgroundColor)?.name || "Select Background"}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {BACKGROUND_OPTIONS.map((color) => (
                      <SelectItem key={color.id} value={color.id}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-full border"
                            style={{ backgroundColor: color.id }}
                          />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium ml-2">AI Model</label>
                <Select
                  value={selectedModel}
                  onValueChange={(value: "dall-e-3" | "black-forest-labs/flux-schnell" | "black-forest-labs/flux-dev") => setSelectedModel(value)}
                >
                  <SelectTrigger className="h-12 sm:h-14 border-2">
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
            <div className="text-center space-y-2 mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold">Size & Quality</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Choose the output size and quality</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium ml-2">Image Size</label>
                <Select
                  value={selectedSize}
                  onValueChange={(value: "256x256" | "512x512" | "1024x1024") => setSelectedSize(value)}
                >
                  <SelectTrigger className="h-12 sm:h-14 border-2">
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
                  onValueChange={(value: "standard" | "hd") => setSelectedQuality(value)}
                >
                  <SelectTrigger className="h-12 sm:h-14 border-2">
                    <SelectValue placeholder="Select Quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="hd">HD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2 mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold">Additional Details</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Tell us more about your brand (optional)</p>
            </div>
            <div className="space-y-2">
              <Textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Describe your brand personality, target audience, or any specific preferences..."
                className="min-h-[150px] sm:min-h-[200px] text-sm sm:text-base border-2 p-3 sm:p-4"
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Generate Logo
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Create unique, professional logos with AI
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="relative">
          {/* Background Line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-muted/30 rounded-full" />
          
          {/* Active Progress Line */}
          <motion.div
            className="absolute top-5 left-0 h-1 bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%`
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center">
                {/* Step Circle */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: currentStep === step.number ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    currentStep >= step.number
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-background border-2 border-muted text-muted-foreground"
                  } ${
                    currentStep === step.number
                      ? "ring-2 sm:ring-4 ring-primary/20"
                      : ""
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <span className="text-xs sm:text-sm font-bold">{step.number}</span>
                  )}
                </motion.div>

                {/* Step Label */}
                <div
                  className={`mt-2 sm:mt-3 text-[10px] sm:text-xs font-medium text-center transition-colors duration-300 max-w-[60px] sm:max-w-none ${
                    currentStep >= step.number
                      ? "text-foreground"
                      : "text-muted-foreground"
                  } ${
                    currentStep === step.number ? "font-semibold" : ""
                  }`}
                >
                  {step.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 relative gap-4 sm:gap-6 ${
        generatedLogo && currentStep === TOTAL_STEPS ? 'lg:grid-cols-2' : ''
      }`}>
        {/* Left Column */}
        <div>
          <Card className="border-2 border-primary/10 h-full shadow-xl">
            <CardContent className="p-4 sm:p-6 lg:p-8 min-h-[400px] sm:min-h-[500px] flex flex-col space-y-4">
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-auto pt-6 sm:pt-8 gap-2">
                <Button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>
                {currentStep < TOTAL_STEPS ? (
                  <Button
                    onClick={nextStep}
                    disabled={!canProceedToNextStep}
                    size="sm"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4"
                  >
                    Next
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleGenerate}
                    disabled={!isFormValid || loading}
                    size="sm"
                    className="flex items-center gap-1 sm:gap-2 bg-primary hover:bg-primary/80 text-xs sm:text-sm px-3 sm:px-4"
                  >
                    {loading ? (
                      <>
                        <span className="hidden sm:inline">Generating...</span>
                        <span className="sm:hidden">...</span>
                        <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Generate Logo</span>
                        <span className="sm:hidden">Generate</span>
                        <IconSparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Only show after step 5 completion */}
        {generatedLogo && currentStep === TOTAL_STEPS && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="rounded-xl border shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Your Logo</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Generated with {selectedStyle} style
                    </p>
                  </div>

                  <div
                    className="aspect-square rounded-lg border bg-white"
                    style={{ backgroundColor }}
                  >
                    <img
                      src={generatedLogo}
                      alt="Generated logo"
                      className="w-full h-full rounded-lg object-contain p-4 sm:p-6"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        onClick={handleGenerate}
                        size="sm"
                        disabled={loading}
                        className="flex-1 text-xs sm:text-sm"
                      >
                        <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        {loading ? "..." : <span className="hidden sm:inline">Regenerate</span>}
                        {loading ? "" : <span className="sm:hidden">Regen</span>}
                      </Button>
                      <Button
                        onClick={handleDownload}
                        variant="outline"
                        size="sm"
                        disabled={isDownloading}
                        className="flex-1 text-xs sm:text-sm"
                      >
                        <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        {isDownloading ? "..." : "Download"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}

