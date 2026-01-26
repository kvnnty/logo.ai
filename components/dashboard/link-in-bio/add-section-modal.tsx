"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Link as LinkIcon,
  Type,
  Instagram,
  Image as ImageIcon,
  MapPin,
  Map,
  FileText,
} from "lucide-react";

interface BlockType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: 'link' | 'text' | 'social-icons' | 'image' | 'address' | 'map';
}

const BLOCK_TYPES: BlockType[] = [
  {
    id: 'link',
    name: 'Your Links',
    description: 'Include links to your important business pages.',
    icon: <LinkIcon className="h-5 w-5" />,
    type: 'link',
  },
  {
    id: 'text',
    name: 'Text',
    description: 'Express more about yourself or your business.',
    icon: <Type className="h-5 w-5" />,
    type: 'text',
  },
  {
    id: 'social-icons',
    name: 'Social Icons',
    description: 'Include links to your social channels with icons.',
    icon: <Instagram className="h-5 w-5" />,
    type: 'social-icons',
  },
  {
    id: 'image',
    name: 'Image',
    description: 'Upload images to showcase your business.',
    icon: <ImageIcon className="h-5 w-5" />,
    type: 'image',
  },
  {
    id: 'address',
    name: 'Address',
    description: 'Let your customers know where to find you.',
    icon: <MapPin className="h-5 w-5" />,
    type: 'address',
  },
  {
    id: 'map',
    name: 'Google Maps',
    description: 'Share your Google Map location.',
    icon: <Map className="h-5 w-5" />,
    type: 'map',
  },
];

interface AddSectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBlock: (type: BlockType['type']) => void;
}

export function AddSectionModal({ open, onOpenChange, onSelectBlock }: AddSectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a section to your link in bio</DialogTitle>
          <DialogDescription>
            Select one block and customize it.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {BLOCK_TYPES.map((block) => (
            <Button
              key={block.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-accent text-ellipsis"
              onClick={() => {
                onSelectBlock(block.type);
                onOpenChange(false);
              }}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {block.icon}
                </div>
                <div className="flex-1 text-left text-wrap">
                  <div className="font-semibold">{block.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {block.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
