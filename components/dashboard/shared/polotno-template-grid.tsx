"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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

  const query = categoryId ? POLOTNO_QUERY_BY_CATEGORY[categoryId] ?? "" : "";

  const fetchPage = useCallback(
    async (p: number, append: boolean) => {
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
    [query]
  );

  useEffect(() => {
    setPage(1);
    fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = () => {
    const next = page + 1;
    if (next > totalPages) return;
    setPage(next);
    fetchPage(next, true);
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

  return (
    <section className="space-y-4">
      {title && <h2 className="text-xl font-bold">{title}</h2>}
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
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
