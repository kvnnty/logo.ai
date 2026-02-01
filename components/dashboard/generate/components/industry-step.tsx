"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Dumbbell, ShoppingCart, Church, Home, PartyPopper, ChefHat, DollarSign, Heart, PaintRoller, BookOpen, Leaf, Car, PawPrint, MoreHorizontal, Globe, Gavel, Stethoscope, Gamepad2, Sparkles, PlaneTakeoff } from "lucide-react";
import { INDUSTRIES as INDUSTRIES_DATA } from "@/lib/industries";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  travel: PlaneTakeoff,
  "sports-fitness": Dumbbell,
  retail: ShoppingCart,
  religious: Church,
  "real-estate": Building2,
  legal: Gavel,
  internet: Globe,
  technology: Sparkles,
  "home-family": Home,
  events: PartyPopper,
  "medical-dental": Stethoscope,
  restaurant: ChefHat,
  finance: DollarSign,
  nonprofit: Heart,
  entertainment: Gamepad2,
  construction: PaintRoller,
  education: BookOpen,
  "beauty-spa": Leaf,
  automotive: Car,
  "animals-pets": PawPrint,
  others: MoreHorizontal,
};

const INDUSTRIES = INDUSTRIES_DATA.map((item) => ({
  ...item,
  icon: ICONS[item.id] ?? MoreHorizontal,
}));

interface StepIndustryProps {
  selectedIndustries: string[];
  setSelectedIndustries: (val: string[]) => void;
  onSkip?: () => void;
}

export function StepIndustry({ selectedIndustries, setSelectedIndustries, onSkip }: StepIndustryProps) {
  // Single-select: user can choose at most one industry
  const toggleIndustry = (industryId: string) => {
    if (selectedIndustries.includes(industryId)) {
      // Deselect if the same industry is clicked again
      setSelectedIndustries([]);
    } else {
      setSelectedIndustries([industryId]);
    }
  };

  return (
    <motion.div
      key="step-industry"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <h2 className="text-xl font-bold">Please Select A Industry</h2>
          <p className="text-sm text-muted-foreground">This will help us find logo types and styles that fit your brand</p>
        </div>
        {/* Show Skip only while no industry has been selected */}
        {onSkip && selectedIndustries.length === 0 && (
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

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {INDUSTRIES.map((industry) => {
          const isSelected = selectedIndustries.includes(industry.id);
          const Icon = industry.icon;
          return (
            <button
              key={industry.id}
              onClick={() => toggleIndustry(industry.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${
                isSelected
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/20 hover:bg-primary/5 bg-background text-muted-foreground"
              }`}
            >
              <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs font-medium text-center ${isSelected ? "text-primary" : "text-foreground"}`}>
                {industry.name}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
