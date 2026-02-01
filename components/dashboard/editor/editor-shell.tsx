"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ClipboardPaste,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  Heart,
  Italic,
  Lock,
  Redo2,
  Sparkles,
  Trash2,
  Type,
  Underline,
  Undo2,
  Box,
  Circle,
  Image as ImageIcon,
  Layers,
  Palette,
  Upload,
  FileText,
  Wrench,
  Star,
  History,
  Layout,
  Search,
  ZoomIn,
  ZoomOut,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CanvasRenderer } from "@/components/dashboard/canvas/canvas-renderer";
import { updateDesign, exportSceneToFile, listDesigns } from "@/app/actions/design-actions";
import { getBrandById } from "@/app/actions/brand-actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const MAX_HISTORY = 50;

const SIDEBAR_TABS = [
  { id: "templates", label: "Templates", icon: Sparkles },
  { id: "elements", label: "Elements", icon: Box },
  { id: "palettes", label: "Palettes", icon: Palette },
  { id: "brand-kit", label: "Brand Kit", icon: Layout },
  { id: "text", label: "Text", icon: FileText },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "uploads", label: "Uploads", icon: Upload },
  { id: "layers", label: "Layers", icon: Layers },
  { id: "pages", label: "Pages", icon: Layout },
  { id: "history", label: "History", icon: History },
  { id: "favorites", label: "Favorites", icon: Star },
] as const;

interface EditorShellProps {
  brandId: string;
  designId: string;
  initialDesign: {
    _id: string;
    name: string;
    pages: Array<{ sceneData: any }>;
    favorite?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  initialPage?: number;
  templateId?: string;
}

const DEFAULT_SCENE = {
  width: 1080,
  height: 1080,
  elements: [{ type: "rect", x: 0, y: 0, width: 1080, height: 1080, fill: "#ffffff", draggable: false }],
};

export function EditorShell({ brandId, designId, initialDesign, initialPage, templateId }: EditorShellProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [design, setDesign] = useState(() => ({
    ...initialDesign,
    pages: initialDesign.pages?.length ? initialDesign.pages : [{ sceneData: DEFAULT_SCENE }],
  }));
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const initialPageApplied = useRef(false);
  useEffect(() => {
    if (initialPageApplied.current || initialPage == null) return;
    const pageCount = design.pages?.length ?? 0;
    if (pageCount > 0) {
      setCurrentPageIndex(Math.min(initialPage, pageCount - 1));
      initialPageApplied.current = true;
    }
  }, [design.pages?.length, initialPage]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [zoom, setZoom] = useState(0.5);
  const [activeSidebarTab, setActiveSidebarTab] = useState<string>("templates");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveStatusRef = useRef(saveStatus);
  const designRef = useRef(design);
  const stageRef = useRef<any>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  saveStatusRef.current = saveStatus;
  const [history, setHistory] = useState<any[][]>([]);
  const [redoStack, setRedoStack] = useState<any[][]>([]);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const [brand, setBrand] = useState<{ name?: string; logos?: Array<{ image_url?: string; imageUrl?: string; category?: string }>; logoCandidates?: Array<{ imageUrl: string }>; activeLogoCandidateId?: string } | null>(null);
  const [favoriteDesigns, setFavoriteDesigns] = useState<Array<{ _id: string; name: string; favorite?: boolean }>>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementIndex: number } | null>(null);
  const copiedElementRef = useRef<any>(null);
  designRef.current = design;

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    const t = setTimeout(close, 0);
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    return () => {
      clearTimeout(t);
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close);
    };
  }, [contextMenu]);

  useEffect(() => {
    let cancelled = false;
    getBrandById(brandId).then((r) => {
      if (!cancelled && r.success && r.brand) setBrand(r.brand);
    });
    return () => { cancelled = true; };
  }, [brandId]);

  useEffect(() => {
    let cancelled = false;
    listDesigns(brandId).then((r) => {
      if (!cancelled && r.success && r.designs) setFavoriteDesigns((r.designs as any[]).filter((d) => d.favorite));
    });
    return () => { cancelled = true; };
  }, [brandId, design.favorite]);

  const currentPage = design.pages[currentPageIndex];
  const scene = currentPage?.sceneData ?? DEFAULT_SCENE;
  const selectedElement = selectedId !== null ? scene.elements?.[selectedId] : null;

  const pushHistory = useCallback(() => {
    setHistory((h) => {
      const next = [...h, JSON.parse(JSON.stringify(designRef.current.pages))];
      return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
    });
    setRedoStack([]);
  }, []);

  const persistPages = useCallback(
    async (pages: typeof design.pages) => {
      setSaveStatus("saving");
      const result = await updateDesign(designId, { pages });
      if (result.success) {
        setDesign((d) => ({ ...d, pages }));
        setSaveStatus("saved");
      } else {
        setSaveStatus("unsaved");
        toast({ title: "Save failed", description: result.error, variant: "destructive" });
      }
    },
    [designId, toast]
  );

  const scheduleSave = useCallback(() => {
    setSaveStatus("unsaved");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      persistPages(designRef.current.pages);
      saveTimeoutRef.current = null;
    }, 1500);
  }, [persistPages]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setRedoStack((r) => [...r, JSON.parse(JSON.stringify(designRef.current.pages))]);
      setDesign((d) => ({ ...d, pages: prev }));
      scheduleSave();
      return h.slice(0, -1);
    });
  }, [scheduleSave]);

  const redo = useCallback(() => {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const next = r[r.length - 1];
      setHistory((h) => [...h, JSON.parse(JSON.stringify(designRef.current.pages))]);
      setDesign((d) => ({ ...d, pages: next }));
      scheduleSave();
      return r.slice(0, -1);
    });
  }, [scheduleSave]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  // Optional periodic auto-save every 30s when unsaved
  useEffect(() => {
    const interval = setInterval(() => {
      if (saveStatusRef.current !== "unsaved") return;
      persistPages(designRef.current.pages);
    }, 30_000);
    return () => clearInterval(interval);
  }, [persistPages]);

  const updateElement = useCallback(
    (index: number, newAttrs: any) => {
      pushHistory();
      const newElements = [...(scene.elements || [])];
      newElements[index] = newAttrs;
      const newScene = { ...scene, elements: newElements };
      const nextPages = [...design.pages];
      nextPages[currentPageIndex] = { ...nextPages[currentPageIndex], sceneData: newScene };
      setDesign((d) => ({ ...d, pages: nextPages }));
      scheduleSave();
    },
    [scene, design.pages, currentPageIndex, scheduleSave, pushHistory]
  );

  const setScene = useCallback(
    (newScene: any) => {
      const nextPages = [...design.pages];
      nextPages[currentPageIndex] = { ...nextPages[currentPageIndex], sceneData: newScene };
      setDesign((d) => ({ ...d, pages: nextPages }));
      scheduleSave();
    },
    [design.pages, currentPageIndex, scheduleSave]
  );

  const setPages = useCallback(
    (newPages: typeof design.pages) => {
      pushHistory();
      setDesign((d) => ({ ...d, pages: newPages }));
      scheduleSave();
    },
    [design.pages, pushHistory, scheduleSave]
  );

  const addPage = useCallback(() => {
    const nextPages = [...design.pages, { sceneData: { ...DEFAULT_SCENE, elements: [...DEFAULT_SCENE.elements] } }];
    setPages(nextPages);
    setCurrentPageIndex(nextPages.length - 1);
    setSelectedId(null);
  }, [design.pages, setPages]);

  const removePage = useCallback(
    (index: number) => {
      if (design.pages.length <= 1) {
        toast({ title: "Keep at least one page", variant: "destructive" });
        return;
      }
      const nextPages = design.pages.filter((_, i) => i !== index);
      setPages(nextPages);
      setCurrentPageIndex((prev) => (prev === index ? Math.min(prev, nextPages.length - 1) : prev > index ? prev - 1 : prev));
      setSelectedId(null);
    },
    [design.pages, setPages, toast]
  );

  const movePage = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= design.pages.length || fromIndex === toIndex) return;
      const next = [...design.pages];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      setPages(next);
      setCurrentPageIndex((prev) => (prev === fromIndex ? toIndex : prev === toIndex ? fromIndex : prev));
    },
    [design.pages, setPages]
  );

  const deleteElement = useCallback(() => {
    if (selectedId === null) return;
    pushHistory();
    const newElements = scene.elements.filter((_: any, i: number) => i !== selectedId);
    setScene({ ...scene, elements: newElements });
    setSelectedId(null);
  }, [selectedId, scene, setScene, pushHistory]);

  const duplicateElement = useCallback(() => {
    if (selectedId === null || !selectedElement) return;
    pushHistory();
    const copy = JSON.parse(JSON.stringify(selectedElement));
    copy.x = (copy.x ?? 0) + 20;
    copy.y = (copy.y ?? 0) + 20;
    const newElements = [...(scene.elements || []), copy];
    setScene({ ...scene, elements: newElements });
    setSelectedId(newElements.length - 1);
  }, [selectedId, selectedElement, scene, setScene, pushHistory]);

  const copyElement = useCallback(() => {
    if (selectedId === null || !selectedElement) return;
    copiedElementRef.current = JSON.parse(JSON.stringify(selectedElement));
    toast({ title: "Copied" });
  }, [selectedId, selectedElement, toast]);

  const pasteElement = useCallback(() => {
    if (!copiedElementRef.current) return;
    pushHistory();
    const copy = JSON.parse(JSON.stringify(copiedElementRef.current));
    copy.x = (copy.x ?? 0) + 20;
    copy.y = (copy.y ?? 0) + 20;
    const newElements = [...(scene.elements || []), copy];
    setScene({ ...scene, elements: newElements });
    setSelectedId(newElements.length - 1);
    toast({ title: "Pasted" });
  }, [scene, setScene, pushHistory, toast]);

  const bringForward = useCallback(
    (index: number) => {
      if (index < 0 || index >= (scene.elements?.length ?? 0) - 1) return;
      pushHistory();
      const els = [...(scene.elements || [])];
      [els[index], els[index + 1]] = [els[index + 1], els[index]];
      setScene({ ...scene, elements: els });
      setSelectedId(index + 1);
      scheduleSave();
    },
    [scene, setScene, pushHistory, scheduleSave]
  );

  const sendBackward = useCallback(
    (index: number) => {
      if (index <= 0 || index >= (scene.elements?.length ?? 0)) return;
      pushHistory();
      const els = [...(scene.elements || [])];
      [els[index - 1], els[index]] = [els[index], els[index - 1]];
      setScene({ ...scene, elements: els });
      setSelectedId(index - 1);
      scheduleSave();
    },
    [scene, setScene, pushHistory, scheduleSave]
  );

  const alignElementToPage = useCallback(
    (index: number, alignment: "center" | "left" | "right" | "top" | "bottom") => {
      const el = scene.elements?.[index];
      if (!el || !scene.width || !scene.height) return;
      const w = el.type === "circle" ? (el.radius ?? 50) * 2 : (el.width ?? 200);
      const h = el.type === "circle" ? (el.radius ?? 50) * 2 : (el.height ?? el.fontSize ?? 40);
      let x = el.x ?? 0;
      let y = el.y ?? 0;
      if (alignment === "center" || alignment === "left" || alignment === "right") {
        if (alignment === "center") x = (scene.width - w) / 2;
        else if (alignment === "right") x = scene.width - w;
        else x = 0;
      }
      if (alignment === "center" || alignment === "top" || alignment === "bottom") {
        if (alignment === "center") y = (scene.height - h) / 2;
        else if (alignment === "bottom") y = scene.height - h;
        else y = 0;
      }
      updateElement(index, { ...el, x, y });
    },
    [scene, updateElement]
  );

  const handleElementContextMenu = useCallback(
    (index: number, ev: MouseEvent) => {
      if (index >= 0) setSelectedId(index);
      setContextMenu({ x: ev.clientX, y: ev.clientY, elementIndex: index });
    },
    []
  );

  const addElement = useCallback(
    (el: any) => {
      pushHistory();
      const newElements = [...(scene.elements || []), el];
      setScene({ ...scene, elements: newElements });
      setSelectedId(newElements.length - 1);
    },
    [scene, setScene, pushHistory]
  );

  const addText = () => addElement({ type: "text", content: "New Text", x: 100, y: 100, fontSize: 40, fill: "#000000", draggable: true });
  const addRect = () => addElement({ type: "rect", x: 100, y: 100, width: 100, height: 100, fill: "#3b82f6", draggable: true });
  const addCircle = () => addElement({ type: "circle", x: 100, y: 100, radius: 50, fill: "#ef4444", draggable: true });
  const handleExport = useCallback(
    async (format: "png" | "svg" | "pdf", options?: { scale?: number; transparent?: boolean }) => {
      const key = format === "png" ? `png-${options?.scale ?? 2}-${options?.transparent ?? false}` : format;
      setExportingFormat(key);
      try {
        const result = await exportSceneToFile(scene, format, options);
        if (!result.success || !result.dataUrl || !result.filename) {
          toast({ title: "Export failed", description: result.error ?? "Unknown error", variant: "destructive" });
          return;
        }
        const a = document.createElement("a");
        a.href = result.dataUrl;
        a.download = result.filename;
        a.click();
        toast({ title: "Download started", description: result.filename });
      } catch (e) {
        toast({ title: "Export failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
      } finally {
        setExportingFormat(null);
      }
    },
    [scene, toast]
  );

  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        addElement({ type: "image", src: dataUrl, x: 100, y: 100, width: 200, height: 200, draggable: true });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedId !== null && (e.key === "Delete" || e.key === "Backspace")) {
        if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
        e.preventDefault();
        deleteElement();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, deleteElement]);

  const handleNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const name = e.target.value.trim() || "Untitled design";
    if (name === design.name) return;
    setDesign((d) => ({ ...d, name }));
    const result = await updateDesign(designId, { name });
    if (!result.success) toast({ title: "Failed to rename", description: result.error, variant: "destructive" });
  };

  const toggleFavorite = async () => {
    const next = !design.favorite;
    setDesign((d) => ({ ...d, favorite: next }));
    await updateDesign(designId, { favorite: next });
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      {/* Top bar */}
      <header className="h-14 border-b border-border/50 bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/dashboard/my-brands/${brandId}`}>
            <Button variant="ghost" size="icon" className="shrink-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <input
            type="text"
            value={design.name}
            onChange={(e) => setDesign((d) => ({ ...d, name: e.target.value }))}
            onBlur={handleNameBlur}
            className="bg-transparent border-none outline-none font-semibold text-lg truncate max-w-[240px]"
          />
          <span className="text-xs text-muted-foreground shrink-0">
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "saving" && "Saving…"}
            {saveStatus === "unsaved" && "Unsaved"}
          </span>
          {design.createdAt && (
            <span className="text-xs text-muted-foreground hidden sm:inline" title={design.createdAt}>
              Created {formatDistanceToNow(new Date(design.createdAt), { addSuffix: true })}
            </span>
          )}
          {design.updatedAt && (
            <span className="text-xs text-muted-foreground hidden sm:inline" title={design.updatedAt}>
              Updated {formatDistanceToNow(new Date(design.updatedAt), { addSuffix: true })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" title="Undo" onClick={undo} disabled={history.length === 0}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Redo" onClick={redo} disabled={redoStack.length === 0}>
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={design.favorite ? "Remove from favorites" : "Add to favorites"}
            onClick={toggleFavorite}
            className={design.favorite ? "text-primary" : ""}
          >
            <Heart className={cn("h-4 w-4", design.favorite && "fill-current")} />
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5" title="Resize (coming soon)">
            <Box className="h-4 w-4" />
            Resize
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5" title="Download" disabled={!!exportingFormat}>
                <Download className="h-4 w-4" />
                {exportingFormat ? "Exporting…" : "Download"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Export as</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport("png", { scale: 1 })} disabled={!!exportingFormat}>
                PNG (1×)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("png", { scale: 2 })} disabled={!!exportingFormat}>
                PNG (2×)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("png", { scale: 2, transparent: true })} disabled={!!exportingFormat}>
                PNG (2×, transparent)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport("svg")} disabled={!!exportingFormat}>
                SVG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={!!exportingFormat}>
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Contextual toolbar – reacts to selected element */}
      {selectedId !== null && selectedElement && (
        <div className="h-12 border-b border-border/50 bg-card flex items-center gap-2 px-4 shrink-0">
          {selectedElement.type === "text" && (
            <>
              <Input
                type="number"
                value={selectedElement.fontSize ?? 40}
                onChange={(e) => updateElement(selectedId, { ...selectedElement, fontSize: Number(e.target.value) || 40 })}
                className="w-16 h-8 text-sm"
                min={8}
                max={200}
              />
              <input
                type="color"
                value={selectedElement.fill ?? "#000000"}
                onChange={(e) => updateElement(selectedId, { ...selectedElement, fill: e.target.value })}
                className="w-8 h-8 rounded border cursor-pointer"
              />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateElement(selectedId, { ...selectedElement, fontWeight: selectedElement.fontWeight === "bold" ? "normal" : "bold" })}>
                <Bold className={cn("h-4 w-4", selectedElement.fontWeight === "bold" && "font-bold")} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateElement(selectedId, { ...selectedElement, fontStyle: selectedElement.fontStyle === "italic" ? "normal" : "italic" })}>
                <Italic className={cn("h-4 w-4", selectedElement.fontStyle === "italic" && "italic")} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateElement(selectedId, { ...selectedElement, underline: !selectedElement.underline })}>
                <Underline className={cn("h-4 w-4", selectedElement.underline && "underline")} />
              </Button>
              <div className="w-px h-5 bg-border" />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateElement(selectedId, { ...selectedElement, align: "left" })} title="Align left">
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateElement(selectedId, { ...selectedElement, align: "center" })} title="Align center">
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateElement(selectedId, { ...selectedElement, align: "right" })} title="Align right">
                <AlignRight className="h-4 w-4" />
              </Button>
            </>
          )}
          {(selectedElement.type === "rect" || selectedElement.type === "circle") && (
            <>
              <span className="text-xs text-muted-foreground">Fill</span>
              <input
                type="color"
                value={selectedElement.fill ?? "#3b82f6"}
                onChange={(e) => updateElement(selectedId, { ...selectedElement, fill: e.target.value })}
                className="w-8 h-8 rounded border cursor-pointer"
              />
            </>
          )}
          {selectedElement.type === "image" && (
            <span className="text-xs text-muted-foreground">Image – use Layers panel or floating toolbar to replace</span>
          )}
          <div className="flex-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={duplicateElement} title="Duplicate">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Lock (coming soon)" disabled>
            <Lock className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={deleteElement} title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {/* Left sidebar */}
        <aside className="w-14 border-r border-border/50 bg-card flex flex-col items-center py-2 shrink-0">
          {SIDEBAR_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSidebarTab(id)}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                activeSidebarTab === id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
              title={label}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </aside>

        {/* Side panel content */}
        <div className="w-72 border-r border-border/50 bg-card flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 border-b border-border/50 flex items-center justify-between shrink-0">
            <span className="font-medium text-sm capitalize">{activeSidebarTab.replace("-", " ")}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 text-sm text-muted-foreground">
            {activeSidebarTab === "templates" && (
              <div className="space-y-3">
                <p className="text-muted-foreground">Start from a template or generate with AI.</p>
                <Button size="sm" className="w-full gap-2" disabled>
                  <Sparkles className="h-4 w-4" />
                  Generate design
                </Button>
                <p className="text-xs">AI generation (coming later).</p>
                <p className="text-xs">Browse by size/category (coming later).</p>
              </div>
            )}
            {activeSidebarTab === "elements" && (
              <div className="space-y-3">
                <Input placeholder="Search elements…" className="h-8 text-xs" disabled />
                <p className="text-xs text-muted-foreground">Shapes & media</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={addText}>Text</Button>
                  <Button variant="outline" size="sm" onClick={addRect}>Rectangle</Button>
                  <Button variant="outline" size="sm" onClick={addCircle}>Circle</Button>
                  <Button variant="outline" size="sm" onClick={addImage}>Image</Button>
                </div>
                <p className="text-xs text-muted-foreground">More shapes & icons (coming later).</p>
              </div>
            )}
            {activeSidebarTab === "palettes" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Click a color to apply to the selected element.</p>
                {[
                  { name: "Blue", colors: ["#3b82f6", "#1d4ed8", "#60a5fa", "#93c5fd", "#dbeafe"] },
                  { name: "Warm", colors: ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"] },
                  { name: "Neutral", colors: ["#1f2937", "#4b5563", "#9ca3af", "#d1d5db", "#f3f4f6"] },
                ].map((palette) => (
                  <div key={palette.name}>
                    <span className="text-xs font-medium text-foreground">{palette.name}</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {palette.colors.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => {
                            if (selectedId !== null && selectedElement && (selectedElement as any).fill != null)
                              updateElement(selectedId, { ...selectedElement, fill: hex });
                            else addElement({ type: "rect", x: 100, y: 100, width: 100, height: 100, fill: hex, draggable: true });
                          }}
                          className="w-8 h-8 rounded border border-border shadow-sm hover:ring-2 hover:ring-primary"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Image picker / eyedropper (coming later).</p>
              </div>
            )}
            {activeSidebarTab === "brand-kit" && (
              <div className="space-y-3">
                {brand ? (
                  <>
                    <p className="text-xs font-medium text-foreground">Logos</p>
                    <div className="flex flex-wrap gap-2">
                      {brand.logos?.filter((a: any) => a.image_url || a.imageUrl).slice(0, 3).map((asset: any, i: number) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => addElement({ type: "image", src: asset.image_url ?? asset.imageUrl, x: 100, y: 100, width: 200, height: 200, draggable: true })}
                          className="w-14 h-14 rounded border border-border bg-muted flex items-center justify-center overflow-hidden"
                        >
                          <img src={asset.imageUrl} alt="" className="max-w-full max-h-full object-contain" />
                        </button>
                      ))}
                      {brand.logoCandidates?.length ? (
                        (() => {
                          const active = brand.logoCandidates?.find((c) => (c as any).candidateId === brand.activeLogoCandidateId) ?? brand.logoCandidates[0];
                          return active?.imageUrl ? (
                            <button
                              type="button"
                              onClick={() => addElement({ type: "image", src: active.imageUrl, x: 100, y: 100, width: 200, height: 200, draggable: true })}
                              className="w-14 h-14 rounded border border-border bg-muted flex items-center justify-center overflow-hidden"
                            >
                              <img src={active.imageUrl} alt="" className="max-w-full max-h-full object-contain" />
                            </button>
                          ) : null;
                        })()
                      ) : null}
                    </div>
                    {(!brand.logos?.length && !brand.logoCandidates?.length) && <p className="text-xs">No logos in brand yet. Add from Branding.</p>}
                    <p className="text-xs text-muted-foreground">Brand colors & fonts (coming later).</p>
                  </>
                ) : (
                  <p className="text-xs">Loading brand…</p>
                )}
              </div>
            )}
            {activeSidebarTab === "text" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Quick text</p>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => addElement({ type: "text", content: "Heading", x: 100, y: 100, fontSize: 48, fill: "#000000", draggable: true })}>Heading</Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => addElement({ type: "text", content: "Subheading", x: 100, y: 100, fontSize: 32, fill: "#374151", draggable: true })}>Subheading</Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => addElement({ type: "text", content: "Body text", x: 100, y: 100, fontSize: 20, fill: "#4b5563", draggable: true })}>Body</Button>
              </div>
            )}
            {activeSidebarTab === "tools" && <p className="text-xs">Alignment, guides, rulers (coming later).</p>}
            {activeSidebarTab === "uploads" && (
              <div className="space-y-3">
                <Button size="sm" className="w-full gap-2" onClick={addImage}>
                  <Upload className="h-4 w-4" />
                  Upload image
                </Button>
                <p className="text-xs text-muted-foreground">Paste from URL (coming later). Brand assets appear in Brand Kit.</p>
              </div>
            )}
            {activeSidebarTab === "layers" && (
              <div className="space-y-1">
                {(scene.elements || []).map((el: any, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedId(i)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2",
                      selectedId === i ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                    )}
                  >
                    <span className="capitalize">{el.type}</span>
                    <span className="opacity-70">#{i + 1}</span>
                  </button>
                ))}
              </div>
            )}
            {activeSidebarTab === "pages" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Pages</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={addPage} title="Add page">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {design.pages.map((page, i) => {
                    const sd = page.sceneData ?? DEFAULT_SCENE;
                    const bg = sd.elements?.[0]?.fill ?? "#f3f4f6";
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-2 rounded border p-1.5",
                          currentPageIndex === i ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setCurrentPageIndex(i)}
                          className="flex-1 flex items-center gap-2 min-w-0"
                        >
                          <div className="w-10 h-10 rounded shrink-0 border border-border overflow-hidden" style={{ backgroundColor: bg }} />
                          <span className="text-xs truncate">Page {i + 1}</span>
                        </button>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => movePage(i, i - 1)} disabled={i === 0} title="Move up">
                            <ChevronUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => movePage(i, i + 1)} disabled={i === design.pages.length - 1} title="Move down">
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => removePage(i)} title="Remove page" disabled={design.pages.length <= 1}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {activeSidebarTab === "history" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Undo / Redo</p>
                <p className="text-xs">Undo: {history.length} step{history.length !== 1 ? "s" : ""}</p>
                <p className="text-xs">Redo: {redoStack.length} step{redoStack.length !== 1 ? "s" : ""}</p>
                <p className="text-xs text-muted-foreground mt-2">Version list (coming later).</p>
              </div>
            )}
            {activeSidebarTab === "favorites" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Favorited designs</p>
                {favoriteDesigns.length === 0 ? (
                  <p className="text-xs">No favorites yet. Star designs from My Designs.</p>
                ) : (
                  <ul className="space-y-1">
                    {favoriteDesigns.filter((d) => d._id !== designId).map((d) => (
                      <li key={d._id}>
                        <Link href={`/dashboard/my-brands/${brandId}/editor/${d._id}`} className="text-xs text-primary hover:underline truncate block">
                          {d.name || "Untitled"}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Canvas area */}
        <main className="flex-1 overflow-auto bg-muted/30 p-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 bg-card border rounded-full px-3 py-1.5 shadow-sm">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(0.5)}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div ref={canvasContainerRef} className="relative shadow-xl border bg-white rounded-sm overflow-hidden" style={{ width: scene.width * zoom, height: scene.height * zoom }}>
            <CanvasRenderer
              ref={stageRef}
              sceneData={scene}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUpdateElement={updateElement}
              onElementContextMenu={handleElementContextMenu}
              scale={zoom}
            />
            {/* Floating mini-toolbar above selected element */}
            {selectedId !== null && selectedElement && (
              <div
                className="absolute z-10 flex items-center gap-0.5 rounded-lg border bg-card px-1 py-1 shadow-lg"
                style={{
                  left: (selectedElement.x ?? 0) * zoom,
                  top: Math.max(4, ((selectedElement.y ?? 0) - 48) * zoom),
                }}
              >
                {(selectedElement.type === "text" || selectedElement.type === "rect" || selectedElement.type === "circle") && (
                  <input
                    type="color"
                    value={selectedElement.fill ?? (selectedElement.type === "text" ? "#000000" : "#3b82f6")}
                    onChange={(e) => updateElement(selectedId, { ...selectedElement, fill: e.target.value })}
                    className="h-7 w-7 rounded border cursor-pointer"
                  />
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={duplicateElement} title="Duplicate">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Lock (coming soon)" disabled>
                  <Lock className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={deleteElement} title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Right-click context menu */}
      {contextMenu &&
        createPortal(
          <div
            className="fixed z-50 min-w-[180px] rounded-md border bg-popover py-1 text-popover-foreground shadow-md"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            {contextMenu.elementIndex >= 0 ? (
              <>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent"
                  onClick={() => {
                    const el = scene.elements?.[contextMenu.elementIndex];
                    if (el) {
                      copiedElementRef.current = JSON.parse(JSON.stringify(el));
                      toast({ title: "Copied" });
                    }
                    setSelectedId(contextMenu.elementIndex);
                    setContextMenu(null);
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                  onClick={() => {
                    if (copiedElementRef.current) {
                      pasteElement();
                      setContextMenu(null);
                    }
                  }}
                  disabled={!copiedElementRef.current}
                >
                  <ClipboardPaste className="h-4 w-4" />
                  Paste
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent"
                  onClick={() => {
                    setSelectedId(contextMenu.elementIndex);
                    duplicateElement();
                    setContextMenu(null);
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent text-destructive"
                  onClick={() => {
                    pushHistory();
                    const newElements = (scene.elements || []).filter((_: any, i: number) => i !== contextMenu.elementIndex);
                    setScene({ ...scene, elements: newElements });
                    setSelectedId(null);
                    setContextMenu(null);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
                <button type="button" className="flex w-full items-center gap-2 px-2 py-1.5 text-sm opacity-50 cursor-not-allowed" disabled>
                  <Lock className="h-4 w-4" />
                  Lock (coming soon)
                </button>
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                  onClick={() => {
                    setSelectedId(contextMenu.elementIndex);
                    bringForward(contextMenu.elementIndex);
                    setContextMenu(null);
                  }}
                  disabled={contextMenu.elementIndex >= (scene.elements?.length ?? 0) - 1}
                >
                  <ChevronUp className="h-4 w-4" />
                  Bring forward
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                  onClick={() => {
                    setSelectedId(contextMenu.elementIndex);
                    sendBackward(contextMenu.elementIndex);
                    setContextMenu(null);
                  }}
                  disabled={contextMenu.elementIndex <= 0}
                >
                  <ChevronDown className="h-4 w-4" />
                  Send backward
                </button>
                <div className="my-1 h-px bg-border" />
                <span className="px-2 py-1 text-xs font-medium text-muted-foreground">Align to page</span>
                {(["center", "left", "right", "top", "bottom"] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent capitalize"
                    onClick={() => {
                      setSelectedId(contextMenu.elementIndex);
                      alignElementToPage(contextMenu.elementIndex, align);
                      setContextMenu(null);
                    }}
                  >
                    {align}
                  </button>
                ))}
              </>
            ) : (
              <button
                type="button"
                className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                onClick={() => {
                  if (copiedElementRef.current) {
                    pasteElement();
                    setContextMenu(null);
                  }
                }}
                disabled={!copiedElementRef.current}
              >
                <ClipboardPaste className="h-4 w-4" />
                Paste
              </button>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
