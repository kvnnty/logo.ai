"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface LogoStyle {
  id: string;
  name: string;
  fontFamily: string;
  examples?: string[];
}

const LOGO_STYLES: LogoStyle[] = [
  {
    id: "modern",
    name: "Modern",
    fontFamily: "sans-serif",
    examples: ["CHANEL", "BBC", "Mobil", "Google"],
  },
  {
    id: "elegant",
    name: "Elegant",
    fontFamily: "serif",
    examples: ["ROLEX", "ZARA", "Dove", "PRADA"],
  },
  {
    id: "slab",
    name: "Slab",
    fontFamily: "serif",
    examples: ["SONY", "VOLVO", "HONDA", "I❤️NY"],
  },
  {
    id: "handwritten",
    name: "Handwritten",
    fontFamily: "cursive",
    examples: ["Kellogg's", "Instagram", "Cartier", "Coca-Cola"],
  },
  {
    id: "playful",
    name: "Playful",
    fontFamily: "sans-serif",
    examples: ["ToysЯUs", "LEGO", "Pokémon", "Disney"],
  },
  {
    id: "futuristic",
    name: "Futuristic",
    fontFamily: "monospace",
    examples: ["VAIO", "NASA", "SEGA", "TESLA"],
  },
];

interface StepLogoStyleProps {
  selectedStyles: string[];
  setSelectedStyles: (val: string[]) => void;
  onSkip?: () => void;
}

export function StepLogoStyle({ selectedStyles, setSelectedStyles, onSkip }: StepLogoStyleProps) {
  const toggleStyle = (styleId: string) => {
    if (selectedStyles.includes(styleId)) {
      setSelectedStyles(selectedStyles.filter((id) => id !== styleId));
    } else {
      setSelectedStyles([...selectedStyles, styleId]);
    }
  };

  const getStyleFont = (style: LogoStyle) => {
    switch (style.id) {
      case "modern":
        return "font-sans font-bold";
      case "elegant":
        return "font-serif";
      case "slab":
        return "font-serif font-bold";
      case "handwritten":
        return "italic";
      case "playful":
        return "font-sans font-bold";
      case "futuristic":
        return "font-mono uppercase tracking-wider";
      default:
        return "font-sans";
    }
  };

  return (
    <motion.div
      key="step-logo-style"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <h2 className="text-xl font-bold">Select styles that you like</h2>
          <p className="text-sm text-muted-foreground">You can also skip and see logo results directly</p>
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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {LOGO_STYLES.map((style) => {
          const isSelected = selectedStyles.includes(style.id);
          return (
            <button
              key={style.id}
              onClick={() => toggleStyle(style.id)}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/20 hover:bg-primary/5 bg-background"
              }`}
            >
              <h3 
                className={`text-xl mb-4 ${getStyleFont(style)} ${isSelected ? "text-primary" : "text-foreground"}`}
                style={{ fontFamily: style.fontFamily }}
              >
                {style.name}
              </h3>
              {style.examples && (
                <div className="space-y-1">
                  {style.examples.map((example, idx) => (
                    <div
                      key={idx}
                      className={`text-xs text-muted-foreground ${getStyleFont(style)}`}
                      style={{ fontFamily: style.fontFamily }}
                    >
                      {example}
                    </div>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
