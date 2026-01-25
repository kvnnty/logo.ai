"use client";

import { motion } from "framer-motion";
import { STYLE_OPTIONS } from "../constants";

interface Step3Props {
  selectedStyle: string;
  setSelectedStyle: (val: string) => void;
}

export function Step3Style({ selectedStyle, setSelectedStyle }: Step3Props) {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Choose a visual style</h2>
        <p className="text-sm text-muted-foreground">Select the aesthetic that best represents your brand.</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {STYLE_OPTIONS.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 ${selectedStyle === style.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/20 hover:bg-primary/5 bg-background"
                }`}
            >
              <style.icon className={`w-5 h-5 ${selectedStyle === style.id ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs font-medium ${selectedStyle === style.id ? "text-primary" : "text-foreground"}`}>
                {style.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
