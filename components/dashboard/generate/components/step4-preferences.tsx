"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { MODEL_OPTIONS, SIZE_OPTIONS } from "../constants";
import { ModelType, SizeType, QualityType } from "../types";

interface Step4Props {
  selectedModel: ModelType;
  setSelectedModel: (val: ModelType) => void;
  selectedSize: SizeType;
  setSelectedSize: (val: SizeType) => void;
  selectedQuality: QualityType;
  setSelectedQuality: (val: QualityType) => void;
}

export function Step4Preferences({
  selectedModel,
  setSelectedModel,
  selectedSize,
  setSelectedSize,
  selectedQuality,
  setSelectedQuality
}: Step4Props) {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">AI Model</h2>
          <p className="text-sm text-muted-foreground">Select the model that fits your needs.</p>
          <Select value={selectedModel} onValueChange={(val: ModelType) => setSelectedModel(val)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              {MODEL_OPTIONS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.name} - {opt.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Image Size</h2>
            <Select value={selectedSize} onValueChange={(val: SizeType) => setSelectedSize(val)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select Size" />
              </SelectTrigger>
              <SelectContent>
                {SIZE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Quality</h2>
            <Select value={selectedQuality} onValueChange={(val: QualityType) => setSelectedQuality(val)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="hd">HD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
