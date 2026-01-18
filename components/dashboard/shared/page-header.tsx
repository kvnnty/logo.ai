"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  heading: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  backButton?: boolean;
}

export function PageHeader({
  heading,
  description,
  children,
  className,
  backButton,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className={cn("flex items-center justify-between space-y-2 mb-8", className)}>
      <div className="space-y-1">
        {backButton && (
          <Button
            variant="ghost"
            className="pl-0 hover:bg-transparent text-muted-foreground mb-2 h-auto py-0"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        )}
        <h2 className="text-xl font-bold tracking-tight">{heading}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {children}
      </div>
    </div>
  );
}
