import { z } from "zod";

export const createCaseSchema = z.object({
  vin: z
    .string()
    .min(11, "FIN muss mindestens 11 Zeichen haben")
    .max(17, "FIN darf maximal 17 Zeichen haben"),
  make: z.string().min(1, "Bitte Marke auswählen"),
  model: z.string().min(1, "Bitte Modell auswählen"),
  variant: z.string().optional(),
  year: z
    .string()
    .min(1, "Bitte Baujahr auswählen"),
  mileage: z
    .string()
    .optional()
    .refine((v) => {
      if (!v || v === "") return true; // optional
      const n = parseInt(v.replace(/\./g, ""), 10);
      return !isNaN(n) && n >= 0 && n <= 500000;
    }, "Bitte gültigen Kilometerstand eingeben (0 – 500.000 km)"),
  notes: z.string().optional(),
});

export type CreateCaseFormData = z.infer<typeof createCaseSchema>;
