"use client";

import { cn } from "@/lib/utils";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import {
  IconBook,
  IconBrandAsana,
  IconChevronDown,
  IconCreditCard,
  IconHome,
  IconHome2,
  IconLink,
  IconMessageCircle,
  IconPalette,
  IconShoppingBag,
  IconSparkles,
  IconTarget,
  IconX
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: { title: string; href: string }[];
}

function getNavItems(brandId?: string): NavItem[] {
  const brandPrefix = brandId ? `/dashboard/my-brands/${brandId}` : '/dashboard';

  return [
    {
      title: "Overview",
      href: brandId ? `${brandPrefix}` : "/dashboard",
      icon: IconHome2,
    },
    {
      title: "My Designs",
      href: `${brandPrefix}/my-designs`,
      icon: IconPalette,
    },
    {
      title: "Link in Bio",
      href: brandId ? `${brandPrefix}/link-in-bio` : undefined,
      icon: IconLink,
    },
    {
      title: "Branding",
      icon: IconBrandAsana,
      items: [
        { title: "Business Cards", href: `${brandPrefix}/branding/business-cards` },
        { title: "Letterheads", href: `${brandPrefix}/branding/letterheads` },
        { title: "Email Signature", href: `${brandPrefix}/branding/email-signature` },
        { title: "Favicon Pack", href: `${brandPrefix}/branding/favicon-pack` },
        { title: "Brand Book", href: `${brandPrefix}/branding/brand-book` },
        { title: "License", href: `${brandPrefix}/branding/license` },
      ],
    },
    {
      title: "Social",
      icon: IconMessageCircle,
      items: [
        { title: "Social Stories", href: `${brandPrefix}/social/social-stories` },
        { title: "Social Posts", href: `${brandPrefix}/social/social-posts` },
        { title: "Social covers & profiles", href: `${brandPrefix}/social/social-covers-profiles` },
        { title: "Youtube Thumbnails", href: `${brandPrefix}/social/youtube-thumbnails` },
      ],
    },
    {
      title: "Marketing",
      icon: IconTarget,
      items: [
        { title: "Ads", href: `${brandPrefix}/marketing/ads` },
        { title: "Flyers", href: `${brandPrefix}/marketing/flyers` },
        { title: "Posters", href: `${brandPrefix}/marketing/posters` },
        { title: "Cards", href: `${brandPrefix}/marketing/cards` },
        { title: "Business Cards", href: `${brandPrefix}/marketing/id-cards` },
      ],
    },
    {
      title: "Merch",
      href: `${brandPrefix}/merch`,
      icon: IconShoppingBag,
    },
    {
      title: "About Your Brand",
      href: `${brandPrefix}/about-your-brand`,
      icon: IconBook,
    },
  ];
}

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  brandId?: string;
  brandName?: string;
}

export default function DashboardSidebar({ isOpen = false, onClose, brandId, brandName }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const [expandedSections, setExpandedSections] = useState<string[]>(["Branding", "Social", "Marketing"]);

  const navItems = getNavItems(brandId);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen w-72 p-4 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full bg-card transition-all duration-300 flex flex-col overflow-hidden">
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-6 right-6 p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Close menu"
          >
            <IconX className="h-5 w-5" />
          </button>

          {/* Logo Section */}
          <div className="mb-3 flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 group" onClick={handleNavClick}>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-colors rounded-xl" />
                <div className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                  L
                </div>
              </div>
              <span className="text-xl font-bold">LogoAIpro</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href ? pathname === item.href : false;
              const isExpanded = expandedSections.includes(item.title);
              const hasChildren = item.items && item.items.length > 0;

              if (hasChildren) {
                return (
                  <div key={item.title} className="mb-2">
                    <button
                      onClick={() => toggleSection(item.title)}
                      className={cn(
                        "w-full group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </div>
                      <IconChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isExpanded ? "rotate-180" : ""
                        )}
                      />
                    </button>
                    {isExpanded && (
                      <div className="mt-1 ml-4 space-y-1 border-l border-border/50 pl-3">
                        {item.items!.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={handleNavClick}
                              className={cn(
                                "block rounded-lg px-4 py-2 text-sm transition-colors",
                                isSubActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                              )}
                            >
                              {subItem.title}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Skip items without href (like Link in Bio when no brandId)
              if (!item.href) {
                return null;
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 mb-1",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-transform",
                    isActive ? "scale-105" : "group-hover:scale-105"
                  )} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="space-y-1.5 mt-auto pt-4 border-t border-border/50 flex-shrink-0">
            <Link
              href="/dashboard/credits"
              onClick={handleNavClick}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground transition-colors"
            >
              <IconCreditCard className="h-5 w-5" />
              <span>Add Credits</span>
            </Link>
            <Link
              href="/dashboard/my-brands/create"
              onClick={handleNavClick}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground transition-colors"
            >
              <IconSparkles className="h-5 w-5" />
              <span>New Brand</span>
            </Link>
            <Link
              href="/"
              onClick={handleNavClick}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground transition-colors"
            >
              <IconHome className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>

            <SignedIn>
              <div className="px-3 py-3 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10",
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {user?.firstName || user?.username || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.primaryEmailAddress?.emailAddress || "No email"}
                    </p>
                  </div>
                </div>
              </div>
            </SignedIn>
          </div>
        </div>
      </aside>
    </>
  );
}

