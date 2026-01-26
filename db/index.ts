import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/logo-ai';

export async function ensureDbConnected() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI);
}

const ImageAssetSchema = new mongoose.Schema({
  category: String,
  subType: String,
  imageUrl: String,
  prompt: String,
  sceneData: mongoose.Schema.Types.Mixed,
  conceptId: String,
  conceptColors: [String],
  layout: String, // horizontal, vertical, stacked, icon-only, wordmark-only
  createdAt: { type: Date, default: Date.now },
});

const LogoCandidateSchema = new mongoose.Schema({
  candidateId: { type: String, index: true },
  imageUrl: String,
  prompt: String,
  model: String,
  style: String,
  // Optional: later we can store palette/font suggestions here
  meta: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

const BrandSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
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
  assets: [ImageAssetSchema],
  logoCandidates: [LogoCandidateSchema],
  activeLogoCandidateId: String,
  linkInBio: {
    // Profile Information
    profileImage: String,
    profileTitle: String,
    description: String,
    // Content Blocks
    blocks: [mongoose.Schema.Types.Mixed],
    socialIcons: [mongoose.Schema.Types.Mixed],
    // Styles
    styles: {
      template: { type: String, default: 'minimal' }, // minimal, standout
      background: {
        style: { type: String, default: 'color' }, // color, image
        color: { type: String, default: '#FFFFFF' },
        imageUrl: String,
      },
      buttons: {
        color: { type: String, default: '#0F2A35' },
        textColor: { type: String, default: '#FFFFFF' },
        iconColor: { type: String, default: '#FFFFFF' },
        shadowColor: { type: String, default: '#000000' },
        style: { type: String, default: 'filled' }, // filled, outline, drop-shadow-hard, drop-shadow-soft, glow-soft
        shape: { type: String, default: 'rounded' }, // rounded, rounded-none, rounded-lg, rounded-full
      },
      socialIcons: {
        style: { type: String, default: 'outline' }, // outline, filled, etc.
        iconColor: { type: String, default: '#0F2A35' },
      },
      fonts: {
        fontColor: { type: String, default: '#0F2A35' },
        fontFamily: { type: String, default: 'Inter' },
      },
    },
    // Settings
    settings: {
      customDomain: String,
      metaTags: {
        title: String,
        description: String,
        image: String,
      },
    },
    // Publishing
    publicUrl: String,
    published: { type: Boolean, default: false },
    publishedAt: Date,
    updatedAt: { type: Date, default: Date.now },
  },
  status: { type: String, default: 'draft', index: true }, // draft | active
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const LogoSchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  image_url: String,
  primary_color: String,
  background_color: String,
  username: String,
  userId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
export const Logo = mongoose.models.Logo || mongoose.model('Logo', LogoSchema);

export interface IBrandAsset {
  category: string;
  subType: string;
  imageUrl: string;
  prompt: string;
  sceneData?: any;
  conceptId?: string;
  conceptColors?: string[];
  createdAt: Date;
}

export interface IBrand {
  _id: any;
  userId: string;
  name: string;
  slogan?: string;
  description: string;
  industry?: string;
  vibeKeywords?: string[];
  contactInfo?: any;
  strategy: any;
  identity: any;
  assets: IBrandAsset[];
  logoCandidates?: Array<{
    candidateId: string;
    imageUrl: string;
    prompt: string;
    model?: string;
    style?: string;
    meta?: any;
    createdAt: Date;
  }>;
  activeLogoCandidateId?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILogo {
  _id: any;
  brandId?: any;
  image_url: string;
  primary_color: string;
  background_color: string;
  username: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
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
