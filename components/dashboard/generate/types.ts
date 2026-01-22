export interface LogoVariation {
  id: string;
  label: string;
  subType: string;
  sceneData: any;
  imageUrl?: string;
}

export interface LogoConcept {
  name: string;
  rationale: string;
  fontFamily: string;
  colors: string[];
  iconUrl: string;
  variations: LogoVariation[];
  layoutStrategy?: string;
}

export type ModelType = "black-forest-labs/flux-schnell" | "black-forest-labs/flux-dev" | "dall-e-3";
export type SizeType = "256x256" | "512x512" | "1024x1024";
export type QualityType = "standard" | "hd";
