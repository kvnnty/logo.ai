"use client";

import { motion } from "framer-motion";
import { STYLE_OPTIONS } from "../constants";

interface Step2Props {
  selectedStyle: string;
  setSelectedStyle: (val: string) => void;
}

export function Step2Style({ selectedStyle, setSelectedStyle }: Step2Props) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Choose a visual style</h2>
        <p className="text-sm text-muted-foreground">Select the aesthetic that best represents your brand.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {STYLE_OPTIONS.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3 ${selectedStyle === style.id
                  ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                  : "border-border hover:border-primary/20 hover:bg-primary/5 bg-background"
                }`}
            >
              <style.icon className={`w-8 h-8 ${selectedStyle === style.id ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-semibold ${selectedStyle === style.id ? "text-primary" : "text-foreground"}`}>
                {style.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
