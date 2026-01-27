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
    <div className="mt-10 max-w-3xl mx-auto">
      <div className="bg-border h-2 rounded-full overflow-hidden z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
