"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface LogoAsset {
  _id?: string;
  imageUrl: string;
  subType?: string;
  category?: string;
}

interface SelectLogoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logos: LogoAsset[];
  selectedLogoUrl?: string;
  onSelect: (logoUrl: string) => void;
}

export function SelectLogoDialog({
  open,
  onOpenChange,
  logos,
  selectedLogoUrl,
  onSelect,
}: SelectLogoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Profile Image</DialogTitle>
          <DialogDescription>
            Choose a logo from your brand assets to use as your profile image.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
          {logos.map((logo, index) => {
            const isSelected = logo.imageUrl === selectedLogoUrl;
            return (
              <button
                key={logo._id || logo.imageUrl || index}
                onClick={() => {
                  onSelect(logo.imageUrl);
                  onOpenChange(false);
                }}
                className={`relative group border-2 rounded-lg overflow-hidden transition-all hover:border-primary ${
                  isSelected ? 'border-primary ring-2 ring-primary' : 'border-gray-200'
                }`}
              >
                <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                  <img
                    src={logo.imageUrl}
                    alt={`Logo ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <div className="p-2 bg-white">
                  <p className="text-xs text-center text-gray-600 truncate">
                    {logo.subType || logo.category || 'Logo'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        {logos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No logos available. Generate logos in your brand dashboard.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
