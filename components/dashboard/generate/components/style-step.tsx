"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { STYLE_OPTIONS } from "../constants";

interface StyleStepProps {
  selectedStyles: string[];
  setSelectedStyles: (val: string[]) => void;
  onSkip?: () => void;
}

export function StyleStep({ selectedStyles, setSelectedStyles, onSkip }: StyleStepProps) {
  const toggleStyle = (styleId: string) => {
    if (selectedStyles.includes(styleId)) {
      setSelectedStyles(selectedStyles.filter((id) => id !== styleId));
    } else {
      setSelectedStyles([...selectedStyles, styleId]);
    }
  };

  return (
    <motion.div
      key="step-style"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <h2 className="text-xl font-bold">Choose visual styles</h2>
          <p className="text-sm text-muted-foreground">
            Select one or more styles that match your brand. See examples from popular brands below.
          </p>
        </div>
        {/* Show Skip only while no style has been selected */}
        {onSkip && selectedStyles.length === 0 && (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STYLE_OPTIONS.map((style) => {
          const isSelected = selectedStyles.includes(style.id);
          const Icon = style.icon;

          return (
            <button
              key={style.id}
              type="button"
              onClick={() => toggleStyle(style.id)}
              className={`group relative flex flex-col items-start p-5 rounded-2xl border transition-all text-left
                ${isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/30 hover:bg-primary/5"
                }`}
            >
              {/* Checkmark badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1 shadow-lg z-10">
                  <Check className="h-3 w-3" />
                </div>
              )}

              {/* Icon and title */}
              <div className="flex items-start gap-3 mb-3 w-full">
                <div
                  className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border
                    ${isSelected ? "bg-primary/10 border-primary/40" : "bg-background border-border"}`}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span
                    className={`font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}
                  >
                    {style.name}
                  </span>
                  {style.description && (
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {style.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Brand logo examples */}
              {style.logoExamples && style.logoExamples.length > 0 && (
                <div className="w-full mt-3 pt-3 border-t border-border/50">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Examples
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {style.logoExamples.map((example, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square bg-white rounded-lg border border-border/50 p-2 flex items-center justify-center overflow-hidden group/logo"
                      >
                        <img
                          src={example.logoUrl}
                          alt={example.name}
                          className="w-full h-full object-contain opacity-70 group-hover/logo:opacity-100 transition-opacity"
                          onError={(e) => {
                            // Fallback to a placeholder if logo fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = document.createElement('div');
                            fallback.className = 'w-full h-full flex items-center justify-center text-[8px] text-muted-foreground';
                            fallback.textContent = example.name.substring(0, 3).toUpperCase();
                            target.parentElement?.appendChild(fallback);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
