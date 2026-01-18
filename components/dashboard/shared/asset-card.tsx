"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Edit, MoreVertical, Eye, Share2, Sparkles } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AssetCardProps {
  title: string;
  description?: string;
  imageUrl: string;
  date?: string;
  aspectRatio?: "square" | "video" | "portrait";
  onDownload?: () => void;
  onEdit?: () => void;
  onPreview?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
  downloading?: boolean;
  actionLoading?: boolean;
}

export function AssetCard({
  title,
  description,
  imageUrl,
  date,
  aspectRatio = "square",
  onDownload,
  onEdit,
  onPreview,
  onAction,
  actionLabel,
  className,
  downloading = false,
  actionLoading = false,
}: AssetCardProps) {

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
  };

  return (
    <Card className={cn("overflow-hidden group hover:border-primary/50 transition-all duration-300 border shadow-none", className)}>
      <div className={cn("relative overflow-hidden bg-muted/20", aspectRatioClass[aspectRatio])}>
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          {onPreview && (
            <Button size="icon" variant="secondary" className="rounded-full" onClick={onPreview}>
              <Eye className="w-4 h-4" />
            </Button>
          )}
          {onDownload && (
            <Button size="icon" variant="secondary" className="rounded-full" onClick={onDownload} disabled={downloading}>
              <Download className={cn("w-4 h-4", downloading && "animate-pulse")} />
            </Button>
          )}
          {onAction && (
            <Button variant="secondary" className="rounded-full px-4 h-9 text-xs font-bold" onClick={onAction} disabled={actionLoading}>
              {actionLoading ? "Processing..." : actionLabel || "Select"}
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-bold text-sm leading-none truncate pr-4" title={title}>{title}</h3>
            {description && <p className="text-[11px] text-muted-foreground line-clamp-1">{description}</p>}
            {date && <p className="text-[10px] text-muted-foreground pt-1">{date}</p>}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDownload && (
                <DropdownMenuItem onClick={onDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
              )}
              {onAction && (
                <DropdownMenuItem onClick={onAction} disabled={actionLoading}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {actionLabel || "Select"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
