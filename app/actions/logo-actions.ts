'use server';

import { currentUser } from "@clerk/nextjs/server";
import { ensureDbConnected, Brand } from '@/db';
import { renderSceneToPNG, renderSceneToSVG, renderSceneToPDF } from '@/lib/render/scene-renderer';

/**
 * Generate logo using API route (separates heavy AI calls from Server Actions)
 */
export async function generateLogoViaAPI(brandId: string, prompt: string, options?: {
  model?: string;
  size?: string;
  style?: string;
  primaryColor?: string;
  secondaryColor?: string;
}) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/generate/logo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brandId,
        prompt,
        ...options,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Generate logo error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate logo' };
  }
}

/**
 * Analyze logo structure and split into icon/wordmark
 */
export async function analyzeLogoStructure(brandId: string, logoImageUrl: string, brandName: string) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/generate/logo-structure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brandId,
        logoImageUrl,
        brandName,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Analyze logo structure error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to analyze logo' };
  }
}

/**
 * Save logo with structure information
 */
export async function saveLogoWithStructure(
  brandId: string,
  logoData: {
    imageUrl: string;
    iconUrl?: string;
    wordmarkUrl?: string;
    layout?: 'horizontal' | 'vertical' | 'stacked' | 'icon-only' | 'wordmark-only';
    subType?: string;
  }
) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: 'Brand not found' };

    // Save primary logo
    const primaryLogoAsset = {
      category: 'logo',
      subType: logoData.subType || 'primary_logo',
      imageUrl: logoData.imageUrl,
      sceneData: {
        width: 1024,
        height: 1024,
        elements: [
          { type: 'image', src: logoData.imageUrl, x: 512, y: 512, width: 800, height: 800, align: 'center' }
        ]
      },
      layout: logoData.layout || 'horizontal',
      createdAt: new Date(),
    };

    brand.assets.push(primaryLogoAsset as any);

    // Save icon if provided
    if (logoData.iconUrl) {
      brand.assets.push({
        category: 'logo',
        subType: 'logo_icon',
        imageUrl: logoData.iconUrl,
        sceneData: {
          width: 1024,
          height: 1024,
          elements: [
            { type: 'image', src: logoData.iconUrl, x: 512, y: 512, width: 800, height: 800, align: 'center' }
          ]
        },
        layout: 'icon-only',
        createdAt: new Date(),
      } as any);
    }

    // Save wordmark if provided
    if (logoData.wordmarkUrl) {
      brand.assets.push({
        category: 'logo',
        subType: 'logo_wordmark',
        imageUrl: logoData.wordmarkUrl,
        sceneData: {
          width: 1024,
          height: 300,
          elements: [
            { type: 'image', src: logoData.wordmarkUrl, x: 512, y: 150, width: 900, height: 200, align: 'center' }
          ]
        },
        layout: 'wordmark-only',
        createdAt: new Date(),
      } as any);
    }

    await brand.save();
    return { success: true };
  } catch (error) {
    console.error('Save logo error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to save logo' };
  }
}

/**
 * Download logo component separately
 */
export async function downloadLogoComponent(brandId: string, assetId: string, format: 'png' | 'svg' | 'pdf' = 'png') {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: 'Brand not found' };

    const asset = brand.assets.id(assetId);
    if (!asset || !asset.sceneData) {
      return { success: false, error: 'Asset not found or has no scene data' };
    }

    // Render scene to requested format
    let buffer: Buffer;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'png':
        buffer = await renderSceneToPNG(asset.sceneData, 2);
        mimeType = 'image/png';
        extension = 'png';
        break;
      case 'svg':
        const svgString = renderSceneToSVG(asset.sceneData);
        buffer = Buffer.from(svgString);
        mimeType = 'image/svg+xml';
        extension = 'svg';
        break;
      case 'pdf':
        buffer = await renderSceneToPDF(asset.sceneData);
        mimeType = 'application/pdf';
        extension = 'pdf';
        break;
    }

    const base64 = buffer.toString('base64');
    const fileName = `${brand.name}-${asset.subType}.${extension}`;

    return {
      success: true,
      data: base64,
      fileName,
      mimeType,
    };
  } catch (error) {
    console.error('Download logo component error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to download' };
  }
}
