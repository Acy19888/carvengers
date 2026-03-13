/**
 * VIN Decoder service abstraction.
 *
 * In the future, this will call an external API to decode
 * make, model, year, and engine from the VIN.
 *
 * Options for real implementation:
 * - NHTSA vPIC API (free, US-focused)
 * - vindecoder.eu (paid, EU-focused, good for German market)
 * - auto.dev API
 * - Custom database mapping
 */

export interface VinDecodeResult {
  make: string;
  model: string;
  year: number;
  variant?: string;
  bodyType?: string;
  fuelType?: string;
  success: boolean;
  error?: string;
}

/** Placeholder – returns empty result for now */
export async function decodeVin(_vin: string): Promise<VinDecodeResult> {
  // TODO: Integrate real VIN decoder API
  // Example: const res = await fetch(`https://api.vindecoder.eu/.../${vin}`)
  return {
    make: "",
    model: "",
    year: 0,
    success: false,
    error: "VIN-Decoder noch nicht aktiviert",
  };
}
