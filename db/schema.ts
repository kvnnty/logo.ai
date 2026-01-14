export interface SelectLogo {
  _id: string;
  id: string;
  image_url: string;
  primary_color: string;
  background_color: string;
  username: string;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SelectBrand {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  strategy?: any;
  identity?: any;
  blueprints?: any;
  assets?: Array<{
    type: string;
    imageUrl: string;
    prompt: string;
    createdAt: Date | string;
  }>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

