"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";
import {
  IconBook,
  IconLink,
  IconMail,
  IconMessageCircle,
  IconPalette,
  IconShoppingBag,
  IconSparkles,
  IconTarget,
  IconWorldWww,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface CreateNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  brandName: string;
}

interface ShortcutItem {
  id: string;
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: "Popular";
}

function getShortcuts(brandId: string): ShortcutItem[] {
  const prefix = `/dashboard/my-brands/${brandId}`;
  return [
    { id: "logo-files", title: "Logo Files", href: `${prefix}/my-designs`, icon: IconPalette },
    { id: "website", title: "Website", href: `${prefix}/link-in-bio`, icon: IconWorldWww, tag: "Popular" },
    { id: "brand-guidelines", title: "Brand Guidelines", href: `${prefix}/branding/brand-book`, icon: IconBook },
    { id: "domains", title: "Domains", href: `${prefix}/link-in-bio`, icon: IconWorldWww },
    { id: "business-email", title: "Business Email", href: `${prefix}/branding/email-signature`, icon: IconMail },
    { id: "link-in-bio", title: "Link in Bio", href: `${prefix}/link-in-bio`, icon: IconLink },
    { id: "email-signature", title: "Email Signature", href: `${prefix}/branding/email-signature`, icon: IconMail },
    { id: "merchandise", title: "Merchandise", href: `${prefix}/merch`, icon: IconShoppingBag },
    { id: "social-media", title: "Social Media", href: `${prefix}/social/social-posts`, icon: IconMessageCircle },
    { id: "get-customers", title: "Get customers", href: `${prefix}/marketing/ads`, icon: IconTarget },
    { id: "ai-marketing", title: "AI-Powered Marketing", href: `${prefix}/marketing/ads`, icon: IconTarget },
    { id: "new-logo", title: "New Logo", href: "/dashboard/my-brands/create", icon: IconSparkles },
  ];
}

export function CreateNewDialog({ open, onOpenChange, brandId, brandName }: CreateNewDialogProps) {
  const shortcuts = getShortcuts(brandId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-xl">
        <DialogHeader className="space-y-1 pb-4">
          <DialogTitle className="text-xl font-bold">
            What is next for {brandName}?
          </DialogTitle>
          <DialogDescription>
            Let&apos;s get you from start to success!
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-muted/20 p-4",
                  "hover:bg-muted/40 hover:border-primary/30 hover:shadow-sm transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                )}
              >
                <div className="flex flex-col items-center gap-1.5 flex-1 min-h-[56px] justify-center">
                  <div className="p-2.5 rounded-lg bg-background border border-border/50 shadow-sm">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">
                    {item.title}
                  </span>
                  {item.tag && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                      {item.tag}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <footer className="mt-6 pt-4 border-t border-border/50">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            By using LogoAIpro you agree to our Terms of Service and Privacy Policy.
            LogoAIpro may share your information with service providers to deliver your orders and improve the platform.
          </p>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
