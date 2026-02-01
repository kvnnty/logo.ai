"use client";

import { IconSparkles, IconMenu2, IconBrandAsana } from "@tabler/icons-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, RefreshCcw, ChevronDown, Check, Plus } from "lucide-react";
import { getCredits } from "@/app/actions/credits-actions";
import { getUserBrands } from "@/app/actions/brand-actions";
import { Button } from "../ui/button";
import { useBrand } from "../providers/brand-provider";
import { useRouter } from "next/navigation";
import { CreateNewDialog } from "./create-new-dialog";

interface DashboardTopbarProps {
  onMenuClick?: () => void;
}

interface BrandSummary {
  _id: string;
  name: string;
  primaryLogoUrl?: string | null;
}

export default function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
  const [credits, setCredits] = useState({ remaining: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [brands, setBrands] = useState<BrandSummary[]>([]);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [isCreateNewOpen, setIsCreateNewOpen] = useState(false);
  const brand = useBrand();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchCredits = async () => {
    setIsRefreshing(true);
    try {
      const result = await getCredits();
      setCredits(result);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchBrands = async () => {
    const result = await getUserBrands();
    if (result.success) {
      setBrands(result.brands);
    }
  };

  useEffect(() => {
    fetchCredits();
    fetchBrands();

    // Listen for credit refresh events
    const handleCreditRefresh = () => {
      fetchCredits();
    };

    window.addEventListener('refreshCredits', handleCreditRefresh);

    return () => {
      window.removeEventListener('refreshCredits', handleCreditRefresh);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
    };

    if (isBrandDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBrandDropdownOpen]);

  const handleBrandSwitch = (brandId: string) => {
    setIsBrandDropdownOpen(false);
    router.push(`/dashboard/my-brands/${brandId}`);
  };

  return (
    <header className="z-30 w-full border-b border-border/50 bg-card relative">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6 gap-3">
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Open menu"
          >
            <IconMenu2 className="h-5 w-5" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/dashboard/my-brands">
              <Button variant="ghost">
                <IconBrandAsana className="h-4 w-4" />
                <span>My brands</span>
              </Button>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                className="gap-2"
                onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
              >
                <span>{brand.name}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isBrandDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>

              {isBrandDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    {brands.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No brands found
                      </div>
                    ) : (
                      brands.map((b) => (
                        <button
                          key={b._id}
                          onClick={() => handleBrandSwitch(b._id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left ${b._id === brand._id ? 'bg-accent' : ''
                            }`}
                        >
                          {b.primaryLogoUrl ? (
                            <img
                              src={b.primaryLogoUrl}
                              alt={b.name}
                              className="w-8 h-8 rounded object-contain border"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border">
                              <IconBrandAsana className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <span className="flex-1 font-medium truncate">{b.name}</span>
                          {b._id === brand._id && (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                    <div className="border-t border-border mt-2 pt-2">
                      <Link href="/dashboard/my-brands/create">
                        <button
                          onClick={() => setIsBrandDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left text-primary"
                        >
                          <IconSparkles className="h-4 w-4" />
                          <span className="font-medium">Create New Brand</span>
                        </button>
                      </Link>
                      <Link href="/dashboard/my-brands">
                        <button
                          onClick={() => setIsBrandDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left"
                        >
                          <IconBrandAsana className="h-4 w-4" />
                          <span className="font-medium">View All Brands</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        <div className="flex items-center gap-2 lg:gap-3">
          <Button onClick={() => setIsCreateNewOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Create new</span>
          </Button>
          <CreateNewDialog
            open={isCreateNewOpen}
            onOpenChange={setIsCreateNewOpen}
            brandId={brand._id}
            brandName={brand.name}
          />
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-primary/10 border border-primary/20 h-9">
            <IconSparkles className="h-4 w-4 text-primary" />
            <span className="text-xs lg:text-sm font-semibold text-primary whitespace-nowrap">
              {credits.remaining}
              <span className="hidden sm:inline"> Credits</span>
            </span>
            <button
              onClick={fetchCredits}
              disabled={isRefreshing}
              className="p-1 hover:bg-primary/20 rounded transition-colors disabled:opacity-50"
              title="Refresh credits"
            >
              <RefreshCcw className={`h-3 w-3 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

