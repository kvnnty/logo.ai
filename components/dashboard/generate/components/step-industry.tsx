"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Dumbbell, ShoppingCart, Church, Home, Balloons, ChefHat, DollarSign, Heart, PaintRoller, BookOpen, Leaf, Car, PawPrint, MoreHorizontal, Globe, Gavel, Stethoscope, Gamepad2, Sparkles, Plane } from "lucide-react";

interface Industry {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const INDUSTRIES: Industry[] = [
  { id: "travel", name: "Travel", icon: Plane },
  { id: "sports-fitness", name: "Sports Fitness", icon: Dumbbell },
  { id: "retail", name: "Retail", icon: ShoppingCart },
  { id: "religious", name: "Religious", icon: Church },
  { id: "real-estate", name: "Real Estate", icon: Building2 },
  { id: "legal", name: "Legal", icon: Gavel },
  { id: "internet", name: "Internet", icon: Globe },
  { id: "technology", name: "Technology", icon: Sparkles },
  { id: "home-family", name: "Home Family", icon: Home },
  { id: "events", name: "Events", icon: Balloons },
  { id: "medical-dental", name: "Medical Dental", icon: Stethoscope },
  { id: "restaurant", name: "Restaurant", icon: ChefHat },
  { id: "finance", name: "Finance", icon: DollarSign },
  { id: "nonprofit", name: "Nonprofit", icon: Heart },
  { id: "entertainment", name: "Entertainment", icon: Gamepad2 },
  { id: "construction", name: "Construction", icon: PaintRoller },
  { id: "education", name: "Education", icon: BookOpen },
  { id: "beauty-spa", name: "Beauty Spa", icon: Leaf },
  { id: "automotive", name: "Automotive", icon: Car },
  { id: "animals-pets", name: "Animals Pets", icon: PawPrint },
  { id: "others", name: "Others", icon: MoreHorizontal },
];

interface StepIndustryProps {
  selectedIndustries: string[];
  setSelectedIndustries: (val: string[]) => void;
  onSkip?: () => void;
}

export function StepIndustry({ selectedIndustries, setSelectedIndustries, onSkip }: StepIndustryProps) {
  const toggleIndustry = (industryId: string) => {
    if (selectedIndustries.includes(industryId)) {
      setSelectedIndustries(selectedIndustries.filter((id) => id !== industryId));
    } else {
      setSelectedIndustries([...selectedIndustries, industryId]);
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
