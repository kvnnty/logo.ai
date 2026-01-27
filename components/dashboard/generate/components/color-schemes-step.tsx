"use client";

import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

interface ColorScheme {
  id: string;
  name: string;
  description: string;
  colors: string[];
}

// Single color families, matching the palette UI
const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: "red",
    name: "Red",
    description: "Strength, passion, energy",
    colors: ["#FFE5E5", "#FFC1C1", "#FF8A8A", "#FF4D4D", "#E61A1A"],
  },
  {
    id: "orange",
    name: "Orange",
    description: "Joy, creativity, stimulation",
    colors: ["#FFE5CC", "#FFD1AA", "#FFB266", "#FF9933", "#E67A00"],
  },
  {
    id: "yellow",
    name: "Yellow",
    description: "Happiness, intellect, light",
    colors: ["#FFF7CC", "#FFF1B8", "#FFE680", "#FFD633", "#FFC107"],
  },
  {
    id: "green",
    name: "Green",
    description: "Nature, balance, growth",
    colors: ["#E0F9E0", "#C2F0C2", "#8FE78F", "#4CD24C", "#1FA31F"],
  },
  {
    id: "blue",
    name: "Blue",
    description: "Trust, loyalty, calm",
    colors: ["#E0F3FF", "#B3E5FF", "#80CCFF", "#3399FF", "#0077E6"],
  },
  {
    id: "purple",
    name: "Purple",
    description: "Power, luxury, wisdom",
    colors: ["#F0E0FF", "#E2C7FF", "#C28CFF", "#A155F7", "#7C2BD9"],
  },
  {
    id: "pink",
    name: "Pink",
    description: "Care, sensitivity, playfulness",
    colors: ["#FFE0F0", "#FFC4E3", "#FF8FC6", "#FF5AA9", "#E02474"],
  },
  {
    id: "brown",
    name: "Brown",
    description: "Stability, comfort, reliability",
    colors: ["#F1DDC6", "#E3C3A1", "#C6936A", "#A3663D", "#7A431F"],
  },
  {
    id: "black",
    name: "Black",
    description: "Elegance, authority, power",
    colors: ["#777777", "#555555", "#3B3B3B", "#222222", "#000000"],
  },
  {
    id: "gray",
    name: "Gray",
    description: "Maturity, intelligence, balance",
    colors: ["#F9FAFB", "#F3F4F6", "#D1D5DB", "#9CA3AF", "#4B5563"],
  },
  {
    id: "white",
    name: "White",
    description: "Clarity, purity, minimalism",
    colors: ["#FFFFFF", "#F9FAFB", "#F5F5F5", "#E5E7EB", "#D1D5DB"],
  },
];

interface ColorSchemesStepProps {
  selectedColorSchemes: string[];
  setSelectedColorSchemes: (val: string[]) => void;
  onSkip?: () => void;
}

export function ColorSchemesStep({ selectedColorSchemes, setSelectedColorSchemes, onSkip }: ColorSchemesStepProps) {
  const toggleScheme = (schemeId: string) => {
    if (selectedColorSchemes.includes(schemeId)) {
      // Deselect just this scheme
      setSelectedColorSchemes(selectedColorSchemes.filter((id) => id !== schemeId));
    } else {
      // Allow selecting multiple color families
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
          <h2 className="text-xl font-bold">Select Color pallette</h2>
          <p className="text-sm text-muted-foreground">
            Pick one primary color family for your brand. You can skip if you are not sure yet.
          </p>
        </div>
        {/* Show Skip only while no color scheme has been selected */}
        {onSkip && selectedColorSchemes.length === 0 && (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {COLOR_SCHEMES.map((scheme) => {
          const isSelected = selectedColorSchemes.includes(scheme.id);
          return (
            <button
              key={scheme.id}
              onClick={() => toggleScheme(scheme.id)}
              className={`p-4 text-left relative`}
            >
              <div className="flex items-center gap-3 mb-3 relative">
                <div className={clsx("flex flex-1 rounded overflow-hidden ring-2 ring-offset-4 transition-all", isSelected ? "ring-primary bg-primary/5" : "ring-white")}>
                  {scheme.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="flex-1 h-28"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
                    <Check className="h-3 w-3" />
                  </div>
                )}
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
