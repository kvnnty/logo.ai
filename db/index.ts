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
  createdAt: { type: Date, default: Date.now },
});

const BrandSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: String,
  industry: String,
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
  description: string;
  industry?: string;
  contactInfo?: any;
  strategy: any;
  identity: any;
  assets: IBrandAsset[];
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
