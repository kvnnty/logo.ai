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
import { Step3Style } from "./components/step3-style";
import { Step4Preferences } from "./components/step4-preferences";
import { Step5Results } from "./components/step5-results";

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
      case 3: return selectedStyle !== "";
      case 4: return !!selectedModel && !!selectedSize && !!selectedQuality;
      case 5: return generatedConcepts.length > 0;
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
    try {
      const credits = await getCredits();
      setRemainingCredits(credits.remaining);

      let currentBrandData = brandData;
      if (!currentBrandData) {
        toast({ title: "Phase 1/2", description: "Crafting your brand strategy..." });
        const identityResult = await generateBrandIdentity({
          companyName,
          description: additionalInfo,
          style: selectedStyle,
          model: selectedModel,
        });
        if (!identityResult.success || !identityResult.brandData) {
          throw new Error(identityResult.error || "Failed to generate brand identity");
        }
        currentBrandData = identityResult.brandData;
        setBrandData(currentBrandData);
      }

      toast({ title: "Phase 2/2", description: "Generating unique logos..." });
      const logoResult = await generateLogos(currentBrandData, selectedModel);
      if (!logoResult.success || !logoResult.concepts) {
        throw new Error(logoResult.error || "Failed to generate logos");
      }

      setGeneratedConcepts(prev => [...prev, ...logoResult.concepts]);
      setRemainingCredits(logoResult.remainingCredits);
      window.dispatchEvent(new CustomEvent('refreshCredits'));
      toast({ title: "Ready!", description: "Choose your favorite logo to complete your brand." });
      setCurrentStep(5);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [companyName, selectedStyle, selectedModel, additionalInfo, isFormValid, toast, brandData]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1Name companyName={companyName} setCompanyName={setCompanyName} />;
      case 2:
        return <Step2About additionalInfo={additionalInfo} setAdditionalInfo={setAdditionalInfo} />;
      case 3:
        return <Step3Style selectedStyle={selectedStyle} setSelectedStyle={setSelectedStyle} />;
      case 4:
        return (
          <Step4Preferences
            selectedModel={selectedModel} setSelectedModel={setSelectedModel}
            selectedSize={selectedSize} setSelectedSize={setSelectedSize}
            selectedQuality={selectedQuality} setSelectedQuality={setSelectedQuality}
          />
        );
      case 5:
        return (
          <Step5Results
            generatedConcepts={generatedConcepts}
            companyName={companyName}
            selectedConceptIndex={selectedConceptIndex}
            setSelectedConceptIndex={setSelectedConceptIndex}
            remainingCredits={remainingCredits}
            loading={loading}
            handleGenerate={handleGenerate}
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
        onBack={() => setEditingAsset(null)}
      />
    );
  }

  return (
    <div className={`${currentStep < 5 && generatedConcepts.length === 0 ? "max-w-2xl mx-auto" : ""}`}>
      <Stepper currentStep={currentStep} steps={STEPS} totalSteps={TOTAL_STEPS} />

      <div className={currentStep === 5 ? "w-full" : "pt-8"}>
        <StepWrapper
          currentStep={currentStep}
          prevStep={prevStep}
          nextStep={nextStep}
          handleGenerate={handleGenerate}
          canProceedToNextStep={canProceedToNextStep}
          isFormValid={isFormValid}
          loading={loading}
        >
          {renderStepContent()}
        </StepWrapper>
      </div>
    </div>
  );
}
