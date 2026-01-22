"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, Save, Type, Image as ImageIcon, Box, Trash2, Download } from 'lucide-react';
import { CanvasRenderer } from './canvas-renderer';
import { updateAssetScene } from '@/app/actions/actions';
import { useToast } from "@/hooks/use-toast";

export function BrandCanvasEditor({ initialScene, brandId, assetId, onClose }: any) {
  const [scene, setScene] = useState(initialScene || { elements: [], width: 1080, height: 1080 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
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
      x: 50,
      y: 50,
      fontSize: 40,
      fill: '#000000',
      draggable: true
    };
    setScene({ ...scene, elements: [...scene.elements, newEl] });
  };

  const handleExport = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `${assetId || 'brand-asset'}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Success", description: "Design exported as PNG" });
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
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export PNG
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <aside className="w-16 border-r flex flex-col items-center py-6 gap-6 bg-card">
          <Button variant="ghost" size="icon" onClick={addText} title="Add Text">
            <Type className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" title="Add Image">
            <ImageIcon className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" title="Add Shape">
            <Box className="h-6 w-6" />
          </Button>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 overflow-auto bg-muted/30 p-12 flex justify-center items-center">
          <div className="relative shadow-2xl border bg-white">
            <CanvasRenderer
              ref={stageRef}
              sceneData={scene}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUpdateElement={updateElement}
            />
          </div>
        </main>

        {/* Properties Sidebar */}
        <aside className="w-80 border-l bg-card overflow-y-auto p-6 space-y-8">
          {selectedElement ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-bold">Properties</h3>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={deleteElement}>
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
                    <Label>Font Size</Label>
                    <Slider
                      value={[selectedElement.fontSize]}
                      min={10}
                      max={200}
                      onValueChange={([val]) => updateElement(selectedId!, { ...selectedElement, fontSize: val })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Fill Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="w-12 h-10 p-1"
                    value={selectedElement.fill?.startsWith('#') ? selectedElement.fill : '#000000'}
                    onChange={(e) => updateElement(selectedId!, { ...selectedElement, fill: e.target.value })}
                  />
                  <Input
                    value={selectedElement.fill}
                    onChange={(e) => updateElement(selectedId!, { ...selectedElement, fill: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Opacity</Label>
                <Slider
                  value={[selectedElement.opacity * 100 || 100]}
                  min={0}
                  max={100}
                  onValueChange={([val]) => updateElement(selectedId!, { ...selectedElement, opacity: val / 100 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Layering</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                    const newElements = [...scene.elements];
                    const el = newElements.splice(selectedId!, 1)[0];
                    newElements.push(el);
                    setScene({ ...scene, elements: newElements });
                    setSelectedId(newElements.length - 1);
                  }}>Bring to Front</Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                    const newElements = [...scene.elements];
                    const el = newElements.splice(selectedId!, 1)[0];
                    newElements.unshift(el);
                    setScene({ ...scene, elements: newElements });
                    setSelectedId(0);
                  }}>Send to Back</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <Type className="h-12 w-12 mb-4 opacity-20" />
              <p>Select an element on the canvas to edit its properties</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
