"use client";

import { Button } from "@/components/ui/button";
import { Check, Layout, RefreshCw, Sparkles } from "lucide-react";
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
  saveFinalBrand: (brandData: any, concept: any) => Promise<any>;
  setLastBrandId: (id: string) => void;
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
            <div className="flex flex-col min-h-[300px]">
              <div className="w-full bg-stone-50 p-8 flex flex-col relative">
                <div className="absolute top-4 left-6 z-10">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">Concept 0{idx + 1}</span>
                </div>
                <div className="space-y-6 flex-1">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Brand Ecosystem</h3>
                      <div className="h-px flex-1 bg-border mx-3" />
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl p-6 border shadow-sm group relative overflow-hidden flex items-center justify-center min-h-[100px] transition-all hover:shadow-md">
                        <div className="flex items-center gap-6">
                          <img src={concept.iconUrl} className="w-10 h-10" alt="icon" />
                          <span style={{
                            fontWeight: 900,
                            fontSize: '1.25rem',
                            color: concept.colors[0],
                            fontFamily: concept.fontFamily
                          }}>
                            {companyName}
                          </span>
                        </div>
                        <div className="absolute top-2 right-4 text-[8px] font-black tracking-widest text-muted-foreground/30">HORIZONTAL</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl p-4 border shadow-sm flex flex-col items-center justify-center min-h-[120px] relative transition-all hover:shadow-md group">
                          <img src={concept.iconUrl} className="w-12 h-12 mb-3 drop-shadow-lg group-hover:scale-105 transition-transform" alt="icon" />
                          <span style={{
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            color: concept.colors[0],
                            fontFamily: concept.fontFamily
                          }}>
                            {companyName}
                          </span>
                          <div className="absolute top-2 right-4 text-[8px] font-black tracking-widest text-muted-foreground/30">VERTICAL</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border shadow-sm flex items-center justify-center min-h-[120px] relative transition-all hover:shadow-md">
                          <span style={{
                            fontWeight: 900,
                            fontSize: '1.25rem',
                            color: concept.colors[0],
                            fontFamily: concept.fontFamily
                          }}>
                            {companyName}
                          </span>
                          <div className="absolute top-2 right-4 text-[8px] font-black tracking-widest text-muted-foreground/30">WORDMARK</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Font</span>
                      <code className="text-[10px] font-bold bg-white px-2 py-1 rounded-full border border-black/5">{concept.fontFamily}</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Colors</span>
                      <div className="flex gap-2">
                        {concept.colors.map((c: string) => (
                          <div key={c} className="group relative">
                            <div className="w-6 h-6 rounded-lg border-2 border-white shadow-md transition-transform hover:scale-110" style={{ backgroundColor: c }} />
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">{c.toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {concept.colors.map((c: string) => (
                    <div key={c} className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{concept.fontFamily}</span>
              </div>
              <Button
                onClick={async () => {
                  const result = await saveFinalBrand(concept, concept);
                  if (result.success) {
                    const brandId = result.brandId;
                    setLastBrandId(brandId);
                    toast({ title: "Logo Selected!", description: `The "${concept.name}" logo set is now your official brand identity.` });
                    router.push(`/dashboard/my-brands/${brandId}`);
                  }
                }}
                className="bg-black hover:bg-black/90 text-white rounded-full px-8 font-black text-[10px] uppercase tracking-widest h-10 shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Select Logo Set
              </Button>
            </div>
          </motion.div>
        ))}

        <div className="flex justify-center pt-8">
          <Button
            onClick={handleGenerate}
            disabled={loading || (remainingCredits !== null && remainingCredits <= 0)}
            className="rounded-full h-11 px-8 border-dashed border-primary/40 hover:border-primary transition-all group"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className={`w-4 h-4 text-primary group-hover:rotate-180 transition-transform ${loading ? 'animate-spin' : ''}`} />
              <div className="text-left">
                <p className="text-[10px] font-black tracking-widest text-primary uppercase">Regenerate All</p>
                <p className="text-[8px] font-medium text-muted-foreground">-1 credit</p>
              </div>
            </div>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
