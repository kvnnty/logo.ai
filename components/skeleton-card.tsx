import React from "react";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function SkeletonCard() {
  return (
    <Card className="group overflow-hidden border-2 rounded-xl">
      <CardContent className="p-0">
        {/* Image Placeholder */}
        <div className="w-full aspect-square bg-muted/20 relative overflow-hidden">
          <Skeleton className="h-full w-full" />
        </div>

        {/* Content Placeholder */}
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center gap-2">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>

          <div className="flex gap-2 pt-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
