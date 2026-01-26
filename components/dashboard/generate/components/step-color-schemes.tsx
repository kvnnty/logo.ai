"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface ColorScheme {
  id: string;
  name: string;
  description: string;
  colors: string[];
}

const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: "warm",
    name: "Warm",
    description: "Joy, enthusiasm, happiness, creativity, determination, and stimulation",
    colors: ["#FFF5F5", "#FF6B35", "#C1121F", "#780000"],
  },
  {
    id: "cold",
    name: "Cold",
    description: "Depth, trust, loyalty, confidence, intelligence, and calmness",
    colors: ["#E0F2FE", "#0EA5E9", "#0284C7", "#0C4A6E"],
  },
  {
    id: "contrast",
    name: "Contrast",
    description: "Power, energy, passion, desire, speed, strength, love, and intensity",
    colors: ["#EC4899", "#FBBF24", "#3B82F6", "#A855F7"],
  },
  {
    id: "pastel",
    name: "Pastel",
    description: "Sweet, harmony, loving, playful, safety, and healing",
    colors: ["#FCE7F3", "#FEF3C7", "#DBEAFE"],
  },
  {
    id: "greyscale",
    name: "Greyscale",
    description: "Elegance, reliability, intelligence, modesty, and maturity",
    colors: ["#F3F4F6", "#9CA3AF", "#1F2937"],
  },
  {
    id: "gradient",
    name: "Gradient",
    description: "Trendy, creativity, inspiration, excitement, tranquility, and youth",
    colors: ["#A855F7", "#EC4899", "#EF4444", "#F97316", "#FBBF24"],
  },
];

interface StepColorSchemesProps {
  selectedColorSchemes: string[];
  setSelectedColorSchemes: (val: string[]) => void;
  onSkip?: () => void;
}

export function StepColorSchemes({ selectedColorSchemes, setSelectedColorSchemes, onSkip }: StepColorSchemesProps) {
  const toggleScheme = (schemeId: string) => {
    if (selectedColorSchemes.includes(schemeId)) {
      setSelectedColorSchemes(selectedColorSchemes.filter((id) => id !== schemeId));
    } else {
      setSelectedColorSchemes([...selectedColorSchemes, schemeId]);
    }
  };

  return (
    <motion.div
      key="step-color-schemes"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <h2 className="text-xl font-bold">Select color schemes that matches your brand</h2>
          <p className="text-sm text-muted-foreground">You can skip if you are not sure</p>
        </div>
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

      <div className="grid grid-cols-2 gap-4">
        {COLOR_SCHEMES.map((scheme) => {
          const isSelected = selectedColorSchemes.includes(scheme.id);
          return (
            <button
              key={scheme.id}
              onClick={() => toggleScheme(scheme.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/20 hover:bg-primary/5 bg-background"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex gap-1 flex-1">
                  {scheme.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="flex-1 h-8 rounded"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <h3 className={`font-semibold mb-1 ${isSelected ? "text-primary" : "text-foreground"}`}>
                {scheme.name}
              </h3>
              <p className="text-xs text-muted-foreground">{scheme.description}</p>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
