import { create } from "zustand";
import type { InspectionCase, ServiceTier } from "../types/models";
import {
  createVehicle,
  createCase,
  fetchUserCases,
} from "../services/firebase/cases";

interface CaseState {
  cases: InspectionCase[];
  loading: boolean;
  error: string | null;

  loadCases: (userId: string) => Promise<void>;
  submitNewCase: (input: {
    vin: string;
    make: string;
    model: string;
    year: number;
    mileage: number;
    notes: string;
    serviceTier: ServiceTier;
    userId: string;
  }) => Promise<InspectionCase>;
  clearError: () => void;
}

export const useCaseStore = create<CaseState>((set, get) => ({
  cases: [],
  loading: false,
  error: null,

  loadCases: async (userId) => {
    set({ loading: true, error: null });
    try {
      const cases = await fetchUserCases(userId);
      set({ cases, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  submitNewCase: async (input) => {
    set({ loading: true, error: null });
    try {
      const vehicle = await createVehicle({
        vin: input.vin,
        make: input.make,
        model: input.model,
        year: input.year,
        mileage: input.mileage,
        createdBy: input.userId,
      });

      const newCase = await createCase(
        vehicle.id,
        input.userId,
        input.serviceTier,
        input.notes,
      );

      set({ cases: [newCase, ...get().cases], loading: false });
      return newCase;
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  clearError: () => set({ error: null }),
}));
