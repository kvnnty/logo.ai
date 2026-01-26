"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface Step {
  number: number;
  label: string;
}

interface StepperProps {
  currentStep: number;
  steps: Step[];
  totalSteps: number;
}

export function Stepper({ currentStep, steps, totalSteps }: StepperProps) {
  return (
    <div className="mb-12 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className="relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold border-2 transition-all ${currentStep > step.number
                      ? "bg-primary border-primary text-primary-foreground"
                      : currentStep === step.number
                        ? "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs">{step.number}</span>
                  )}
                </div>
                <div className="absolute top-9 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-center mt-2 hidden sm:block uppercase tracking-wider opacity-70">
                  {step.label}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-all ${currentStep > step.number ? "bg-primary" : "bg-border"
                  }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="fixed top-0 left-0 right-0 w-full bg-border h-1 rounded-full overflow-hidden z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
