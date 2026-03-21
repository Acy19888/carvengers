import { ServiceTier, MediaCategory } from "./models";

export interface CreateCaseInput {
  vin: string;
  make: string;
  model: string;
  year: string;
  mileage: string;
  notes?: string;
}

export interface MediaUploadItem {
  category: MediaCategory;
  uri: string;
  mimeType?: string;
}

export interface TierSelectionInput {
  tier: ServiceTier;
}
