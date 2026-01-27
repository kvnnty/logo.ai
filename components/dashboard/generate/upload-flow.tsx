"use client";

import { createBrandFromUpload } from "@/app/actions/upload-actions";
import { uploadFile } from "@/lib/utils/upload";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useMemo, useCallback } from "react";
import { GenerationLoadingModal } from "./components/loading-modal";
import { Stepper } from "./components/stepper";
import { StepWrapper } from "./components/step-wrapper";
import { UploadLogoStep } from "./components/upload-logo-step";
import { BrandNameStep } from "./components/brand-name-step";
import { AboutBrandStep } from "./components/about-brand-step";
import { StepIndustry } from "./components/industry-step";
import { ColorSchemesStep } from "./components/color-schemes-step";
import { StyleStep } from "./components/style-step";
import { PreferencesStep } from "./components/preferences-step";
import { STEPS, TOTAL_STEPS } from "./constants";
import { ModelType, QualityType, SizeType } from "./types";
import clsx from "clsx";
import { Sparkles } from "lucide-react";

// Upload flow has 8 steps (upload + 7 same as AI flow)
const UPLOAD_TOTAL_STEPS = 8;

const UPLOAD_STEPS = [
  { number: 1, label: "Upload" },
  { number: 2, label: "Company" },
  { number: 3, label: "About" },
  { number: 4, label: "Industry" },
  { number: 5, label: "Colors" },
  { number: 6, label: "Style" },
  { number: 7, label: "Configs" },
  { number: 8, label: "Generate" },
];

export function UploadFlow({ onBack }: { onBack: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [detectedColors, setDetectedColors] = useState<{ primary: string; secondary: string }>({
    primary: "#000000",
    secondary: "#ffffff",
  });
  const [suggestedColors, setSuggestedColors] = useState<string[]>([]);
  
  // Form state (same as AI flow)
  const [companyName, setCompanyName] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedColorSchemes, setSelectedColorSchemes] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelType>("black-forest-labs/flux-schnell");
  const [selectedSize, setSelectedSize] = useState<SizeType>("512x512");
  const [selectedQuality, setSelectedQuality] = useState<QualityType>("standard");
  
  // Loading state
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("");
  const [progress, setProgress] = useState(0);

  const { toast } = useToast();
  const router = useRouter();

  const isFormValid = useMemo(() => {
    if (currentStep === 1) return !!preview && !!file;
    if (currentStep === 2) return companyName.trim().length > 0;
    return true;
  }, [currentStep, preview, file, companyName]);

  const canProceedToNextStep = useMemo(() => {
    switch (currentStep) {
      case 1: return !!preview && !!file; // Must upload logo
      case 2: return companyName.trim().length > 0; // Must have company name
      case 3: return true; // Description is optional
      case 4: return true; // Industry is optional
      case 5: return true; // Color schemes are optional
      case 6: return true; // Visual styles are optional
      case 7: return true; // Preferences are optional
      case 8: return true; // Ready to generate
      default: return false;
    }
  }, [currentStep, preview, file, companyName]);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, UPLOAD_TOTAL_STEPS));
  const prevStep = () => {
    if (currentStep === 1) onBack();
    else setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleGenerateBrandKit = useCallback(async () => {
    if (!file || !companyName) {
      toast({ 
        title: "Verification Error", 
        description: "Please upload a logo and enter a company name.", 
        variant: "destructive" 
      });
      return;
    }

    setIsGenerating(true);
    setProgress(10);
    setLoadingPhase("Uploading logo to storage...");

    try {
      // Upload file to MongoDB GridFS
      const uploadResult = await uploadFile(file, {
        folder: 'logos',
      });

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Failed to upload logo");
      }

      setProgress(30);
      setLoadingPhase("Analyzing your logo and extracting brand DNA...");

      await new Promise(resolve => setTimeout(resolve, 400));
      setProgress(50);
      setLoadingPhase("Crafting your brand strategy...");

      const result = await createBrandFromUpload({
        companyName,
        logoUrl: uploadResult.url,
        primaryColor: detectedColors.primary,
        secondaryColor: detectedColors.secondary,
        description: additionalInfo || undefined,
        industries: selectedIndustries.length > 0 ? selectedIndustries : undefined,
        colorSchemes: selectedColorSchemes.length > 0 ? selectedColorSchemes : undefined,
        styles: selectedStyles.length > 0 ? selectedStyles : undefined,
        model: selectedModel,
        size: selectedSize,
        quality: selectedQuality,
      });

      setProgress(80);
      setLoadingPhase("Generating your brand assets...");

      if (result.success && result.brandId) {
        setProgress(100);
        setLoadingPhase("Almost there! Finalizing your brand kit...");

        // Brief delay to show 100% completion
        await new Promise(resolve => setTimeout(resolve, 600));

        router.push(`/dashboard/my-brands/${result.brandId}`);
      } else {
        throw new Error(result.error || "Failed to create brand kit");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create brand kit";
      setIsGenerating(false);
      toast({ title: "Generation Failed", description: message, variant: "destructive" });
    }
  }, [file, companyName, detectedColors, additionalInfo, selectedIndustries, selectedColorSchemes, selectedStyles, selectedModel, selectedSize, selectedQuality, toast, router]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <UploadLogoStep
            file={file}
            setFile={setFile}
            preview={preview}
            setPreview={setPreview}
            detectedColors={detectedColors}
            setDetectedColors={setDetectedColors}
            suggestedColors={suggestedColors}
            setSuggestedColors={setSuggestedColors}
          />
        );
      case 2:
        return <BrandNameStep companyName={companyName} setCompanyName={setCompanyName} />;
      case 3:
        return (
          <AboutBrandStep
            additionalInfo={additionalInfo}
            setAdditionalInfo={setAdditionalInfo}
            onSkip={nextStep}
          />
        );
      case 4:
        return (
          <StepIndustry
            selectedIndustries={selectedIndustries}
            setSelectedIndustries={setSelectedIndustries}
            onSkip={nextStep}
          />
        );
      case 5:
        return (
          <ColorSchemesStep
            selectedColorSchemes={selectedColorSchemes}
            setSelectedColorSchemes={setSelectedColorSchemes}
            onSkip={nextStep}
            detectedColors={detectedColors}
          />
        );
      case 6:
        return (
          <StyleStep
            selectedStyles={selectedStyles}
            setSelectedStyles={setSelectedStyles}
            onSkip={nextStep}
          />
        );
      case 7:
        return (
          <PreferencesStep
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            selectedQuality={selectedQuality}
            setSelectedQuality={setSelectedQuality}
          />
        );
      case 8:
        return (
          <div key="step-review" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Ready to Generate Your Brand Kit</h2>
              <p className="text-sm text-muted-foreground">
                Review your selections and generate your complete brand kit with 160+ assets.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Preview */}
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Your Logo</p>
                {preview && (
                  <div className="aspect-video rounded-lg border-2 border-primary/20 p-6 flex items-center justify-center">
                    <img src={preview} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>
              
              {/* Details */}
              <div className="space-y-4 mt-8">
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Company Name</p>
                  <p className="font-semibold text-lg">{companyName || "Not set"}</p>
                </div>
                
                {additionalInfo && (
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Description</p>
                    <p className="text-sm text-foreground">{additionalInfo}</p>
                  </div>
                )}
                
                {selectedIndustries.length > 0 && (
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Industry</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedIndustries.map((industry) => (
                        <span key={industry} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-3">Brand Colors</p>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="w-full h-12 rounded border-2 border-white mb-2" style={{ backgroundColor: detectedColors.primary }} />
                      <p className="text-xs font-mono text-center">{detectedColors.primary}</p>
                      <p className="text-xs text-muted-foreground text-center">Primary</p>
                    </div>
                    <div className="flex-1">
                      <div className="w-full h-12 rounded border-2 border-white mb-2" style={{ backgroundColor: detectedColors.secondary }} />
                      <p className="text-xs font-mono text-center">{detectedColors.secondary}</p>
                      <p className="text-xs text-muted-foreground text-center">Secondary</p>
                    </div>
                  </div>
                </div>
                
                {selectedStyles.length > 0 && (
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Visual Styles</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedStyles.map((style) => (
                        <span key={style} className="px-3 py-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* What You'll Get */}
            <div className="mt-6 p-6 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl border border-primary/20">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                What You'll Get
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Social Posts", "Marketing Flyers", "Business Cards", "Letterheads", "Ad Creatives", "Email Headers", "PowerPoint Templates", "Stickers"].map((item) => (
                  <div key={item} className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg text-xs font-semibold border border-black/5 text-center">
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-sm text-primary font-bold mt-4 text-center">160+ Assets in seconds</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={clsx("mx-auto max-w-5xl")}>
      <Stepper currentStep={currentStep} steps={UPLOAD_STEPS} totalSteps={UPLOAD_TOTAL_STEPS} />

      <div className="pt-8">
        <StepWrapper
          currentStep={currentStep}
          prevStep={prevStep}
          nextStep={currentStep < 8 ? nextStep : undefined}
          handleGenerate={currentStep === 8 ? handleGenerateBrandKit : undefined}
          canProceedToNextStep={canProceedToNextStep}
          isFormValid={isFormValid}
          loading={isGenerating}
        >
          {renderStepContent()}
        </StepWrapper>
      </div>

      <GenerationLoadingModal
        isOpen={isGenerating}
        phase={loadingPhase || "Setting things in motion and preparing something amazing..."}
        progress={progress}
        title="Sparking Up the Magic ✨"
      />
    </div>
  );
}
