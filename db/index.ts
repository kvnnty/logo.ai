import mongoose, { Schema, models, model, Document } from 'mongoose';
import { config } from 'dotenv';

// Load env from default locations (.env, .env.local)
config();

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

let isConnected = false;

export async function ensureDbConnected(): Promise<void> {
  if (isConnected) return;
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
}

export interface ILogo {
  _id?: any;
  brandId?: string;
  image_url: string;
  primary_color: string;
  background_color: string;
  username: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBrandAsset {
  category?: 'logo' | 'social_post' | 'social_story' | 'social_cover' | 'social_profile' | 'youtube_thumbnail' | 'marketing' | 'branding' | string;
  subType?: string;
  imageUrl?: string;
  prompt?: string;
  createdAt?: Date;
}

export interface IBrand {
  _id?: any;
  userId: string;
  name: string;
  description?: string;
  strategy?: any;
  identity?: any;
  blueprints?: any;
  assets: IBrandAsset[];
  createdAt?: Date;
  updatedAt?: Date;
}

const LogoSchema = new Schema(
  {
    brandId: { type: String },
    image_url: { type: String, required: true },
    primary_color: { type: String, required: true },
    background_color: { type: String, required: true },
    username: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);


const BrandSchema = new Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String }, // User input

    // Stage 1 Output: Brand Strategy & Identity
    strategy: { type: Schema.Types.Mixed }, // JSON: values, personality, audience
    identity: { type: Schema.Types.Mixed }, // JSON: colors, typography, style rules

    // Stage 2 Output: Asset Blueprints
    blueprints: { type: Schema.Types.Mixed }, // JSON: prompts for specific assets

    // Stage 3 Output: Generated Assets
    assets: [{
      category: String, // 'logo', 'social_post', etc.
      subType: String,
      imageUrl: String,
      prompt: String,
      createdAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

export const Logo = models.Logo || model<ILogo>('Logo', LogoSchema);
export const Brand = models.Brand || model<IBrand>('Brand', BrandSchema);

