import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/logo-ai';

export async function ensureDbConnected() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI);
}

const BrandSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true, index: true },
  listedPublicly: { type: Boolean, default: true, index: true },
  slogan: String,
  description: String,
  industry: String,
  vibeKeywords: [String],
  contactInfo: {
    website: String,
    email: String,
    phone: String,
    address: String,
    mobile: String,
    facebook: String,
    instagram: String,
    twitter: String,
  },
  strategy: mongoose.Schema.Types.Mixed,
  identity: mongoose.Schema.Types.Mixed,
  status: { type: String, default: 'draft', index: true }, // draft | active
  pageViewCount: { type: Number, default: 0 },
  pageLastViewedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const LogoSchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
  userId: { type: String, required: true, index: true },
  image_url: String,
  isPrimary: { type: Boolean, default: false, index: true },
  subType: String, // 'primary_logo' | 'logo_variation' | 'candidate' | etc.
  category: { type: String, default: 'logo' },
  prompt: String,
  model: String, // AI model used (e.g. for candidates)
  layout: String,
  sceneData: mongoose.Schema.Types.Mixed,
  primary_color: String,
  background_color: String,
  username: String,
  meta: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const BrandUploadSchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
  userId: { type: String, required: true, index: true },
  imageUrl: { type: String, required: true },
  fileName: String,
  createdAt: { type: Date, default: Date.now },
});

const LinkInBioSchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  profileImage: String,
  profileTitle: String,
  description: String,
  blocks: [mongoose.Schema.Types.Mixed],
  links: [mongoose.Schema.Types.Mixed],
  contentBlocks: [mongoose.Schema.Types.Mixed],
  socialIcons: [mongoose.Schema.Types.Mixed],
  styles: {
    template: { type: String, default: 'minimal' },
    background: {
      style: { type: String, default: 'color' },
      color: { type: String, default: '#FFFFFF' },
      imageUrl: String,
    },
    buttons: {
      color: { type: String, default: '#0F2A35' },
      textColor: { type: String, default: '#FFFFFF' },
      iconColor: { type: String, default: '#FFFFFF' },
      shadowColor: { type: String, default: '#000000' },
      style: { type: String, default: 'filled' },
      shape: { type: String, default: 'rounded' },
    },
    socialIcons: {
      style: { type: String, default: 'outline' },
      iconColor: { type: String, default: '#0F2A35' },
    },
    fonts: {
      fontColor: { type: String, default: '#0F2A35' },
      fontFamily: { type: String, default: 'Inter' },
    },
  },
  settings: {
    customDomain: String,
    metaTags: {
      title: String,
      description: String,
      image: String,
    },
  },
  publicUrl: String,
  published: { type: Boolean, default: false },
  publishedAt: Date,
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
export const Logo = mongoose.models.Logo || mongoose.model('Logo', LogoSchema);
export const BrandUpload = mongoose.models.BrandUpload || mongoose.model('BrandUpload', BrandUploadSchema);
export const LinkInBio = mongoose.models.LinkInBio || mongoose.model('LinkInBio', LinkInBioSchema);

export interface IBrand {
  _id: any;
  userId: string;
  name: string;
  slug?: string;
  listedPublicly?: boolean;
  slogan?: string;
  description: string;
  industry?: string;
  vibeKeywords?: string[];
  contactInfo?: any;
  strategy: any;
  identity: any;
  status?: string;
  pageViewCount?: number;
  pageLastViewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILogo {
  _id: any;
  brandId: any;
  userId: string;
  image_url?: string;
  isPrimary?: boolean;
  subType?: string;
  category?: string;
  prompt?: string;
  model?: string;
  layout?: string;
  sceneData?: any;
  primary_color?: string;
  background_color?: string;
  username?: string;
  meta?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILinkInBio {
  _id: any;
  brandId: any;
  userId: string;
  profileImage?: string;
  profileTitle?: string;
  description?: string;
  blocks?: any[];
  links?: any[];
  contentBlocks?: any[];
  socialIcons?: any[];
  styles?: any;
  settings?: any;
  publicUrl?: string;
  published?: boolean;
  publishedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
}

export interface IBrandUpload {
  _id: any;
  brandId: any;
  userId: string;
  imageUrl: string;
  fileName?: string;
  createdAt: Date;
}

const TemplateSchema = new mongoose.Schema({
  category: { type: String, required: true, index: true },
  style: { type: String, default: 'modern', index: true },
  name: String,
  dimensions: {
    width: Number,
    height: Number
  },
  elements: [mongoose.Schema.Types.Mixed], // Flexible JSON structure for Fabric.js/Canvas
  previewImageUrl: String, // Preview image with transparent background
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const Template = mongoose.models.Template || mongoose.model('Template', TemplateSchema);

/** Canva-style design document: custom, AI, or template-based. One doc per design; pages[] for multipage. */
const DesignPageSchema = new mongoose.Schema({
  sceneData: mongoose.Schema.Types.Mixed, // { width, height, elements[] } - same as existing scene format
  name: String,
  thumbnailUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const DesignSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
  name: { type: String, default: 'Untitled design' },
  pages: { type: [DesignPageSchema], default: [] }, // multipage; backward compat: single page = pages[0]
  thumbnailUrl: String,
  favorite: { type: Boolean, default: false },
  source: { type: String, default: 'blank' }, // 'blank' | 'template' | 'ai' | 'import'
  templateId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Design = mongoose.models.Design || mongoose.model('Design', DesignSchema);

export interface IDesignPage {
  sceneData: any;
  name?: string;
  thumbnailUrl?: string;
  createdAt?: Date;
}

export interface IDesign {
  _id: any;
  userId: string;
  brandId: any;
  name: string;
  pages: IDesignPage[];
  thumbnailUrl?: string;
  favorite?: boolean;
  source?: string;
  templateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITemplate {
  _id: any;
  category: string;
  style: string;
  name: string;
  dimensions: { width: number; height: number };
  elements: any[];
  previewImageUrl?: string;
  isPublic: boolean;
  createdAt: Date;
}
