"use client";

import { useState } from "react";
import { MethodSelection } from "./method-selection";
import { AIFlow } from "./ai-flow";
import { UploadFlow } from "./upload-flow";
import { AnimatePresence, motion } from "framer-motion";

export type GenerationMethod = "ai" | "upload" | null;

export default function BrandGeneratorWizard() {
  const [method, setMethod] = useState<GenerationMethod>(null);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {method === null ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MethodSelection onSelect={setMethod} />
          </motion.div>
        ) : method === "ai" ? (
          <motion.div
            key="ai"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AIFlow onBack={() => setMethod(null)} />
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <UploadFlow onBack={() => setMethod(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
