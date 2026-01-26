"use client";

import { finalizeBrandLogo, generateBrandIdentity, generateLogos, getCredits, saveFinalBrand } from "@/app/actions/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { BrandCanvasEditor } from "../canvas/brand-canvas-editor";

// Constants & Types
import { STEPS, TOTAL_STEPS } from "./constants";
import { LogoConcept, ModelType, SizeType, QualityType } from "./types";

// Sub-components
import { Stepper } from "./components/stepper";
import { StepWrapper } from "./components/step-wrapper";
import { Step1Name } from "./components/step1-name";
import { Step2About } from "./components/step2-about";
import { StepIndustry } from "./components/step-industry";
import { StepColorSchemes } from "./components/step-color-schemes";
import { StepLogoStyle } from "./components/step-logo-style";
import { Step3Style } from "./components/step3-style";
import { Step4Preferences } from "./components/step4-preferences";
import { Step5Results } from "./components/step5-results";
import { GenerationLoadingModal } from "./components/loading-modal";

export function AIFlow({ onBack }: { onBack: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("minimal");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [brandData, setBrandData] = useState<any>(null);
  const [generatedConcepts, setGeneratedConcepts] = useState<LogoConcept[]>([]);
  const [selectedConceptIndex, setSelectedConceptIndex] = useState<number>(0);
  const [editingAsset, setEditingAsset] = useState<{
    initialScene: any;
    brandId: string | null;
    assetId: string;
  } | null>(null);
  const [lastBrandId, setLastBrandId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("");
  const [progress, setProgress] = useState(0);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [selectedModel, setSelectedModel] = useState<ModelType>("black-forest-labs/flux-schnell");
  const [selectedSize, setSelectedSize] = useState<SizeType>("512x512");
  const [selectedQuality, setSelectedQuality] = useState<QualityType>("standard");

  const isFormValid = useMemo(() => companyName.trim().length > 0, [companyName]);

  const canProceedToNextStep = useMemo(() => {
    switch (currentStep) {
      case 1: return companyName.trim().length > 0;
      case 2: return true; // Description is optional
      case 3: return true; // Industry is optional
      case 4: return true; // Color schemes are optional
      case 5: return true; // Logo styles are optional
      case 6: return selectedStyle !== ""; // Visual style
      case 7: return !!selectedModel && !!selectedSize && !!selectedQuality;
      case 8: return generatedConcepts.length > 0;
      default: return false;
    }
  }, [currentStep, companyName, selectedStyle, selectedModel, selectedSize, selectedQuality, generatedConcepts]);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const prevStep = () => {
    if (currentStep === 1) onBack();
    else setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleGenerate = useCallback(async () => {
    if (!isFormValid) return;
    setLoading(true);
    setProgress(10);
    setLoadingPhase("Analyzing requirements...");
    try {
      const credits = await getCredits();
      setRemainingCredits(credits.remaining);
      setProgress(20);

      let currentBrandData = brandData;
      if (!currentBrandData) {
        setLoadingPhase("Phase 1: Crafting your brand strategy...");
        setProgress(30);
        const identityResult = await generateBrandIdentity({
          companyName,
          description: additionalInfo,
          style: selectedStyle,
          model: selectedModel,
          industries: selectedIndustries,
          colorSchemes: selectedColorSchemes,
          logoStyles: selectedLogoStyles,
        });
        if (!identityResult.success || !identityResult.brandData) {
          throw new Error(identityResult.error || "Failed to generate brand identity");
        }
        currentBrandData = identityResult.brandData;
        setBrandData(currentBrandData);
        setProgress(60);
      } else {
        setProgress(50);
      }

      setLoadingPhase("Phase 2: Generating unique logo concepts...");
      const logoResult = await generateLogos(currentBrandData, selectedModel);
      if (!logoResult.success || !logoResult.concepts) {
        throw new Error(logoResult.error || "Failed to generate logos");
      }

      setProgress(90);
      setGeneratedConcepts(prev => [...prev, ...logoResult.concepts]);
      setRemainingCredits(logoResult.remainingCredits);
      window.dispatchEvent(new CustomEvent('refreshCredits'));

      setProgress(100);
      // Brief delay to show 100% completion
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStep(8);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [companyName, selectedStyle, selectedModel, additionalInfo, selectedIndustries, selectedColorSchemes, selectedLogoStyles, isFormValid, toast, brandData]);

  const handleGenerateMore = useCallback(async () => {
    if (!brandData) return;
    setIsGeneratingMore(true);
    try {
      const logoResult = await generateLogos(brandData, selectedModel);
      if (!logoResult.success || !logoResult.concepts) {
        throw new Error(logoResult.error || "Failed to generate logos");
      }

      setGeneratedConcepts(prev => [...prev, ...logoResult.concepts]);
      setRemainingCredits(logoResult.remainingCredits);
      window.dispatchEvent(new CustomEvent('refreshCredits'));
      
      toast({
        title: "Success!",
        description: `Generated ${logoResult.concepts.length} new logo concepts`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMore(false);
    }
  }, [brandData, selectedModel, toast]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1Name companyName={companyName} setCompanyName={setCompanyName} />;
      case 2:
        return <Step2About additionalInfo={additionalInfo} setAdditionalInfo={setAdditionalInfo} />;
      case 3:
        return (
          <StepIndustry
            selectedIndustries={selectedIndustries}
            setSelectedIndustries={setSelectedIndustries}
            onSkip={nextStep}
          />
        );
      case 4:
        return (
          <StepColorSchemes
            selectedColorSchemes={selectedColorSchemes}
            setSelectedColorSchemes={setSelectedColorSchemes}
            onSkip={nextStep}
          />
        );
      case 5:
        return (
          <StepLogoStyle
            selectedStyles={selectedLogoStyles}
            setSelectedStyles={setSelectedLogoStyles}
            onSkip={nextStep}
          />
        );
      case 6:
        return <Step3Style selectedStyle={selectedStyle} setSelectedStyle={setSelectedStyle} />;
      case 7:
        return (
          <Step4Preferences
            selectedModel={selectedModel} setSelectedModel={setSelectedModel}
            selectedSize={selectedSize} setSelectedSize={setSelectedSize}
            selectedQuality={selectedQuality} setSelectedQuality={setSelectedQuality}
          />
        );
      case 8:
        return (
          <Step5Results
            generatedConcepts={generatedConcepts}
            companyName={companyName}
            selectedConceptIndex={selectedConceptIndex}
            setSelectedConceptIndex={setSelectedConceptIndex}
            remainingCredits={remainingCredits}
            loading={isGeneratingMore}
            handleGenerate={handleGenerateMore}
            lastBrandId={lastBrandId}
            setEditingAsset={setEditingAsset}
            finalizeBrandLogo={finalizeBrandLogo}
            saveFinalBrand={saveFinalBrand}
            setLastBrandId={setLastBrandId}
            brandData={brandData}
            router={router}
            toast={toast}
          />
        );
      default:
        return null;
    }
  };

  if (editingAsset) {
    return (
      <BrandCanvasEditor
        brandId={editingAsset.brandId!}
        assetId={editingAsset.assetId}
        initialScene={editingAsset.initialScene}
        onClose={() => setEditingAsset(null)}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Stepper currentStep={currentStep} steps={STEPS} totalSteps={TOTAL_STEPS} />

      <div className={currentStep === 8 ? "w-full" : "pt-8"}>
        <StepWrapper
          currentStep={currentStep}
          prevStep={prevStep}
          nextStep={currentStep < 7 ? nextStep : undefined}
          handleGenerate={currentStep === 7 ? handleGenerate : undefined}
          canProceedToNextStep={canProceedToNextStep}
          isFormValid={isFormValid}
          loading={loading}
        >
          {renderStepContent()}
        </StepWrapper>
      </div>

      <GenerationLoadingModal
        isOpen={loading && currentStep === 7}
        phase={loadingPhase}
        progress={progress}
      />
    </div>
  );
}
