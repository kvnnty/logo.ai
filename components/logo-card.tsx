import { useState } from "react";
import { SelectLogo } from "@/db/schema";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, MoreVertical, Share2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface LogoCardProps {
  logo: SelectLogo;
  onDownload: (imageUrl: string) => void;
}

const LogoCard = ({ logo, onDownload }: LogoCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card className="group overflow-hidden border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted/20">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted/20 animate-pulse" />
          )}

          <img
            src={logo.image_url}
            alt={`${logo.username}'s logo`}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full shadow-lg hover:scale-105 transition-transform"
              onClick={() => onDownload(logo.image_url)}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1 w-full overflow-hidden">
              <h3 className="font-semibold text-sm truncate pr-2" title={logo.username}>
                {logo.username || "Untitled Brand"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(logo.createdAt), { addSuffix: true })}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 -mr-2 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDownload(logo.image_url)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Color Indicators */}
          <div className="flex gap-1 mt-3">
            <div
              className="w-4 h-4 rounded-full border shadow-sm ring-1 ring-border/50"
              style={{ backgroundColor: logo.primary_color || '#000' }}
              title="Primary Color"
            />
            <div
              className="w-4 h-4 rounded-full border shadow-sm ring-1 ring-border/50"
              style={{ backgroundColor: logo.background_color || '#fff' }}
              title="Background Color"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoCard;
