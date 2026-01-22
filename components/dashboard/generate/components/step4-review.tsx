"use client";

import { motion } from "framer-motion";
import { STYLE_OPTIONS, MODEL_OPTIONS } from "../constants";
import { ModelType } from "../types";

interface Step4Props {
  companyName: string;
  selectedStyle: string;
  selectedModel: ModelType;
  additionalInfo: string;
}

export function Step4Review({ companyName, selectedStyle, selectedModel, additionalInfo }: Step4Props) {
  const styleName = STYLE_OPTIONS.find((s) => s.id === selectedStyle)?.name || selectedStyle;
  const modelName = MODEL_OPTIONS.find((m) => m.id === selectedModel)?.name || selectedModel;

  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Review your brand brief</h2>
        <p className="text-sm text-muted-foreground">Ready to generate your unique logo concepts.</p>
        <div className="grid grid-cols-1 gap-3">
          <div className="p-4 rounded-xl border bg-muted/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Company Name</p>
            <p className="font-bold text-lg">{companyName}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border bg-muted/30">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Style</p>
              <p className="font-bold">{styleName}</p>
            </div>
            <div className="p-4 rounded-xl border bg-muted/30">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Model</p>
              <p className="font-bold">{modelName}</p>
            </div>
          </div>
          {additionalInfo && (
            <div className="p-4 rounded-xl border bg-muted/30">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Additional Context</p>
              <p className="text-sm italic">"{additionalInfo}"</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
