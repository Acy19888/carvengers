/**
 * Exterior Damage Detection Service
 * MVP: Mock detection with realistic outputs
 * Production: Replace with YOLOv12 API calls
 */

export type DamageType = "scratch" | "dent" | "rust" | "paint_damage" | "cracked_light" | "windshield_chip" | "repaint_indicator" | "panel_misalignment";

export type DamageLocation = "front_bumper" | "rear_bumper" | "hood" | "trunk" | "roof"
  | "left_fender" | "right_fender" | "left_door" | "right_door"
  | "left_quarter" | "right_quarter" | "windshield" | "headlight_left" | "headlight_right"
  | "taillight_left" | "taillight_right";

export interface DamageDetection {
  id: string;
  type: DamageType;
  location: DamageLocation;
  severity: "low" | "medium" | "high";
  confidence: number;
  estimatedRepairCost: number;
  description: string;
}

const DAMAGE_LABELS: Record<DamageType, string> = {
  scratch: "Kratzer",
  dent: "Delle",
  rust: "Rost",
  paint_damage: "Lackschaden",
  cracked_light: "Rissiger Scheinwerfer",
  windshield_chip: "Steinschlag Windschutzscheibe",
  repaint_indicator: "Nachlackierung erkannt",
  panel_misalignment: "Spaltmaß-Abweichung",
};

const LOCATION_LABELS: Record<DamageLocation, string> = {
  front_bumper: "Frontstoßstange",
  rear_bumper: "Heckstoßstange",
  hood: "Motorhaube",
  trunk: "Kofferraum",
  roof: "Dach",
  left_fender: "Linker Kotflügel",
  right_fender: "Rechter Kotflügel",
  left_door: "Linke Tür",
  right_door: "Rechte Tür",
  left_quarter: "Linkes Seitenteil",
  right_quarter: "Rechtes Seitenteil",
  windshield: "Windschutzscheibe",
  headlight_left: "Scheinwerfer links",
  headlight_right: "Scheinwerfer rechts",
  taillight_left: "Rücklicht links",
  taillight_right: "Rücklicht rechts",
};

const REPAIR_COSTS: Record<DamageType, { low: number; medium: number; high: number }> = {
  scratch: { low: 80, medium: 250, high: 600 },
  dent: { low: 120, medium: 400, high: 1200 },
  rust: { low: 200, medium: 800, high: 2500 },
  paint_damage: { low: 150, medium: 500, high: 1500 },
  cracked_light: { low: 100, medium: 300, high: 800 },
  windshield_chip: { low: 50, medium: 150, high: 500 },
  repaint_indicator: { low: 0, medium: 0, high: 0 },
  panel_misalignment: { low: 0, medium: 300, high: 2000 },
};

/**
 * Analyze images for damage. Mock for MVP.
 * In production: send to YOLOv12 API endpoint.
 */
export async function detectDamage(imageUris: string[]): Promise<DamageDetection[]> {
  await delay(1500);

  // Generate 2-5 mock detections
  const count = 2 + Math.floor(Math.random() * 4);
  const detections: DamageDetection[] = [];

  const types: DamageType[] = ["scratch", "dent", "rust", "paint_damage", "cracked_light", "windshield_chip"];
  const locations: DamageLocation[] = ["front_bumper", "rear_bumper", "left_door", "right_door", "left_fender", "hood"];
  const severities: ("low" | "medium" | "high")[] = ["low", "medium", "high"];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const severity = severities[Math.floor(Math.random() * 3)];
    const confidence = 0.65 + Math.random() * 0.3;

    detections.push({
      id: `dmg_${Date.now()}_${i}`,
      type,
      location,
      severity,
      confidence: Math.round(confidence * 100) / 100,
      estimatedRepairCost: REPAIR_COSTS[type][severity],
      description: `${DAMAGE_LABELS[type]} an ${LOCATION_LABELS[location]}`,
    });
  }

  return detections;
}

export function getTotalRepairCost(detections: DamageDetection[]): number {
  return detections.reduce((sum, d) => sum + d.estimatedRepairCost, 0);
}

export { DAMAGE_LABELS, LOCATION_LABELS };

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
