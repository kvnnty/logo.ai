"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconSparkles, IconUpload } from "@tabler/icons-react";
import { motion } from "framer-motion";

interface MethodSelectionProps {
  onSelect: (method: "ai" | "upload") => void;
}

export function MethodSelection({ onSelect }: MethodSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold">How would you like to start?</h2>
        <p className="text-muted-foreground">
          Choose to generate a new brand from scratch or expand your existing
          brand
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="h-full"
        >
          <Card
            className="cursor-pointer hover:border-primary/50 transition-colors h-full rounded-3xl"
            onClick={() => onSelect("upload")}
          >
            <CardContent className="p-8 flex flex-col items-center text-center gap-6 h-full justify-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <IconUpload className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Upload Your logo</h3>
                <p className="text-sm text-muted-foreground max-w-xs text-center leading-relaxed">
                  Already have a logo? Upload it to generate a full brand kit
                  including social media assets, business cards, and more.
                </p>
                <Button variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/40">
                  <IconUpload className="w-4 h-4" />
                  Upload Your logo
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.98 }}
          className="h-full"
        >
          <Card
            className="cursor-pointer hover:border-primary/50 transition-colors h-full rounded-3xl"
            onClick={() => onSelect("ai")}
          >
            <CardContent className="p-8 flex flex-col items-center text-center gap-6 h-full justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <IconSparkles className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Generate New Brand</h3>
                <p className="text-sm text-muted-foreground max-w-xs text-center leading-relaxed">
                  Start from scratch. Our AI will guide you through creating a
                  unique logo and complete brand identity system.
                </p>
                <Button>
                  <IconSparkles className="w-4 h-4" />
                  Create a new brand
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
