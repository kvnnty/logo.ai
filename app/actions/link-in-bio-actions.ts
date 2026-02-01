'use server';

import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { ensureDbConnected, Brand, LinkInBio } from '@/db';

const DEFAULT_STARTING_CREDITS = 10;
const PUBLISH_COST = 1; // Cost to publish link-in-bio

export async function saveLinkInBio(brandId: string, data: {
  profileImage?: string;
  profileTitle?: string;
  description?: string;
  blocks?: any[];
  links?: any[];
  contentBlocks?: any[];
  socialIcons?: any[];
  styles?: any;
  settings?: any;
}) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: 'Brand not found' };

    const doc = await LinkInBio.findOne({ brandId });
    const payload = {
      ...(doc ? doc.toObject() : {}),
      ...data,
      brandId: brand._id,
      userId: user.id,
      updatedAt: new Date(),
    };
    delete (payload as any)._id;

    if (doc) {
      doc.set(payload);
      await doc.save();
    } else {
      await LinkInBio.create({ ...payload, createdAt: new Date() });
    }
    return { success: true };
  } catch (error) {
    console.error('Save link-in-bio error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to save' };
  }
}

export async function getLinkInBio(brandId: string, isPublic: boolean = false) {
  try {
    await ensureDbConnected();

    if (isPublic) {
      const doc = await LinkInBio.findOne({ brandId }).lean() as any;
      if (!doc) return { success: false, error: 'Link-in-bio not found' };
      if (!doc.published) return { success: false, error: 'Link-in-bio not published' };
      return { success: true, data: toPlainData(doc) };
    }

    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: 'Brand not found' };

    const doc = await LinkInBio.findOne({ brandId }).lean() as any;
    const data = doc ? toPlainData(doc) : toPlainData({ blocks: [], links: [], contentBlocks: [] });
    const publicUrl = doc?.publicUrl ?? null;
    return { success: true, data, publicUrl };
  } catch (error) {
    console.error('Get link-in-bio error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to load' };
  }
}

function toPlainData(doc: any): {
  profileImage?: string;
  profileTitle?: string;
  description?: string;
  blocks: any[];
  links?: any[];
  contentBlocks?: any[];
  socialIcons?: any[];
  styles?: any;
  settings?: any;
  publicUrl?: string;
  published?: boolean;
  publishedAt?: any;
  updatedAt?: any;
} {
  return {
    profileImage: doc?.profileImage,
    profileTitle: doc?.profileTitle,
    description: doc?.description,
    blocks: doc?.blocks ?? [],
    links: doc?.links,
    contentBlocks: doc?.contentBlocks,
    socialIcons: doc?.socialIcons,
    styles: doc?.styles,
    settings: doc?.settings,
    publicUrl: doc?.publicUrl,
    published: doc?.published,
    publishedAt: doc?.publishedAt,
    updatedAt: doc?.updatedAt,
  };
}

export async function publishLinkInBio(brandId: string) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const clerk = await clerkClient();
    const rawRemaining = (user.unsafeMetadata as any)?.remaining;
    const currentRemaining = typeof rawRemaining === 'number' ? rawRemaining : DEFAULT_STARTING_CREDITS;

    if (currentRemaining < PUBLISH_COST) {
      return { success: false, error: 'Insufficient credits to publish' };
    }

    await ensureDbConnected();
    const brand = await Brand.findOne({ _id: brandId, userId: user.id });
    if (!brand) return { success: false, error: 'Brand not found' };

    const doc = await LinkInBio.findOne({ brandId });
    if (!doc) return { success: false, error: 'No link-in-bio data to publish' };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const publicUrl = `${baseUrl}/link/${brandId}`;
    const wasAlreadyPublished = (doc as any).published;

    doc.set({ publicUrl, published: true, publishedAt: new Date(), updatedAt: new Date() });
    await doc.save();

    if (!wasAlreadyPublished) {
      const newRemaining = currentRemaining - PUBLISH_COST;
      await clerk.users.updateUserMetadata(user.id, {
        unsafeMetadata: { ...(user.unsafeMetadata as any), remaining: newRemaining },
      });
    }

    return { success: true, publicUrl };
  } catch (error) {
    console.error('Publish link-in-bio error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to publish' };
  }
}
