"use client";

import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface Step1Props {
  companyName: string;
  setCompanyName: (val: string) => void;
}

export function Step1Name({ companyName, setCompanyName }: Step1Props) {
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
    </motion.div>
  );
}
