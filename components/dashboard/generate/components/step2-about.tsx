"use client";

import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

interface Step2Props {
  additionalInfo: string;
  setAdditionalInfo: (val: string) => void;
}

export function Step2About({ additionalInfo, setAdditionalInfo }: Step2Props) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Tell us more (Optional)</h2>
        <p className="text-sm text-muted-foreground">Describe your business, industry, and target audience.</p>
        <Textarea
          placeholder="e.g. A sustainable clothing brand for outdoor enthusiasts..."
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          className="min-h-[120px] text-base"
        />
      </div>
    </motion.div>
  );
}
