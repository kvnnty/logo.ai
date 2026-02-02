"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";

const DEBOUNCE_MS = 280;

export function BrandDirectorySearch({
  initialQuery,
  industry,
}: {
  initialQuery: string;
  industry: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(initialQuery);

  // Sync from URL when it changes (e.g. back/forward, or clear search link)
  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  // Debounced URL update when user types (no push if already in sync with URL)
  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === initialQuery.trim()) return;
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (trimmed) params.set("q", trimmed);
      if (industry) params.set("industry", industry);
      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      router.push(url, { scroll: false });
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [value, initialQuery, pathname, industry, router]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  const applySearch = useCallback(() => {
    const trimmed = value.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    if (industry) params.set("industry", industry);
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.push(url, { scroll: false });
  }, [value, pathname, industry, router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applySearch();
      }
    },
    [applySearch]
  );

  return (
    <div className="mt-6 max-w-md">
      <label htmlFor="brand-search" className="sr-only">
        Search brands
      </label>
      <div className="flex items-center gap-2 rounded-2xl bg-background border border-border overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50">
        <div className="flex flex-1 items-center gap-2 pl-4 py-3">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            id="brand-search"
            type="search"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter a brand to get started..."
            className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoComplete="off"
          />
        </div>
        <button
          type="button"
          onClick={applySearch}
          className="shrink-0 px-4 py-3 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </div>
    </div>
  );
}
