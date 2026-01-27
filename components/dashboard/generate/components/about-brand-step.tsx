"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface AboutBrandStepProps {
  additionalInfo: string;
  setAdditionalInfo: (val: string) => void;
  onSkip?: () => void;
}

export function AboutBrandStep({ additionalInfo, setAdditionalInfo, onSkip }: AboutBrandStepProps) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <h2 className="text-xl font-bold">Tell us more (Optional)</h2>
          <p className="text-sm text-muted-foreground">Describe your business, industry, and target audience.</p>
        </div>
        {/* Show Skip button for optional step */}
        {onSkip && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="flex items-center gap-2"
          >
            Skip <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
      <Textarea
        placeholder="e.g. A sustainable clothing brand for outdoor enthusiasts..."
        value={additionalInfo}
        onChange={(e) => setAdditionalInfo(e.target.value)}
        className="min-h-[120px] text-base"
      />
    </motion.div>
  );
}
