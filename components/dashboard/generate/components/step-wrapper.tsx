"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatePresence } from "framer-motion";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";

interface StepWrapperProps {
  currentStep: number;
  prevStep: () => void;
  nextStep?: () => void;
  handleGenerate?: () => void;
  canProceedToNextStep: boolean;
  isFormValid: boolean;
  loading: boolean;
  remainingCredits?: number | null;
  onGoToCredits?: () => void;
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
  remainingCredits,
  onGoToCredits,
  children
}: StepWrapperProps) {
  return (
    <Card className={`py-0 border-none shadow-none`}>
      <CardContent className={`p-6 flex flex-col`}>
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>

        {currentStep === 6 && typeof remainingCredits === "number" && remainingCredits <= 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">
                  You have no credits left.
                </p>
                <p className="text-xs text-muted-foreground">
                  Top up your credits to generate new logo concepts.
                </p>
              </div>
            </div>
            {onGoToCredits && (
              <Button
                size="sm"
                variant="outline"
                onClick={onGoToCredits}
                className="h-8 px-3 text-xs"
              >
                Top up credits
              </Button>
            )}
          </div>
        )}

        <div className="flex justify-between mt-10 pt-6 border-t border-border/50">
          <Button
            onClick={prevStep}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-10 px-5"
          >
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 1 ? "Back" : "Previous"}
          </Button>

          {nextStep ? (
            <Button
              onClick={nextStep}
              size="sm"
              disabled={!canProceedToNextStep}
              className="flex items-center gap-2 h-10 px-8"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : handleGenerate ? (
            <Button
              onClick={handleGenerate}
              size="sm"
              disabled={
                !isFormValid ||
                loading ||
                (currentStep === 7 &&
                  typeof remainingCredits === "number" &&
                  remainingCredits <= 0)
              }
              className="flex items-center gap-2 bg-primary hover:bg-primary/80 h-10 px-8"
            >
              {loading ? (
                <>
                <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Brand
                </>
              )}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
