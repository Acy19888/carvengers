// ── User ──────────────────────────────────────────────
export type UserRole = "customer" | "inspector" | "admin";

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  createdAt: number;
  // Profile fields (optional, filled later by user)
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  photoUrl?: string;
  language?: "de" | "en";
}

// ── Vehicle ───────────────────────────────────────────
export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  createdAt: number;
  createdBy: string;
}

// ── Case ──────────────────────────────────────────────
export type CaseStatus = "draft" | "submitted" | "reviewing" | "completed";
export type ServiceTier = "ai_only" | "video" | "onsite" | "workshop";
export type ScanMode = "quick_seller" | "full_ai" | "expert";

export interface InspectionCase {
  id: string;
  vehicleId: string;
  createdBy: string;
  status: CaseStatus;
  serviceTier: ServiceTier;
  scanMode?: ScanMode;
  sellerLink?: string;
  bookedDate?: string;
  bookedTime?: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

// ── Media ─────────────────────────────────────────────
export type MediaType = "image" | "document";

export type MediaCategory =
  | "front"
  | "rear"
  | "left"
  | "right"
  | "tire"
  | "interior"
  | "odometer"
  | "service_book";

export interface CaseMedia {
  id: string;
  caseId: string;
  type: MediaType;
  category: MediaCategory;
  url: string;
  createdAt: number;
}

// ── Findings ──────────────────────────────────────────
export type FindingSource = "ai" | "user_confirmed" | "inspector";
export type FindingCategory = "exterior" | "tire" | "interior" | "document";
export type Severity = "low" | "medium" | "high";

export interface Finding {
  id: string;
  caseId: string;
  source: FindingSource;
  category: FindingCategory;
  label: string;
  severity: Severity;
  notes: string;
  confidence: number;
  createdAt: number;
}

// ── Report ────────────────────────────────────────────
export type ReportStatus = "draft" | "generated";

export interface Report {
  id: string;
  caseId: string;
  vehicleId: string;
  vin: string;
  status: ReportStatus;
  summary: string;
  generatedAt: number;
  validUntil: number;
}
