"use client";

import { Button } from "@/components/ui/button";
import { Check, Layout, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { LogoConcept, LogoVariation } from "../types";

interface Step5Props {
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

export function Step5Results({
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
}: Step5Props) {
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

      <div className="flex flex-col gap-8">
        {generatedConcepts.map((concept, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="overflow-hidden rounded-3xl border bg-white shadow-lg relative group/card"
          >
            <div className="flex flex-col md:flex-row min-h-[400px]">
              <div className="w-full md:w-3/5 p-8 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-border/50 transition-colors">
                <div className="absolute top-4 left-6 z-10">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-white/50 backdrop-blur text-primary px-3 py-1 rounded-full border border-primary/10">Concept 0{idx + 1}</span>
                </div>
                {/* Updated: Display full AI generated image, no overlay text */}
                <img src={concept.iconUrl} className="w-full h-full object-contain" alt="Full brand logo" />

                <div className="absolute bottom-4 right-6 text-[10px] font-black tracking-widest text-muted-foreground/20">PRIMARY LOGO</div>
              </div>

              <div className="w-full md:w-2/5 p-8 flex flex-col justify-between relative bg-stone-50">
                <div className="space-y-8">
                  <p className="text-sm text-muted-foreground">{concept.rationale}</p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 block">Typography</span>
                      <code className="text-xs font-bold bg-stone-50 px-3 py-1.5 rounded-lg border inline-block">{concept.fontFamily}</code>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 block">Color Palette</span>
                      <div className="flex gap-3">
                        {concept.colors.map((c: string) => (
                          <div key={c} className="group relative">
                            <div className="w-10 h-10 rounded-xl border-2 border-white shadow-sm transition-transform hover:scale-110 cursor-pointer" style={{ backgroundColor: c }} />
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold whitespace-nowrap z-20 pointer-events-none">{c.toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 mt-4">
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
                        toast({ title: "Logo Selected!", description: `The "${concept.name}" logo set is now your official brand identity.` });
                        router.push(`/dashboard/my-brands/${brandId}`);
                      }
                    }}
                    className="w-full bg-black hover:bg-black/90 text-white rounded-xl h-12 font-bold text-xs uppercase tracking-widest shadow-xl shadow-black/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Select This Design
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="flex justify-center pt-8">
          <Button
            onClick={handleGenerate}
            disabled={loading || (remainingCredits !== null && remainingCredits <= 0)}
            className="rounded-full h-14 px-8 bg-primary border-primary transition-all group"
          >
            <div className="flex items-center gap-3">
              <Loader2 className={`w-4 h-4 text-white group-hover:rotate-180 transition-transform ${loading ? 'animate-spin' : ''}`} />
              <div className="text-left">
                <p className="text-sm font-black tracking-widest text-white uppercase">Generate More</p>
                <p className="text-xs font-medium text-white">-1 credit</p>
              </div>
            </div>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
