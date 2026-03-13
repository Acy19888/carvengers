/**
 * OCR service abstraction.
 * Currently returns mocked data.
 * Replace with real OCR API (Google Vision, Tesseract, etc.) later.
 */

export interface OcrResult {
  text: string;
  confidence: number;
  success: boolean;
}

export interface OdometerReadResult {
  kilometers: number;
  confidence: number;
  success: boolean;
  rawText: string;
}

/**
 * Mock OCR for odometer/tacho photos.
 * Simulates reading a km value from the photo.
 * In production: send image to Google Vision API or similar.
 */
export async function readOdometerFromImage(
  _imageUri: string,
): Promise<OdometerReadResult> {
  // Simulate processing delay
  await delay(1500);

  // Mock: return a realistic random km value
  const km = Math.floor(Math.random() * 150000) + 15000;
  return {
    kilometers: km,
    confidence: 0.87,
    success: true,
    rawText: `${km.toLocaleString("de-DE")} km`,
  };
}

/** Generic text OCR (for service book pages etc.) */
export async function extractTextFromImage(
  _imageUri: string,
): Promise<OcrResult> {
  await delay(1000);
  // TODO: integrate real OCR provider
  return {
    text: "Service durchgeführt am 15.03.2024 bei 72.450 km\nÖlwechsel, Bremsbeläge vorne erneuert",
    confidence: 0.72,
    success: true,
  };
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
