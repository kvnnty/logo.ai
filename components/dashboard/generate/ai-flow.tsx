"use client";

import { finalizeBrandLogo, generateBrandIdentity, generateLogos, getCredits, saveFinalBrand } from "@/app/actions/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { BrandCanvasEditor } from "../canvas/brand-canvas-editor";

// Constants & Types
import { STEPS, TOTAL_STEPS } from "./constants";
import { LogoConcept, ModelType, QualityType, SizeType } from "./types";

// Sub-components
import { AboutBrandStep } from "./components/about-brand-step";
import { BrandNameStep } from "./components/brand-name-step";
import { ColorSchemesStep } from "./components/color-schemes-step";
import { StepIndustry } from "./components/industry-step";
import { GenerationLoadingModal } from "./components/loading-modal";
import { PreferencesStep } from "./components/preferences-step";
import { ResultsStep } from "./components/results-step";
import { StepWrapper } from "./components/step-wrapper";
import { Stepper } from "./components/stepper";
import { StyleStep } from "./components/style-step";
import clsx from "clsx";

export function AIFlow({ onBack }: { onBack: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
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
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedColorSchemes, setSelectedColorSchemes] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const isFormValid = useMemo(() => companyName.trim().length > 0, [companyName]);

  const canProceedToNextStep = useMemo(() => {
    switch (currentStep) {
      case 1: return companyName.trim().length > 0;
      case 2: return true; // Description is optional
      case 3: return true; // Industry is optional
      case 4: return true; // Color schemes are optional
      case 5: return true; // Visual styles are optional
      case 6: return !!selectedModel && !!selectedSize && !!selectedQuality;
      case 7: return generatedConcepts.length > 0;
      default: return false;
    }
  }, [currentStep, companyName, selectedModel, selectedSize, selectedQuality, generatedConcepts]);

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
      if (credits.remaining <= 0) {
        toast({
          title: "You’re out of credits",
          description: "Top up your credits to generate new logo concepts.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      setProgress(20);

      let currentBrandData = brandData;
      if (!currentBrandData) {
        setLoadingPhase("Phase 1: Crafting your brand strategy...");
        setProgress(30);
        const identityResult = await generateBrandIdentity({
          companyName,
          description: additionalInfo,
          style: selectedStyles[0] || "minimal", // Use first selected style or default
          model: selectedModel,
          industries: selectedIndustries,
          colorSchemes: selectedColorSchemes,
          logoStyles: selectedStyles, // Use selectedStyles for logoStyles
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
      const logoResult = await generateLogos(
        currentBrandData,
        selectedModel,
        selectedIndustries,
        selectedColorSchemes,
        selectedStyles,
        selectedSize,
        selectedQuality
      );
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
  }, [companyName, selectedStyles, selectedModel, selectedSize, selectedQuality, additionalInfo, selectedIndustries, selectedColorSchemes, isFormValid, toast, brandData]);

  const handleGenerateMore = useCallback(async () => {
    if (!brandData) return;
    setIsGeneratingMore(true);
    try {
      const logoResult = await generateLogos(
        brandData,
        selectedModel,
        selectedIndustries,
        selectedColorSchemes,
        selectedStyles,
        selectedSize,
        selectedQuality
      );
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
  }, [brandData, selectedModel, selectedSize, selectedQuality, selectedIndustries, selectedColorSchemes, selectedStyles, toast]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BrandNameStep companyName={companyName} setCompanyName={setCompanyName} />;
      case 2:
        return <AboutBrandStep additionalInfo={additionalInfo} setAdditionalInfo={setAdditionalInfo} onSkip={nextStep} />;
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
          <ColorSchemesStep
            selectedColorSchemes={selectedColorSchemes}
            setSelectedColorSchemes={setSelectedColorSchemes}
            onSkip={nextStep}
          />
        );
      case 5:
        return (
          <StyleStep
            selectedStyles={selectedStyles}
            setSelectedStyles={setSelectedStyles}
            onSkip={nextStep}
          />
        );
      case 6:
        return (
          <PreferencesStep
            selectedModel={selectedModel} setSelectedModel={setSelectedModel}
            selectedSize={selectedSize} setSelectedSize={setSelectedSize}
            selectedQuality={selectedQuality} setSelectedQuality={setSelectedQuality}
          />
        );
      case 7:
        return (
          <ResultsStep
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
    <div className={clsx("mx-auto", currentStep === 7 ? "max-w-7xl" : "max-w-5xl")}>
      <Stepper currentStep={currentStep} steps={STEPS} totalSteps={TOTAL_STEPS} />

      <div className={currentStep === 7 ? "w-full" : "pt-8"}>
        <StepWrapper
          currentStep={currentStep}
          prevStep={prevStep}
          nextStep={currentStep < 6 ? nextStep : undefined}
          handleGenerate={currentStep === 6 ? handleGenerate : undefined}
          canProceedToNextStep={canProceedToNextStep}
          isFormValid={isFormValid}
          loading={loading}
          remainingCredits={remainingCredits ?? undefined}
          onGoToCredits={() => router.push("/dashboard/credits")}
        >
          {renderStepContent()}
        </StepWrapper>
      </div>

      <GenerationLoadingModal
        isOpen={loading && currentStep === 6}
        phase={loadingPhase}
        progress={progress}
      />
    </div>
  );
}
