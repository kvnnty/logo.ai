"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Sparkles, RefreshCw } from "lucide-react";
import { AnimatePresence } from "framer-motion";

interface StepWrapperProps {
  currentStep: number;
  prevStep: () => void;
  nextStep?: () => void;
  handleGenerate?: () => void;
  canProceedToNextStep: boolean;
  isFormValid: boolean;
  loading: boolean;
  children: React.ReactNode;
}

export function StepWrapper({
  currentStep,
  prevStep,
  nextStep,
  handleGenerate,
  canProceedToNextStep,
  isFormValid,
  loading,
  children
}: StepWrapperProps) {
  return (
    <Card className={`border py-0 ${currentStep === 5 ? 'border-none bg-transparent shadow-none' : ''}`}>
      <CardContent className={`${currentStep === 5 ? 'p-0' : 'p-6 min-h-[400px]'} flex flex-col`}>
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>

        <div className="flex justify-between mt-auto pt-6">
          <Button
            onClick={prevStep}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-10 px-5"
          >
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 1 ? "Back" : "Previous"}
          </Button>

          {currentStep < 4 && nextStep ? (
            <Button
              onClick={nextStep}
              size="sm"
              disabled={!canProceedToNextStep}
              className="flex items-center gap-2 h-10 px-8"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : currentStep === 4 && handleGenerate ? (
            <Button
              onClick={handleGenerate}
              size="sm"
              disabled={!isFormValid || loading}
              className="flex items-center gap-2 bg-primary hover:bg-primary/80 h-10 px-8"
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
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
