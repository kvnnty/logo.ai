"use client";

import { AnimatePresence, motion } from "framer-motion";

interface GenerationLoadingModalProps {
  isOpen: boolean;
  phase: string;
  progress: number;
  title?: string;
}

export function GenerationLoadingModal({ isOpen, phase, progress, title = "Generating Brand Identity" }: GenerationLoadingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-full blur-[120px]"
            />
          </div>

          <div className="relative w-full max-w-sm px-6 text-center space-y-8">
            {/* Title & Phase */}
            <div className="space-y-3">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl font-semibold tracking-tight"
              >
                {title}
              </motion.h2>
              <motion.p
                key={phase}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-muted-foreground text-sm font-medium"
              >
                {phase}
              </motion.p>
            </div>

            {/* Progress Container */}
            <div className="space-y-4">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/30">
                <motion.div
                  className="h-full relative bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {/* Glowing tip */}
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-primary/50 blur-sm" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
