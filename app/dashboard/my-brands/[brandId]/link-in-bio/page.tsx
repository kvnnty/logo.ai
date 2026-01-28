"use client";

import { useBrand } from "@/components/providers/brand-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  X,
  Sparkles,
  Palette,
  Settings,
  FileText,
  ArrowLeft,
  Crown,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { saveLinkInBio, getLinkInBio, publishLinkInBio } from "@/app/actions/link-in-bio-actions";
import { getCredits } from "@/app/actions/credits-actions";
import { Reorder } from "framer-motion";
import { AddSectionModal } from "@/components/dashboard/link-in-bio/add-section-modal";
import { MobilePreview } from "@/components/dashboard/link-in-bio/mobile-preview";
import { SelectLogoDialog } from "@/components/dashboard/link-in-bio/select-logo-dialog";
import { SOCIAL_PLATFORMS, FONTS } from "@/components/dashboard/link-in-bio/constants";
import { getPrimaryLogoUrl } from "@/lib/utils/brand-utils";

interface LinkItem {
  id: string;
  type: 'link';
  platform: string;
  linkName: string;
  url: string;
  visible: boolean;
}

interface TextItem {
  id: string;
  type: 'text';
  content: string;
  style: 'heading' | 'body' | 'bio' | 'announcement';
  visible: boolean;
}

interface ImageItem {
  id: string;
  type: 'image';
  imageUrl: string;
  imageUrls?: string[]; // For multiple images
  caption?: string;
  visible: boolean;
}

interface AddressItem {
  id: string;
  type: 'address';
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  visible: boolean;
}

interface MapItem {
  id: string;
  type: 'map';
  address: string;
  embedUrl?: string;
  visible: boolean;
}

interface SocialIconItem {
  id: string;
  platform: string;
  url: string;
  visible: boolean;
}

type BlockItem = LinkItem | TextItem | ImageItem | AddressItem | MapItem;
type ContentBlockItem = TextItem | ImageItem | AddressItem | MapItem;

interface LinkInBioData {
  profileImage?: string;
  profileTitle?: string;
  description?: string;
  links?: LinkItem[];
  contentBlocks?: ContentBlockItem[];
  blocks?: BlockItem[]; // Legacy support
  socialIcons?: SocialIconItem[];
  styles?: {
    template?: string;
    background?: {
      style?: string;
      color?: string;
      imageUrl?: string;
    };
    buttons?: {
      color?: string;
      textColor?: string;
      iconColor?: string;
      shadowColor?: string;
      style?: string;
      shape?: string;
    };
    socialIcons?: {
      style?: string;
      iconColor?: string;
    };
    fonts?: {
      fontColor?: string;
      fontFamily?: string;
    };
  };
  settings?: {
    customDomain?: string;
    metaTags?: {
      title?: string;
      description?: string;
      image?: string;
    };
  };
}

export default function LinkInBioPage() {
  const brand = useBrand();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'settings'>('content');
  const [data, setData] = useState<LinkInBioData>({
    links: [],
    contentBlocks: [],
    socialIcons: [],
    styles: {
      template: 'minimal',
      background: { style: 'color', color: '#FFFFFF' },
      buttons: {
        color: '#0F2A35',
        textColor: '#FFFFFF',
        iconColor: '#FFFFFF',
        shadowColor: '#000000',
        style: 'filled',
        shape: 'rounded',
      },
      socialIcons: {
        style: 'outline',
        iconColor: '#0F2A35',
      },
      fonts: {
        fontColor: '#0F2A35',
        fontFamily: 'Inter',
      },
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [addSectionModalOpen, setAddSectionModalOpen] = useState(false);
  const [selectLogoDialogOpen, setSelectLogoDialogOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getLinkInBio(brand._id);
      const logoUrl = getPrimaryLogoUrl(brand.assets) || '';

      if (result.success && result.data) {
        // Migrate legacy blocks structure to new structure
        const allBlocks = result.data.blocks || [];
        const links: LinkItem[] = [];
        const contentBlocks: ContentBlockItem[] = [];

        allBlocks.forEach((block: any) => {
          if (!block.type || block.type === 'link') {
            // Legacy link or link block
            links.push({
              id: block.id || `link_${Date.now()}`,
              type: 'link',
              platform: block.platform || 'no-icon',
              linkName: block.linkName || '',
              url: block.url || '',
              visible: block.visible !== false,
            });
          } else if (['text', 'image', 'address', 'map'].includes(block.type)) {
            contentBlocks.push(block as ContentBlockItem);
          }
        });

        setData({
          profileImage: result.data.profileImage || logoUrl,
          profileTitle: result.data.profileTitle || brand.name || '',
          description: result.data.description || brand.description || '',
          links: result.data.links || links,
          contentBlocks: result.data.contentBlocks || contentBlocks,
          socialIcons: result.data.socialIcons || [],
          styles: result.data.styles || data.styles,
          settings: result.data.settings || {},
        });
        setPublicUrl(result.publicUrl ?? null);
      } else {
        // Initialize with brand logo if no data exists
        setData(prev => ({
          ...prev,
          profileImage: logoUrl,
          profileTitle: brand.name || '',
          description: brand.description || '',
        }));
      }

      const creditsData = await getCredits();
      setCredits(creditsData.remaining || 0);
    }
    load();
  }, [brand._id, brand.assets, brand.name, brand.description]);

  const updateData = (updates: Partial<LinkInBioData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveLinkInBio(brand._id, data);
      if (result.success) {
        toast({ title: "Saved", description: "Link-in-bio page saved successfully" });
      } else {
        throw new Error(result.error || "Failed to save");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (credits < 1) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 1 credit to publish your link-in-bio page.",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);
    try {
      const result = await publishLinkInBio(brand._id);
      if (result.success && result.publicUrl) {
        setPublicUrl(result.publicUrl);
        toast({
          title: "Published",
          description: `Your link-in-bio is live at ${result.publicUrl}`
        });
        const creditsData = await getCredits();
        setCredits(creditsData.remaining || 0);
      } else {
        throw new Error(result.error || "Failed to publish");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAddBlock = (type: 'link' | 'text' | 'social-icons' | 'image' | 'address' | 'map') => {
    if (type === 'link') {
      const newLink: LinkItem = {
        id: `link_${Date.now()}`,
        type: 'link',
        platform: 'no-icon',
        linkName: '',
        url: '',
        visible: true,
      };
      updateData({ links: [...(data.links || []), newLink] });
    } else if (type === 'text') {
      const newText: TextItem = {
        id: `block_${Date.now()}`,
        type: 'text',
        content: '',
        style: 'body',
        visible: true,
      };
      updateData({ contentBlocks: [...(data.contentBlocks || []), newText] });
    } else if (type === 'image') {
      const newImage: ImageItem = {
        id: `block_${Date.now()}`,
        type: 'image',
        imageUrl: '',
        caption: '',
        visible: true,
      };
      updateData({ contentBlocks: [...(data.contentBlocks || []), newImage] });
    } else if (type === 'address') {
      const newAddress: AddressItem = {
        id: `block_${Date.now()}`,
        type: 'address',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        visible: true,
      };
      updateData({ contentBlocks: [...(data.contentBlocks || []), newAddress] });
    } else if (type === 'map') {
      const newMap: MapItem = {
        id: `block_${Date.now()}`,
        type: 'map',
        address: '',
        embedUrl: '',
        visible: true,
      };
      updateData({ contentBlocks: [...(data.contentBlocks || []), newMap] });
    } else if (type === 'social-icons') {
      const newIcon: SocialIconItem = {
        id: `social_${Date.now()}`,
        platform: 'instagram',
        url: '',
        visible: true,
      };
      updateData({ socialIcons: [...(data.socialIcons || []), newIcon] });
    }
  };

  const addLink = () => {
    handleAddBlock('link');
  };

  const updateLink = (id: string, updates: Partial<LinkItem>) => {
    updateData({
      links: (data.links?.map(link =>
        link.id === id ? { ...link, ...updates } as LinkItem : link
      ) || []) as LinkItem[],
    });
  };

  const removeLink = (id: string) => {
    updateData({
      links: data.links?.filter(link => link.id !== id) || [],
    });
  };

  const updateContentBlock = (id: string, updates: Partial<ContentBlockItem>) => {
    updateData({
      contentBlocks: (data.contentBlocks?.map(block =>
        block.id === id ? { ...block, ...updates } as ContentBlockItem : block
      ) || []) as ContentBlockItem[],
    });
  };

  const removeContentBlock = (id: string) => {
    updateData({
      contentBlocks: data.contentBlocks?.filter(block => block.id !== id) || [],
    });
  };

  const handleImageUpload = (blockId: string, e: React.ChangeEvent<HTMLInputElement>, multiple: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (multiple && files.length > 1) {
      // Handle multiple images
      const readers = Array.from(files).map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then((imageUrls) => {
        updateContentBlock(blockId, {
          imageUrl: imageUrls[0], // First image as primary
          imageUrls: imageUrls,
        } as Partial<ImageItem>);
      });
    } else {
      // Single image
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        updateContentBlock(blockId, { imageUrl: dataUrl } as Partial<ImageItem>);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateMapEmbedUrl = (address: string) => {
    if (!address) return '';
    const encoded = encodeURIComponent(address);
    // Use Google Maps search embed (works without API key)
    return `https://www.google.com/maps?q=${encoded}&output=embed`;
  };

  const addSocialIcon = () => {
    const newIcon: SocialIconItem = {
      id: `social_${Date.now()}`,
      platform: 'instagram',
      url: '',
      visible: true,
    };
    updateData({ socialIcons: [...(data.socialIcons || []), newIcon] });
  };

  const updateSocialIcon = (id: string, updates: Partial<SocialIconItem>) => {
    updateData({
      socialIcons: data.socialIcons?.map(icon =>
        icon.id === id ? { ...icon, ...updates } : icon
      ) || [],
    });
  };

  const removeSocialIcon = (id: string) => {
    updateData({
      socialIcons: data.socialIcons?.filter(icon => icon.id !== id) || [],
    });
  };

  // Profile image uses brand's primary logo - no upload needed

  // Get brand's primary logo for profile image
  const brandLogoUrl = getPrimaryLogoUrl(brand.assets) || '';
  const profileImageUrl = data.profileImage || brandLogoUrl;

  // Update data with brand logo if not set
  useEffect(() => {
    if (!data.profileImage && brandLogoUrl) {
      updateData({ profileImage: brandLogoUrl });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandLogoUrl]);

  return (
    <div>
      <div className="bg-white border-b sticky top-0 z-10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-screen relative grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Editor */}
          <div className={`lg:col-span-2 ${!panelOpen ? 'hidden lg:block' : ''}`}>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <div className="flex flex-col">
                <TabsList className="w-fit mx-auto mb-4">
                  <TabsTrigger value="content">
                    <FileText className="h-4 w-4 mr-2" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="style">
                    <Palette className="h-4 w-4 mr-2" />
                    Style
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>
                <div className="bg-white rounded-lg border-b px-4">
                  {/* Panel Header */}
                  <div className="border-b py-4 flex items-center justify-between">
                    <h2 className="font-bold text-lg">
                      {activeTab === 'content' && 'Add your Links'}
                      {activeTab === 'style' && 'Select style'}
                      {activeTab === 'settings' && 'Settings'}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPanelOpen(false)}
                      className="lg:hidden"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>



                  <div className="flex-1">
                    {/* Content Tab */}
                    <TabsContent value="content" className="py-6 space-y-6 mt-0">
                      {/* Profile Information */}
                      <div className="space-y-6 border rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold flex items-center gap-2">
                            Profile Information
                          </h3>
                          <Eye className="h-4 w-4 text-gray-400" />
                        </div>

                        <div className="space-y-6">
                          <div>
                            <Label>Profile Image</Label>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 overflow-hidden">
                                <img
                                  src={profileImageUrl}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="mt-2 space-y-4">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setSelectLogoDialogOpen(true)}
                                >
                                  <ImageIcon className="h-4 w-4" />
                                  Change Image
                                </Button>
                                <p className="text-xs text-gray-500">
                                  Select a logo from your brand assets to use as your profile image.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Profile Title</Label>
                            <Input
                              value={data.profileTitle || ''}
                              onChange={(e) => updateData({ profileTitle: e.target.value })}
                              placeholder="Title"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={data.description || ''}
                              onChange={(e) => updateData({ description: e.target.value })}
                              placeholder="Description"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Your Links Section */}
                      <div className="space-y-6 border rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold flex items-center gap-2">
                            Your Links
                          </h3>
                        </div>

                        <Reorder.Group
                          axis="y"
                          values={data.links || []}
                          onReorder={(newOrder) => updateData({ links: newOrder })}
                          className="space-y-4"
                        >
                          {data.links?.map((link, index) => (
                            <Reorder.Item key={link.id} value={link}>
                              <div className="border rounded p-6 space-y-3 bg-white">
                                <div className="flex items-start gap-4">
                                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move mt-2" />
                                  <div className="space-y-6 w-full">
                                    <div>
                                      <Label>Link Name</Label>
                                      <Input
                                        value={link.linkName}
                                        onChange={(e) => updateLink(link.id, { linkName: e.target.value })}
                                        placeholder="Button text"
                                      />
                                    </div>
                                    <div>
                                      <Label>URL</Label>
                                      <Input
                                        type="url"
                                        value={link.url}
                                        onChange={(e) => updateLink(link.id, { url: e.target.value })}
                                        placeholder="https://example.com"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateLink(link.id, { visible: !link.visible })}
                                      >
                                        {link.visible ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                                        {link.visible ? 'Hide Link' : 'Show Link'}
                                      </Button>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => removeLink(link.id)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove Link
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>

                        <Button onClick={addLink} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Link
                        </Button>
                      </div>

                      {/* Social Icons */}
                      <div className="space-y-6 border rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold flex items-center gap-2">
                            Social Icons
                          </h3>
                        </div>

                        <Reorder.Group
                          axis="y"
                          values={data.socialIcons || []}
                          onReorder={(newOrder) => updateData({ socialIcons: newOrder })}
                          className="space-y-4"
                        >
                          {data.socialIcons?.map((icon, index) => (
                            <Reorder.Item key={icon.id} value={icon}>
                              <div className="border rounded p-6 space-y-3 bg-white">
                                <div className="flex items-start gap-4">
                                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move mt-2" />
                                  <div className="space-y-6 w-full">
                                    <div>
                                      <Label>Platform</Label>
                                      <Select
                                        value={icon.platform}
                                        onValueChange={(value) => updateSocialIcon(icon.id, { platform: value })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select icon" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {SOCIAL_PLATFORMS.filter(p => p.value !== 'no-icon').map(platform => (
                                            <SelectItem key={platform.value} value={platform.value}>
                                              {platform.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label>URL</Label>
                                      <Input
                                        type="url"
                                        value={icon.url}
                                        onChange={(e) => updateSocialIcon(icon.id, { url: e.target.value })}
                                        placeholder="https://example.com"
                                      />
                                    </div>

                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateSocialIcon(icon.id, { visible: !icon.visible })}
                                      >
                                        {icon.visible ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                                        {icon.visible ? 'Hide Link' : 'Show Link'}
                                      </Button>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => removeSocialIcon(icon.id)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove Link
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>

                        <Button onClick={addSocialIcon} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Social Icon
                        </Button>
                      </div>

                      {/* Content Blocks Section */}
                      <div className="space-y-6 border rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold flex items-center gap-2">
                            Content Blocks
                          </h3>
                        </div>

                        <Reorder.Group
                          axis="y"
                          values={data.contentBlocks || []}
                          onReorder={(newOrder) => updateData({ contentBlocks: newOrder })}
                          className="space-y-4"
                        >
                          {data.contentBlocks?.map((block, index) => (
                            <Reorder.Item key={block.id} value={block}>
                              <div className="border rounded p-6 space-y-3 bg-white">
                                <div className="flex items-start gap-4">
                                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move mt-2" />
                                  <div className="space-y-6 w-full">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium text-gray-500 uppercase">
                                        {block.type === 'text' && 'Text Block'}
                                        {block.type === 'image' && 'Image Block'}
                                        {block.type === 'address' && 'Address Block'}
                                        {block.type === 'map' && 'Map Block'}
                                      </span>
                                    </div>

                                    {/* Text Block */}
                                    {block.type === 'text' && (
                                      <>
                                        <div>
                                          <Label>Text Style</Label>
                                          <Select
                                            value={block.style}
                                            onValueChange={(value: any) => updateContentBlock(block.id, { style: value })}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="heading">Heading</SelectItem>
                                              <SelectItem value="body">Body</SelectItem>
                                              <SelectItem value="bio">Bio</SelectItem>
                                              <SelectItem value="announcement">Announcement</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label>Content</Label>
                                          <Textarea
                                            value={block.content}
                                            onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                                            placeholder="Enter your text content"
                                            rows={4}
                                          />
                                        </div>
                                      </>
                                    )}

                                    {/* Image Block */}
                                    {block.type === 'image' && (
                                      <>
                                        <div>
                                          <Label>Images</Label>
                                          <div className="mt-2 space-y-2">
                                            {block.imageUrl && (
                                              <div className="space-y-2">
                                                {block.imageUrls && block.imageUrls.length > 1 ? (
                                                  <div className="grid grid-cols-2 gap-2">
                                                    {block.imageUrls.map((url, idx) => (
                                                      <img key={idx} src={url} alt={`Uploaded ${idx + 1}`} className="w-full rounded-lg h-32 object-cover" />
                                                    ))}
                                                  </div>
                                                ) : (
                                                  <img src={block.imageUrl} alt="Uploaded" className="w-full rounded-lg max-h-48 object-cover" />
                                                )}
                                                <div className="flex gap-2">
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => document.getElementById(`image-upload-${block.id}`)?.click()}
                                                  >
                                                    <ImageIcon className="h-4 w-4 mr-2" />
                                                    {block.imageUrls && block.imageUrls.length > 1 ? 'Change Images' : 'Change Image'}
                                                  </Button>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => document.getElementById(`image-upload-multiple-${block.id}`)?.click()}
                                                  >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add More
                                                  </Button>
                                                </div>
                                              </div>
                                            )}
                                            {!block.imageUrl && (
                                              <div className="flex gap-2">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => document.getElementById(`image-upload-${block.id}`)?.click()}
                                                >
                                                  <ImageIcon className="h-4 w-4 mr-2" />
                                                  Upload Image
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => document.getElementById(`image-upload-multiple-${block.id}`)?.click()}
                                                >
                                                  <ImageIcon className="h-4 w-4 mr-2" />
                                                  Upload Multiple
                                                </Button>
                                              </div>
                                            )}
                                            <input
                                              id={`image-upload-${block.id}`}
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              onChange={(e) => handleImageUpload(block.id, e, false)}
                                            />
                                            <input
                                              id={`image-upload-multiple-${block.id}`}
                                              type="file"
                                              accept="image/*"
                                              multiple
                                              className="hidden"
                                              onChange={(e) => handleImageUpload(block.id, e, true)}
                                            />
                                          </div>
                                        </div>
                                        <div>
                                          <Label>Caption (optional)</Label>
                                          <Input
                                            value={block.caption || ''}
                                            onChange={(e) => updateContentBlock(block.id, { caption: e.target.value })}
                                            placeholder="Image caption"
                                          />
                                        </div>
                                      </>
                                    )}

                                    {/* Address Block */}
                                    {block.type === 'address' && (
                                      <>
                                        <div>
                                          <Label>Street Address</Label>
                                          <Input
                                            value={block.address}
                                            onChange={(e) => updateContentBlock(block.id, { address: e.target.value })}
                                            placeholder="123 Main Street"
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <Label>City</Label>
                                            <Input
                                              value={block.city || ''}
                                              onChange={(e) => updateContentBlock(block.id, { city: e.target.value })}
                                              placeholder="City"
                                            />
                                          </div>
                                          <div>
                                            <Label>State</Label>
                                            <Input
                                              value={block.state || ''}
                                              onChange={(e) => updateContentBlock(block.id, { state: e.target.value })}
                                              placeholder="State"
                                            />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <Label>ZIP Code</Label>
                                            <Input
                                              value={block.zip || ''}
                                              onChange={(e) => updateContentBlock(block.id, { zip: e.target.value })}
                                              placeholder="ZIP"
                                            />
                                          </div>
                                          <div>
                                            <Label>Country</Label>
                                            <Input
                                              value={block.country || ''}
                                              onChange={(e) => updateContentBlock(block.id, { country: e.target.value })}
                                              placeholder="Country"
                                            />
                                          </div>
                                        </div>
                                      </>
                                    )}

                                    {/* Map Block */}
                                    {block.type === 'map' && (
                                      <>
                                        <div>
                                          <Label>Business Address</Label>
                                          <Input
                                            value={block.address}
                                            onChange={(e) => {
                                              const address = e.target.value;
                                              updateContentBlock(block.id, {
                                                address,
                                                embedUrl: generateMapEmbedUrl(address)
                                              });
                                            }}
                                            placeholder="Enter your business address"
                                          />
                                          <p className="text-xs text-gray-500 mt-1">
                                            Enter the full address to generate a Google Maps embed
                                          </p>
                                        </div>
                                        {block.embedUrl && (
                                          <div>
                                            <Label>Map Preview</Label>
                                            <div className="mt-2 rounded-lg overflow-hidden border">
                                              <iframe
                                                width="100%"
                                                height="200"
                                                style={{ border: 0 }}
                                                loading="lazy"
                                                allowFullScreen
                                                src={block.embedUrl}
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}

                                    {/* Common Actions */}
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateContentBlock(block.id, { visible: !block.visible })}
                                      >
                                        {block.visible ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                                        {block.visible ? 'Hide' : 'Show'}
                                      </Button>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => removeContentBlock(block.id)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>

                        <Button onClick={() => setAddSectionModalOpen(true)} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Section
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Style Tab */}
                    <TabsContent value="style" className="py-6 space-y-6 mt-0">
                      {/* Templates */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Choose a template</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => updateData({ styles: { ...data.styles, template: 'standout' } })}
                            className={`border-2 rounded-lg p-4 text-left transition-all ${data.styles?.template === 'standout' ? 'border-primary' : 'border-gray-200'
                              }`}
                          >
                            <div className="h-32 bg-gray-900 rounded mb-2"></div>
                            <p className="font-medium">Brand Standout</p>
                          </button>
                          <button
                            onClick={() => updateData({ styles: { ...data.styles, template: 'minimal' } })}
                            className={`border-2 rounded-lg p-4 text-left transition-all ${data.styles?.template === 'minimal' ? 'border-primary' : 'border-gray-200'
                              }`}
                          >
                            <div className="h-32 bg-white border rounded mb-2"></div>
                            <p className="font-medium">Brand Minimal</p>
                          </button>
                        </div>
                      </div>

                      {/* Background */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Background</h3>
                        <div className="space-y-3">
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="bg-style"
                                checked={data.styles?.background?.style === 'color'}
                                onChange={() => updateData({
                                  styles: {
                                    ...data.styles,
                                    background: { ...data.styles?.background, style: 'color' }
                                  }
                                })}
                              />
                              Color
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="bg-style"
                                checked={data.styles?.background?.style === 'image'}
                                onChange={() => updateData({
                                  styles: {
                                    ...data.styles,
                                    background: { ...data.styles?.background, style: 'image' }
                                  }
                                })}
                              />
                              Image
                              <Crown className="h-3 w-3 text-yellow-500" />
                            </label>
                          </div>
                          {data.styles?.background?.style === 'image' && (
                            <div>
                              <Input
                                type="url"
                                placeholder="Image URL"
                                value={data.styles?.background?.imageUrl || ''}
                                onChange={(e) => updateData({
                                  styles: {
                                    ...data.styles,
                                    background: { ...data.styles?.background, imageUrl: e.target.value }
                                  }
                                })}
                              />
                            </div>
                          )}
                          {data.styles?.background?.style === 'color' && (
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={data.styles?.background?.color || '#FFFFFF'}
                                onChange={(e) => updateData({
                                  styles: {
                                    ...data.styles,
                                    background: { ...data.styles?.background, color: e.target.value }
                                  }
                                })}
                                className="w-12 h-12 rounded border"
                              />
                              <Input
                                value={data.styles?.background?.color || '#FFFFFF'}
                                onChange={(e) => updateData({
                                  styles: {
                                    ...data.styles,
                                    background: { ...data.styles?.background, color: e.target.value }
                                  }
                                })}
                                className="flex-1"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Custom Button Colors</h3>
                        <div className="space-y-3">
                          <div>
                            <Label>Button color</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="color"
                                value={data.styles?.buttons?.color || '#0F2A35'}
                                onChange={(e) => updateData({
                                  styles: {
                                    ...data.styles,
                                    buttons: { ...data.styles?.buttons, color: e.target.value }
                                  }
                                })}
                                className="w-12 h-12 rounded border"
                              />
                              <Input
                                value={data.styles?.buttons?.color || '#0F2A35'}
                                onChange={(e) => updateData({
                                  styles: {
                                    ...data.styles,
                                    buttons: { ...data.styles?.buttons, color: e.target.value }
                                  }
                                })}
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Text color</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="color"
                                value={data.styles?.buttons?.textColor || '#FFFFFF'}
                                onChange={(e) => updateData({
                                  styles: {
                                    ...data.styles,
                                    buttons: { ...data.styles?.buttons, textColor: e.target.value }
                                  }
                                })}
                                className="w-12 h-12 rounded border"
                              />
                              <Input
                                value={data.styles?.buttons?.textColor || '#FFFFFF'}
                                onChange={(e) => updateData({
                                  styles: {
                                    ...data.styles,
                                    buttons: { ...data.styles?.buttons, textColor: e.target.value }
                                  }
                                })}
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Icon color</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="color"
                                value={data.styles?.buttons?.iconColor || '#FFFFFF'}
                                onChange={(e) => updateData({
                                  styles: {
                                    ...data.styles,
                                    buttons: { ...data.styles?.buttons, iconColor: e.target.value }
                                  }
                                })}
                                className="w-12 h-12 rounded border"
                              />
                              <Input
                                value={data.styles?.buttons?.iconColor || '#FFFFFF'}
                                onChange={(e) => updateData({
                                  styles: {
                                    ...data.styles,
                                    buttons: { ...data.styles?.buttons, iconColor: e.target.value }
                                  }
                                })}
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Shadow color</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="color"
                                value={data.styles?.buttons?.shadowColor || '#000000'}
                                onChange={(e) => updateData({
                                  styles: {
                                    ...data.styles,
                                    buttons: { ...data.styles?.buttons, shadowColor: e.target.value }
                                  }
                                })}
                                className="w-12 h-12 rounded border"
                              />
                              <Input
                                value={data.styles?.buttons?.shadowColor || '#000000'}
                                onChange={(e) => updateData({
                                  styles: {
                                    ...data.styles,
                                    buttons: { ...data.styles?.buttons, shadowColor: e.target.value }
                                  }
                                })}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium">Button Style</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {['filled', 'outline', 'drop-shadow-hard', 'drop-shadow-soft', 'glow-soft'].map((style) => (
                              <button
                                key={style}
                                onClick={() => updateData({
                                  styles: {
                                    ...data.styles,
                                    buttons: { ...data.styles?.buttons, style }
                                  }
                                })}
                                className={`border rounded-lg p-3 text-sm ${data.styles?.buttons?.style === style ? 'border-primary bg-primary/5' : 'border-gray-200'
                                  }`}
                              >
                                Button Type: {style}
                                <br />
                                Button Shape: {data.styles?.buttons?.shape || 'rounded'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium">Button Shape</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {['rounded-none', 'rounded', 'rounded-lg', 'rounded-full'].map((shape) => (
                              <button
                                key={shape}
                                onClick={() => updateData({
                                  styles: {
                                    ...data.styles,
                                    buttons: { ...data.styles?.buttons, shape }
                                  }
                                })}
                                className={`border rounded-lg p-3 text-sm ${data.styles?.buttons?.shape === shape ? 'border-primary bg-primary/5' : 'border-gray-200'
                                  }`}
                              >
                                Button Type: {data.styles?.buttons?.style || 'filled'}
                                <br />
                                Button Shape: {shape}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold">Social</h3>
                        <div className="space-y-3">
                          <div>
                            <Label>Style</Label>
                            <div className="flex gap-2 mt-2">
                              {['outline', 'filled'].map((style) => (
                                <button
                                  key={style}
                                  onClick={() => updateData({
                                    styles: {
                                      ...data.styles,
                                      socialIcons: { ...data.styles?.socialIcons, style }
                                    }
                                  })}
                                  className={`w-12 h-12 rounded-full border-2 ${data.styles?.socialIcons?.style === style ? 'border-primary' : 'border-gray-200'
                                    }`}
                                >
                                  {style === 'filled' && <Crown className="h-4 w-4 mx-auto text-yellow-500" />}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label>Icon color</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="color"
                                value={data.styles?.socialIcons?.iconColor || '#0F2A35'}
                                onChange={(e) => updateData({
                                  styles: {
                                    ...data.styles,
                                    socialIcons: { ...data.styles?.socialIcons, iconColor: e.target.value }
                                  }
                                })}
                                className="w-12 h-12 rounded border"
                              />
                              <Input
                                value={data.styles?.socialIcons?.iconColor || '#0F2A35'}
                                onChange={(e) => updateData({
                                  styles: {
                                    ...data.styles,
                                    socialIcons: { ...data.styles?.socialIcons, iconColor: e.target.value }
                                  }
                                })}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold">Custom Font Colors</h3>
                        <div className="space-y-3">
                          <div>
                            <Label>Font color</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="color"
                                value={data.styles?.fonts?.fontColor || '#0F2A35'}
                                onChange={(e) => updateData({
                                  styles: {
                                    ...data.styles,
                                    fonts: { ...data.styles?.fonts, fontColor: e.target.value }
                                  }
                                })}
                                className="w-12 h-12 rounded border"
                              />
                              <Input
                                value={data.styles?.fonts?.fontColor || '#0F2A35'}
                                onChange={(e) => updateData({
                                  styles: {
                                    ...data.styles,
                                    fonts: { ...data.styles?.fonts, fontColor: e.target.value }
                                  }
                                })}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium">Fonts</h4>
                          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                            {FONTS.map((font) => (
                              <button
                                key={font}
                                onClick={() => updateData({
                                  styles: {
                                    ...data.styles,
                                    fonts: { ...data.styles?.fonts, fontFamily: font }
                                  }
                                })}
                                className={`border rounded-lg p-3 text-left ${data.styles?.fonts?.fontFamily === font ? 'border-primary bg-primary/5' : 'border-gray-200'
                                  }`}
                              >
                                <div className="text-2xl font-bold mb-1" style={{ fontFamily: font }}>
                                  Aa
                                </div>
                                <div className="text-xs">{font}</div>
                                {['Montserrat', 'Quicksand'].includes(font) && (
                                  <Crown className="h-3 w-3 text-yellow-500 inline ml-1" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="py-6 space-y-6 mt-0">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2 mb-2">
                            Connect a custom domain name
                            <Crown className="h-4 w-4 text-yellow-500" />
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Look even more professional by connecting it to your own custom domain
                          </p>
                          <div className="space-y-2">
                            <Label>Your current link</Label>
                            <Input
                              value={publicUrl || `https://${brand.name?.toLowerCase().replace(/\s+/g, '')}.hi.link`}
                              type="url"
                              readOnly
                              className="bg-gray-50"
                            />
                          </div>
                          <Button variant="outline" className="mt-4" disabled>
                            <Crown className="h-4 w-4 mr-2" />
                            Connect a custom domain (Coming Soon)
                          </Button>
                        </div>

                        <div className="border-t pt-4">
                          <h3 className="font-semibold flex items-center gap-2 mb-2">
                            Meta Tags
                            <Crown className="h-4 w-4 text-yellow-500" />
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <Label>Title</Label>
                              <Input
                                value={data.settings?.metaTags?.title || ''}
                                onChange={(e) => updateData({
                                  settings: {
                                    ...data.settings,
                                    metaTags: { ...data.settings?.metaTags, title: e.target.value }
                                  }
                                })}
                                placeholder={data.profileTitle || brand.name || 'Greptilee'}
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={data.settings?.metaTags?.description || ''}
                                onChange={(e) => updateData({
                                  settings: {
                                    ...data.settings,
                                    metaTags: { ...data.settings?.metaTags, description: e.target.value }
                                  }
                                })}
                                placeholder="Make your vision come alive. Take the first step with LOGO.com."
                                rows={3}
                              />
                            </div>
                            <div>
                              <Label>Image URL</Label>
                              <Input
                                type="url"
                                value={data.settings?.metaTags?.image || ''}
                                onChange={(e) => updateData({
                                  settings: {
                                    ...data.settings,
                                    metaTags: { ...data.settings?.metaTags, image: e.target.value }
                                  }
                                })}
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                          <Button variant="outline" className="mt-4" disabled>
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade to customize meta tags (Coming Soon)
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </div>
              </div>
            </Tabs>
          </div>

          <div className="lg:col-span-1 sticky top-0">
            <MobilePreview data={{
              ...data,
              profileImage: profileImageUrl,
              blocks: data.blocks || [
                ...(data.links || []),
                ...(data.contentBlocks || [])
              ]
            }} />
          </div>
        </div>
      </div>

      <AddSectionModal
        open={addSectionModalOpen}
        onOpenChange={setAddSectionModalOpen}
        onSelectBlock={handleAddBlock}
      />

      <SelectLogoDialog
        open={selectLogoDialogOpen}
        onOpenChange={setSelectLogoDialogOpen}
        logos={brand.assets?.filter((a: any) => a.category === 'logo' && a.imageUrl) || []}
        selectedLogoUrl={profileImageUrl}
        onSelect={(logoUrl) => {
          updateData({ profileImage: logoUrl });
        }}
      />
    </div>
  );
}
