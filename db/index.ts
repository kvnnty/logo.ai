import mongoose, { Schema, models, model } from 'mongoose';
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

const LogoSchema = new Schema(
  {
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
      type: { type: String }, // 'logo', 'social_post', 'business_card'
      imageUrl: String,
      prompt: String,
      createdAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

export const Logo = models.Logo || model('Logo', LogoSchema);
export const Brand = models.Brand || model('Brand', BrandSchema);

