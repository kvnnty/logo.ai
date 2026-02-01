"use client";

import { Button } from "@/components/ui/button";
import { Check, Loader2, RefreshCcw, Sparkles, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoConcept } from "../types";
import { useState } from "react";

interface ResultsStepProps {
  generatedConcepts: LogoConcept[];
  companyName: string;
  selectedConceptIndex: number;
  setSelectedConceptIndex: (idx: number) => void;
  remainingCredits: number | null;
  loading: boolean;
  handleGenerate: () => void;
  lastBrandId: string | null;
  setEditingAsset: (val: any) => void;
  saveFinalBrand: (data: any) => Promise<any>;
  setLastBrandId: (id: string) => void;
  brandData: any;
  router: any;
  toast: any;
}

export function ResultsStep({
  generatedConcepts,
  companyName,
  remainingCredits,
  loading,
  handleGenerate,
  lastBrandId,
  setEditingAsset,
  saveFinalBrand,
  setLastBrandId,
  brandData,
  router,
  toast
}: ResultsStepProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectingIndex, setSelectingIndex] = useState<number | null>(null);

  return (
    <motion.div
      key="step5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-3xl font-black tracking-tight">Your Logo Designs</h2>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Explore each unique logo concept below. Click on any design to select it as your brand identity.
        </p>
        {remainingCredits !== null && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-2 rounded-full border border-primary/20">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">{remainingCredits} Credits</span>
          </div>
        )}
      </div>

      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {generatedConcepts.map((concept, idx) => (
              <motion.div
                key={`concept-${idx}`}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-gradient-to-br from-white to-slate-50/50 shadow-lg hover:shadow-2xl hover:border-primary/30 transition-all duration-300"
              >
                {/* Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/95 backdrop-blur-sm text-primary px-3 py-1.5 rounded-full border border-primary/20 shadow-sm">
                    Concept {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Logo Display Area */}
                <div className="relative bg-gradient-to-br from-slate-50 via-white to-slate-50/50 p-8 min-h-[280px] flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: hoveredIndex === idx ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <img
                      src={concept.iconUrl}
                      className="w-full h-full max-w-[240px] max-h-[240px] object-contain"
                      alt={`${companyName} logo concept ${idx + 1}`}
                      loading="lazy"
                    />
                  </motion.div>
                </div>

                {/* Info Section */}
                <div className="p-6 space-y-4 bg-white">
                  {/* Color Palette */}
                  {concept.colors && concept.colors.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                        Colors
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        {concept.colors.slice(0, 5).map((c: string, colorIdx: number) => (
                          <motion.div
                            key={colorIdx}
                            whileHover={{ scale: 1.15 }}
                            className="w-10 h-10 rounded-lg border-2 border-white shadow-md"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Font Family */}
                  {concept.fontFamily && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                        Typography
                      </span>
                      <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                        <code className="text-xs font-medium text-foreground">{concept.fontFamily}</code>
                      </div>
                    </div>
                  )}

                  {/* Select Button */}
                  <Button
                    onClick={async () => {
                      setSelectingIndex(idx);
                      try {
                        const result = await saveFinalBrand({
                          brandData,
                          concepts: generatedConcepts,
                          selectedConceptIndex: idx
                        });
                        if (result.success) {
                          const brandId = result.brandId;
                          setLastBrandId(brandId);
                          toast({
                            title: "Logo Selected! ✨",
                            description: `The "${concept.name}" logo is now your official brand identity.`
                          });
                          router.push(`/dashboard/my-brands/${brandId}`);
                        }
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to select logo. Please try again.",
                          variant: "destructive"
                        });
                      } finally {
                        setSelectingIndex(null);
                      }
                    }}
                    disabled={selectingIndex === idx}
                    className="w-full rounded-xl h-12 text-sm font-bold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                  >
                    {selectingIndex === idx ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Selecting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Select This Design</span>
                      </div>
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Generate More Button */}
        <div className="flex flex-col items-center gap-4 pt-4">
          <Button
            onClick={handleGenerate}
            disabled={loading || (remainingCredits !== null && remainingCredits <= 0)}
            size="lg"
            className="rounded-full h-14 px-10 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: loading ? 360 : 0 }}
                transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
              >
                <RefreshCcw className="w-5 h-5 text-white" />
              </motion.div>
              <div className="text-left">
                <p className="text-base font-black tracking-wide text-white">Generate More Logos</p>
                <p className="text-xs font-medium text-white/90">4 new concepts • 1 credit</p>
              </div>
            </div>
          </Button>

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-full"
            >
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm font-medium text-primary">Generating 4 new logo concepts...</span>
            </motion.div>
          )}

          {remainingCredits !== null && remainingCredits <= 0 && (
            <p className="text-sm text-muted-foreground text-center">
              You're out of credits. <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/dashboard/credits")}>Get more credits</Button>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
