"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { getTemplates } from "@/app/actions/template-actions";
import { Skeleton } from "@/components/ui/skeleton";

interface TemplatePreviewCardProps {
  category: string;
  primaryColor?: string;
  onClick?: () => void;
  className?: string;
}

export function TemplatePreviewCard({ 
  category, 
  primaryColor = "#2563eb",
  onClick,
  className = ""
}: TemplatePreviewCardProps) {
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplate() {
      try {
        const result = await getTemplates(category);
        if (result.success && result.templates && result.templates.length > 0) {
          setTemplate(result.templates[0]);
        }
      } catch (error) {
        console.error('Failed to fetch template:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplate();
  }, [category]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-0">
          <Skeleton className="w-full aspect-video rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!template?.previewImageUrl) {
    return (
      <Card className={className} onClick={onClick}>
        <CardContent className="p-0">
          <div 
            className="w-full aspect-video rounded-lg flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="text-white/50 text-sm">No preview available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${className}`} onClick={onClick}>
      <CardContent className="p-0">
        <div 
          className="w-full rounded-lg overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: primaryColor, minHeight: '200px' }}
        >
          <img 
            src={template.previewImageUrl} 
            alt={template.name || 'Template Preview'} 
            className="w-full h-auto object-contain"
            style={{ mixBlendMode: 'normal' }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
