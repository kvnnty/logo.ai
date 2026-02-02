"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Sparkles, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  title?: string;
  /** Logo: download + set primary + delete. Design: open in editor + delete. Asset: download + delete. */
  variant?: "logo" | "design" | "asset";
  onDownload?: () => void;
  onSetPrimary?: () => void;
  onDelete?: () => void;
  onOpenInEditor?: () => void;
  downloading?: boolean;
  primaryLoading?: boolean;
  deleting?: boolean;
  isPrimary?: boolean;
}

export function ImageViewerModal({
  open,
  onOpenChange,
  imageUrl,
  title,
  variant = "asset",
  onDownload,
  onSetPrimary,
  onDelete,
  onOpenInEditor,
  downloading = false,
  primaryLoading = false,
  deleting = false,
  isPrimary = false,
}: ImageViewerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0 border-2 bg-background/95 backdrop-blur"
        onPointerDownOutside={(e) => e.stopPropagation()}
      >
        <DialogHeader className="p-4 pb-2 shrink-0">
          <DialogTitle className="text-lg font-semibold truncate pr-8">
            {title || "Preview"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 flex items-center justify-center p-4 bg-muted/20">
          <img
            src={imageUrl}
            alt={title || "Preview"}
            className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-lg shadow-lg"
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 p-4 border-t bg-muted/30">
          {onDownload && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onDownload}
              disabled={downloading}
            >
              <Download className="h-4 w-4" />
              {downloading ? "Downloading…" : "Download"}
            </Button>
          )}
          {variant === "logo" && onSetPrimary && (
            <Button
              variant={isPrimary ? "secondary" : "outline"}
              size="sm"
              className="gap-2"
              onClick={onSetPrimary}
              disabled={primaryLoading || isPrimary}
            >
              <Sparkles className="h-4 w-4" />
              {isPrimary ? "Primary" : primaryLoading ? "Setting…" : "Set as Primary"}
            </Button>
          )}
          {variant === "design" && onOpenInEditor && (
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                onOpenInEditor();
                onOpenChange(false);
              }}
            >
              <ExternalLink className="h-4 w-4" />
              Open in Editor
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={onDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
