"use client";

import { IconSearch, IconSparkles } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { getCredits } from "@/app/actions/actions";

export default function DashboardTopbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [credits, setCredits] = useState({ remaining: 10, limit: 10 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCredits = async () => {
    setIsRefreshing(true);
    try {
      const result = await getCredits();
      setCredits(result);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCredits();
    
    // Listen for credit refresh events
    const handleCreditRefresh = () => {
      fetchCredits();
    };
    
    window.addEventListener('refreshCredits', handleCreditRefresh);
    
    return () => {
      window.removeEventListener('refreshCredits', handleCreditRefresh);
    };
  }, []);

  return (
    <header className="z-30 w-full p-4">
      <div className="border border-border/50 rounded-2xl bg-card shadow-xl">
        <div className="flex items-center justify-between h-14 px-6 gap-4">
          {/* Search Bar - Left Aligned */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground">
              <IconSearch className="h-4 w-4" />
            </div>
            <Input
              type="search"
              placeholder="Search designs, colors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-9 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Credits UI - Right Aligned */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <IconSparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {credits.remaining} Credits
            </span>
            <button
              onClick={fetchCredits}
              disabled={isRefreshing}
              className="p-1 hover:bg-primary/20 rounded transition-colors disabled:opacity-50"
              title="Refresh credits"
            >
              <RefreshCw className={`h-4 w-4 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

