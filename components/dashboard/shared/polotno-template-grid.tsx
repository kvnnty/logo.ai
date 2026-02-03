"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { POLOTNO_QUERY_BY_CATEGORY } from "@/constants/template-categories";

export interface PolotnoTemplateItem {
  json: string;
  preview: string;
  title?: string;
}

interface PolotnoTemplateGridProps {
  brandId: string;
  /** Optional category id (e.g. youtube_thumbnail) to filter templates. */
  categoryId?: string;
  title?: string;
  description?: string;
}

/** Fetches Polotno templates, displays grid with load more; selecting opens editor with template. */
export function PolotnoTemplateGrid({
  brandId,
  categoryId,
  title = "Templates",
  description,
}: PolotnoTemplateGridProps) {
  const router = useRouter();
  const [items, setItems] = useState<PolotnoTemplateItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const fallbackTriedRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const categoryQuery = categoryId ? POLOTNO_QUERY_BY_CATEGORY[categoryId] ?? "" : "";
  const effectiveQuery = submittedSearch.trim() || categoryQuery;

  const fetchPage = useCallback(
    async (p: number, append: boolean, queryOverride?: string) => {
      const query = queryOverride !== undefined ? queryOverride : effectiveQuery;
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p) });
        if (query) params.set("query", query);
        const res = await fetch(`/api/polotno-templates?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) {
          setItems((prev) => (append ? prev : []));
          return;
        }
        const list = Array.isArray(data.items) ? data.items : [];
        if (append) {
          setItems((prev) => [...prev, ...list]);
        } else {
          setItems(list);
        }
        setTotalPages(data.totalPages ?? 1);
      } catch {
        if (!append) setItems([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [effectiveQuery]
  );

  useEffect(() => {
    setPage(1);
    setUsedFallback(false);
    fallbackTriedRef.current = false;
    fetchPage(1, false);
  }, [fetchPage]);

  // When category query returns no templates, retry without query so users still see templates
  useEffect(() => {
    if (!loading && items.length === 0 && categoryQuery && !submittedSearch.trim() && !fallbackTriedRef.current) {
      fallbackTriedRef.current = true;
      setUsedFallback(true);
      setLoading(true);
      fetchPage(1, false, "");
    }
  }, [loading, items.length, categoryQuery, fetchPage]);

  const loadMore = () => {
    const next = page + 1;
    if (next > totalPages) return;
    setPage(next);
    fetchPage(next, true, usedFallback && !submittedSearch.trim() ? "" : undefined);
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSearch(searchQuery);
    setPage(1);
    setUsedFallback(false);
    fallbackTriedRef.current = false;
  };

  const onSelectTemplate = (item: PolotnoTemplateItem) => {
    let url: string = item.json;
    if (typeof url === "string" && !url.startsWith("http")) {
      try {
        url = `data:application/json;base64,${btoa(unescape(encodeURIComponent(url)))}`;
      } catch {
        url = item.json;
      }
    }
    router.push(`/editor/${brandId}?templateUrl=${encodeURIComponent(url)}`);
  };

  if (loading && items.length === 0) {
    return (
      <section className="space-y-4">
        {title && <h2 className="text-xl font-bold">{title}</h2>}
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <section className="space-y-4">
        {title && <h2 className="text-xl font-bold">{title}</h2>}
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
        <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/30 px-6 py-10 text-center">
          <p className="text-muted-foreground text-sm">
            No Polotno templates are available right now. Try again later or start with a blank canvas.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {title && <h2 className="text-xl font-bold">{title}</h2>}
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
      <form onSubmit={onSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={categoryQuery ? `Search in ${title ?? "templates"}…` : "Search templates (e.g. birthday, fitness, food)…"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm">
          Search
        </Button>
      </form>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item, i) => (
          <button
            key={`${item.preview}-${i}`}
            type="button"
            onClick={() => onSelectTemplate(item)}
            className="group text-left rounded-xl border border-border overflow-hidden bg-card hover:border-primary hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="aspect-video bg-muted/30 overflow-hidden flex items-center justify-center">
              <img
                src={item.preview}
                alt=""
                className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-[1.02] transition-transform"
              />
            </div>
            <div className="p-3 border-t">
              <p className="font-medium text-sm truncate">
                {item.title || `Template ${i + 1}`}
              </p>
              <p className="text-xs text-muted-foreground">Polotno Studio</p>
            </div>
          </button>
        ))}
      </div>
      {page < totalPages && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading…" : "Load more templates"}
          </Button>
        </div>
      )}
    </section>
  );
}
