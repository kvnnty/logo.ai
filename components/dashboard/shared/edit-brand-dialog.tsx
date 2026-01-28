"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateBrand } from "@/app/actions/brand-actions";
import { useToast } from "@/hooks/use-toast";
import { Palette, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const SUGGESTED_PALETTES = [
  { name: "Ocean", primary: "#0ea5e9", secondary: "#f0f9ff" },
  { name: "Sunset", primary: "#f97316", secondary: "#fff7ed" },
  { name: "Forest", primary: "#16a34a", secondary: "#f0fdf4" },
  { name: "Modern", primary: "#18181b", secondary: "#fafafa" },
  { name: "Royal", primary: "#7c3aed", secondary: "#f5f3ff" },
  { name: "Berry", primary: "#db2777", secondary: "#fdf2f8" },
];

interface EditBrandDialogProps {
  brand: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditBrandDialog({ brand, open, onOpenChange, onSuccess }: EditBrandDialogProps) {
  const [name, setName] = useState(brand.name);
  const [description, setDescription] = useState(brand.description || "");
  const [primaryColor, setPrimaryColor] = useState(brand.identity?.primary_color || "#f97316");
  const [secondaryColor, setSecondaryColor] = useState(brand.identity?.secondary_color || "#ffffff");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateBrand(brand._id, {
        name,
        description,
        primaryColor,
        secondaryColor,
      });

      if (result.success) {
        toast({ title: "Success", description: "Brand details updated successfully" });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error("Failed to update brand");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update brand details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Edit Brand Details
          </DialogTitle>
          <DialogDescription>
            Update your brand's core identity and color scheme.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Brand Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter brand name"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does your brand do?"
              className="resize-none h-24"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base">Color Scheme</Label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Label className="text-xs text-muted-foreground mb-3 block">Suggested Palettes</Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {SUGGESTED_PALETTES.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setPrimaryColor(p.primary);
                      setSecondaryColor(p.secondary);
                    }}
                    className={`group relative flex flex-col items-center gap-1.5 p-1 rounded-lg border transition-all hover:border-primary/50 ${primaryColor === p.primary && secondaryColor === p.secondary
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-transparent"
                      }`}
                  >
                    <div className="flex w-full h-8 rounded-md overflow-hidden border shadow-sm group-hover:shadow-md transition-shadow">
                      <div className="flex-1" style={{ backgroundColor: p.primary }} />
                      <div className="flex-1" style={{ backgroundColor: p.secondary }} />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70">{p.name}</span>
                    {primaryColor === p.primary && secondaryColor === p.secondary && (
                      <CheckCircle2 className="absolute -top-1 -right-1 h-3.5 w-3.5 text-primary fill-background" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
