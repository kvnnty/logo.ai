"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, Save, Type, Image as ImageIcon, Box, Trash2, Download, Circle, AlignCenter, AlignLeft, AlignRight, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, AlignVerticalJustifyStart, Layers, Settings, ZoomIn, ZoomOut, Search } from 'lucide-react';
import { CanvasRenderer } from './canvas-renderer';
import { updateAssetScene } from '@/app/actions/actions';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Remove internal dynamic import

export function BrandCanvasEditor({ initialScene, brandId, assetId, onClose }: any) {
  const [scene, setScene] = useState(initialScene || { elements: [], width: 1080, height: 1080 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [zoom, setZoom] = useState(0.5);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const stageRef = React.useRef<any>(null);

  const selectedElement = selectedId !== null ? scene.elements[selectedId] : null;

  const updateElement = (index: number, newAttrs: any) => {
    const newElements = [...scene.elements];
    newElements[index] = newAttrs;
    setScene({ ...scene, elements: newElements });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateAssetScene(brandId, assetId, scene);
      if (res.success) {
        toast({ title: "Success", description: "Design saved successfully!" });
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save design", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteElement = () => {
    if (selectedId === null) return;
    const newElements = scene.elements.filter((_: any, i: number) => i !== selectedId);
    setScene({ ...scene, elements: newElements });
    setSelectedId(null);
  };

  const addText = () => {
    const newEl = {
      type: 'text',
      content: 'New Text',
      x: 100,
      y: 100,
      fontSize: 40,
      fill: '#000000',
      draggable: true
    };
    const newElements = [...scene.elements, newEl];
    setScene({ ...scene, elements: newElements });
    setSelectedId(newElements.length - 1);
  };

  const addRect = () => {
    const newEl = {
      type: 'rect',
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: '#3b82f6',
      draggable: true
    };
    const newElements = [...scene.elements, newEl];
    setScene({ ...scene, elements: newElements });
    setSelectedId(newElements.length - 1);
  };

  const addCircle = () => {
    const newEl = {
      type: 'circle',
      x: 100,
      y: 100,
      radius: 50,
      fill: '#ef4444',
      draggable: true
    };
    const newElements = [...scene.elements, newEl];
    setScene({ ...scene, elements: newElements });
    setSelectedId(newElements.length - 1);
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Convert to data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newEl = {
          type: 'image',
          src: dataUrl,
          x: 100,
          y: 100,
          width: 200,
          height: 200,
          draggable: true
        };
        const newElements = [...scene.elements, newEl];
        setScene({ ...scene, elements: newElements });
        setSelectedId(newElements.length - 1);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedId !== null && (e.key === 'Delete' || e.key === 'Backspace')) {
        // Prevent deletion if focus is on an input or textarea
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
          return;
        }
        deleteElement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, scene.elements]);

  const alignElement = (type: 'left' | 'right' | 'center' | 'top' | 'bottom' | 'middle') => {
    if (selectedId === null) return;
    const el = { ...scene.elements[selectedId] };
    const width = el.type === 'circle' ? (el.radius * 2) : (el.width || 100);
    const height = el.type === 'circle' ? (el.radius * 2) : (el.height || 100);

    switch (type) {
      case 'left': el.x = 0; break;
      case 'right': el.x = scene.width - width; break;
      case 'center': el.x = (scene.width - width) / 2; break;
      case 'top': el.y = 0; break;
      case 'bottom': el.y = scene.height - height; break;
      case 'middle': el.y = (scene.height - height) / 2; break;
    }
    updateElement(selectedId, el);
  };

  const moveLayer = (fromIndex: number, toIndex: number) => {
    const newElements = [...scene.elements];
    const [removed] = newElements.splice(fromIndex, 1);
    newElements.splice(toIndex, 0, removed);
    setScene({ ...scene, elements: newElements });
    setSelectedId(toIndex);
  };

  const handleExport = async (format: 'png' | 'svg' | 'pdf' = 'png') => {
    if (format === 'png') {
      if (!stageRef.current) return;
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${assetId || 'brand-asset'}.png`;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Success", description: "Design exported as PNG" });
    } else {
      // For SVG and PDF, call server action
      try {
        const { downloadLogoComponent } = await import('@/app/actions/logo-actions');
        const result = await downloadLogoComponent(brandId, assetId, format);
        
        if (result.success && result.data) {
          // Convert base64 to blob
          const byteCharacters = atob(result.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: result.mimeType });

          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = result.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast({ title: "Success", description: `Design exported as ${format.toUpperCase()}` });
        } else {
          throw new Error(result.error || 'Export failed');
        }
      } catch (error) {
        toast({ title: "Error", description: `Failed to export as ${format}`, variant: "destructive" });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-6 bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <h2 className="font-bold text-lg">Brand Canvas Editor</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => handleExport('png')}>
            <Download className="h-4 w-4 mr-2" />
            PNG
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('svg')}>
            <Download className="h-4 w-4 mr-2" />
            SVG
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <aside className="w-16 border-r flex flex-col items-center py-6 gap-6 bg-card shrink-0">
          <Button variant="ghost" size="icon" onClick={addText} title="Add Text">
            <Type className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={addRect} title="Add Rectangle">
            <Box className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={addCircle} title="Add Circle">
            <Circle className="h-6 w-6" />
          </Button>
          <div className="w-8 h-[1px] bg-border my-2" />
          <Button variant="ghost" size="icon" onClick={addImage} title="Add Image">
            <ImageIcon className="h-6 w-6" />
          </Button>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 overflow-auto bg-muted/30 p-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 bg-card border rounded-full px-3 py-1 shadow-sm">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <div className="w-[1px] h-4 bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(0.5)}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative shadow-2xl border bg-white origin-center transition-all">
            <CanvasRenderer
              ref={stageRef}
              sceneData={scene}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUpdateElement={updateElement}
              scale={zoom}
            />
          </div>
        </main>

        {/* Properties/Layers Sidebar */}
        <aside className="w-80 border-l bg-card flex flex-col shrink-0">
          <Tabs defaultValue="properties" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 px-4 gap-4">
              <TabsTrigger value="properties" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12 font-bold">
                <Settings className="h-4 w-4 mr-2" />
                Properties
              </TabsTrigger>
              <TabsTrigger value="layers" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12 font-bold">
                <Layers className="h-4 w-4 mr-2" />
                Layers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="flex-1 overflow-y-auto p-6 m-0 space-y-8">
              {selectedElement ? (
                <div className="space-y-6">
                  {/* Alignment Section */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Alignment</Label>
                    <div className="grid grid-cols-6 gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => alignElement('left')}><AlignLeft className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent>Align Left</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => alignElement('center')}><AlignCenter className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent>Align Center</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => alignElement('right')}><AlignRight className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent>Align Right</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => alignElement('top')}><AlignVerticalJustifyStart className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent>Align Top</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => alignElement('middle')}><AlignVerticalJustifyCenter className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent>Align Middle</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => alignElement('bottom')}><AlignVerticalJustifyEnd className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent>Align Bottom</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="font-bold flex items-center gap-2">
                      {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)}
                    </h3>
                    <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={deleteElement}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {selectedElement.type === 'text' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Text Content</Label>
                        <Input
                          value={selectedElement.content}
                          onChange={(e) => updateElement(selectedId!, { ...selectedElement, content: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Font Size: {selectedElement.fontSize}px</Label>
                        <Slider
                          value={[selectedElement.fontSize]}
                          min={10}
                          max={200}
                          onValueChange={([val]) => updateElement(selectedId!, { ...selectedElement, fontSize: val })}
                        />
                      </div>
                    </div>
                  )}

                  {selectedElement.type === 'image' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input
                          value={selectedElement.src || ''}
                          onChange={(e) => updateElement(selectedId!, { ...selectedElement, src: e.target.value })}
                          placeholder="https://... or data:..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Replace Image</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const dataUrl = event.target?.result as string;
                                updateElement(selectedId!, { ...selectedElement, src: dataUrl });
                              };
                              reader.readAsDataURL(file);
                            };
                            input.click();
                          }}
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>Width: {selectedElement.width}px</Label>
                          <Slider
                            value={[selectedElement.width || 200]}
                            min={50}
                            max={1000}
                            onValueChange={([val]) => updateElement(selectedId!, { ...selectedElement, width: val })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Height: {selectedElement.height}px</Label>
                          <Slider
                            value={[selectedElement.height || 200]}
                            min={50}
                            max={1000}
                            onValueChange={([val]) => updateElement(selectedId!, { ...selectedElement, height: val })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Fill Color</Label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Input
                          type="color"
                          className="w-12 h-10 p-1 cursor-pointer"
                          value={selectedElement.fill?.startsWith('#') ? selectedElement.fill : '#000000'}
                          onChange={(e) => updateElement(selectedId!, { ...selectedElement, fill: e.target.value })}
                        />
                      </div>
                      <Input
                        value={selectedElement.fill}
                        onChange={(e) => updateElement(selectedId!, { ...selectedElement, fill: e.target.value })}
                        placeholder="#000000"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Opacity: {Math.round((selectedElement.opacity ?? 1) * 100)}%</Label>
                    <Slider
                      value={[(selectedElement.opacity ?? 1) * 100]}
                      min={0}
                      max={100}
                      onValueChange={([val]) => updateElement(selectedId!, { ...selectedElement, opacity: val / 100 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Layering</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 h-9" onClick={() => moveLayer(selectedId!, scene.elements.length - 1)}>
                        To Front
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 h-9" onClick={() => moveLayer(selectedId!, 0)}>
                        To Back
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Settings className="h-12 w-12 mb-4 opacity-10" />
                  <p className="text-sm px-8">Select an element on the canvas to see its properties</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="layers" className="flex-1 overflow-y-auto m-0">
              <div className="p-2 space-y-1">
                {scene.elements.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">No layers yet</div>
                ) : (
                  [...scene.elements].reverse().map((el: any, i: number) => {
                    const realIndex = scene.elements.length - 1 - i;
                    const isSelected = selectedId === realIndex;
                    return (
                      <div
                        key={realIndex}
                        onClick={() => setSelectedId(realIndex)}
                        className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'}`}
                      >
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                          {el.type === 'text' && <Type className="h-4 w-4" />}
                          {el.type === 'rect' && <Box className="h-4 w-4" />}
                          {el.type === 'circle' && <Circle className="h-4 w-4" />}
                          {el.type === 'image' && <ImageIcon className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {el.type === 'text' ? (el.content || 'Text') : (el.type.charAt(0).toUpperCase() + el.type.slice(1))}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
