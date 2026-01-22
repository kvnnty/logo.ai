"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

interface Step1Props {
  companyName: string;
  setCompanyName: (val: string) => void;
  additionalInfo: string;
  setAdditionalInfo: (val: string) => void;
}

export function Step1Name({ companyName, setCompanyName, additionalInfo, setAdditionalInfo }: Step1Props) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-bold">What's your company name?</h2>
        <p className="text-sm text-muted-foreground">This will be used as the primary text for your logo.</p>
        <Input
          placeholder="e.g. Acme Corp"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="text-lg h-12"
        />
      </div>
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
