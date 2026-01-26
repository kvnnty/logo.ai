'use server';

import { currentUser } from "@clerk/nextjs/server";
import { ensureDbConnected, Brand, Template } from '@/db';
import { hydrateTemplate } from '@/lib/templates/brand-kit-templates';

/**
 * Get templates for a category with preview images
 */
export async function getTemplates(category: string) {
  try {
    await ensureDbConnected();
    const templates = await Template.find({ category, isPublic: true })
      .sort({ createdAt: 1 })
      .limit(5)
      .lean();
    
    return { 
      success: true, 
      templates: templates.map((t: any) => ({
        _id: t._id.toString(),
        category: t.category,
        name: t.name,
        previewImageUrl: t.previewImageUrl,
        dimensions: t.dimensions,
      }))
    };
  } catch (error) {
    console.error('Get templates error:', error);
    return { success: false, error: 'Failed to fetch templates', templates: [] };
  }
}

/**
 * Generate template with images
 */
export async function generateTemplateWithImages(
  brandId: string,
  category: string,
  subType: string,
  templateIndex: number = 0,
  imageTypes?: Array<'people' | 'products' | 'environments' | 'abstract'>
) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: 'Brand not found' };

    // Fetch template
    const templates = await Template.find({ category }).sort({ createdAt: 1 });
    const selectedTemplate = templates[templateIndex % templates.length];
    if (!selectedTemplate) {
      return { success: false, error: `No template found for ${category}` };
    }

    // Generate images if requested
    const images: Record<string, string> = {};
    if (imageTypes && imageTypes.length > 0) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      for (const imageType of imageTypes) {
        try {
          const response = await fetch(`${baseUrl}/api/generate/template-images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              brandId,
              category,
              templateType: subType,
              imageType,
              style: brand.identity?.visual_style || 'modern',
            }),
          });

          const result = await response.json();
          if (result.success) {
            images[imageType] = result.imageUrl;
          }
        } catch (error) {
          console.error(`Failed to generate ${imageType} image:`, error);
        }
      }
    }

    // Hydrate template
    const primaryLogo = brand.assets?.find((a: any) => a.subType === 'primary_logo');
    const sceneData = hydrateTemplate(selectedTemplate, brand, primaryLogo ? { imageUrl: primaryLogo.imageUrl } : null);

    // Add images to scene data if available
    if (Object.keys(images).length > 0) {
      // Find placeholder image elements and replace with generated images
      sceneData.elements = sceneData.elements.map((el: any) => {
        if (el.type === 'image' && el.src?.includes('placeholder')) {
          // Replace with first available image
          const imageUrl = Object.values(images)[0] as string;
          if (imageUrl) {
            return { ...el, src: imageUrl };
          }
        }
        return el;
      });

      // Add additional image elements if needed
      Object.entries(images).forEach(([type, url], index) => {
        if (index > 0) { // First image already replaced placeholder
          sceneData.elements.push({
            type: 'image',
            src: url,
            x: 100 + (index * 200),
            y: 100,
            width: 300,
            height: 300,
            draggable: true,
          });
        }
      });
    }

    // Save asset
    brand.assets.push({
      category,
      subType,
      sceneData,
      createdAt: new Date(),
    } as any);

    await brand.save();
    return { success: true, sceneData };
  } catch (error) {
    console.error('Generate template with images error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate template' };
  }
}
