"use client";

import { Button } from "@/components/ui/button";
import { Check, Layout, Loader2, RefreshCcw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { LogoConcept, LogoVariation } from "../types";

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
  finalizeBrandLogo: (brandId: string, assetId: string) => Promise<any>;
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
  finalizeBrandLogo,
  saveFinalBrand,
  setLastBrandId,
  brandData,
  router,
  toast
}: ResultsStepProps) {
  return (
    <motion.div
      key="step5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col items-center text-center space-y-3 mb-6">
        <h2 className="text-2xl font-black tracking-tight">Your Logo Designs</h2>
        <p className="text-muted-foreground text-sm max-w-xl px-4">
          Explore each logo set below and select the one that speaks to you.
        </p>
        {remainingCredits !== null && (
          <div className="bg-primary/5 px-3 py-1 rounded-full text-[10px] font-bold text-primary border border-primary/10">
            {remainingCredits} Credits Left
          </div>
        )}
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {generatedConcepts.map((concept, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.3, delay: idx * 0.03 }}
              className="overflow-hidden rounded-3xl border bg-white shadow-md hover:shadow-xl transition-shadow group"
            >
              <div className="flex flex-col h-full">
                <div className="relative bg-slate-50">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] bg-white/70 backdrop-blur text-primary px-3 py-1 rounded-full border border-primary/10">
                      Concept 0{idx + 1}
                    </span>
                  </div>
                  <div className="aspect-square w-full flex items-center justify-center p-6">
                    <img
                      src={concept.iconUrl}
                      className="w-full h-full object-contain"
                      alt={`${companyName} logo concept ${idx + 1}`}
                    />
                  </div>
                </div>

                <div className="p-6 flex flex-col gap-4 flex-1">
                  {concept.rationale && (
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {concept.rationale}
                    </p>
                  )}

                  {concept.colors && concept.colors.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                        Color palette
                      </span>
                      <div className="flex gap-2">
                        {concept.colors.slice(0, 5).map((c: string) => (
                          <div
                            key={c}
                            className="w-8 h-8 rounded-xl border border-white shadow-sm"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {concept.fontFamily && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                        Typeface
                      </span>
                      <code className="text-[11px] px-2 py-1 rounded-md bg-slate-50 border inline-block">
                        {concept.fontFamily}
                      </code>
                    </div>
                  )}

                  <div className="pt-2 mt-auto">
                    <Button
                      onClick={async () => {
                        const result = await saveFinalBrand({
                          brandData,
                          concepts: generatedConcepts,
                          selectedConceptIndex: idx
                        });
                        if (result.success) {
                          const brandId = result.brandId;
                          setLastBrandId(brandId);
                          toast({
                            title: "Logo Selected!",
                            description: `The "${concept.name}" logo set is now your official brand identity.`
                          });
                          router.push(`/dashboard/my-brands/${brandId}`);
                        }
                      }}
                      className="w-full rounded-xl h-11 text-xs font-semibold uppercase tracking-[0.18em]"
                    >
                      Select this design
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 pt-8">
          <Button
            onClick={handleGenerate}
            disabled={loading || (remainingCredits !== null && remainingCredits <= 0)}
            className="rounded-full h-14 px-8 bg-primary border-primary transition-all group"
          >
            <div className="flex items-center gap-3">
              <RefreshCcw className={`w-4 h-4 text-white group-hover:rotate-180 transition-transform ${loading ? 'animate-spin' : ''}`} />
              <div className="text-left">
                <p className="text-sm font-black tracking-widest text-white uppercase">Generate More</p>
                <p className="text-xs font-medium text-white">-1 credit</p>
              </div>
            </div>
          </Button>
          
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-6 py-3 bg-primary/5 border border-primary/20 rounded-full"
            >
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm font-medium text-primary">Generating more logo concepts...</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
