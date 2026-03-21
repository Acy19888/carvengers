/**
 * Lightweight capture quality feedback.
 * In production: replace with TensorFlow.js or on-device model.
 * For MVP: uses image metadata heuristics.
 */

export interface CaptureQuality {
  isAcceptable: boolean;
  score: number; // 0-100
  issues: CaptureIssue[];
}

export interface CaptureIssue {
  type: "too_dark" | "too_bright" | "blurry" | "not_centered" | "too_far" | "too_close";
  label: string;
  severity: "warning" | "error";
}

const ISSUE_LABELS: Record<string, string> = {
  too_dark: "Zu dunkel — mehr Licht benötigt",
  too_bright: "Zu hell — Blendung vermeiden",
  blurry: "Unscharf — Handy ruhig halten",
  not_centered: "Objekt nicht zentriert",
  too_far: "Zu weit entfernt — näher rangehen",
  too_close: "Zu nah dran — etwas zurückgehen",
};

/**
 * Analyze capture quality from image dimensions and metadata.
 * This is a mock/heuristic implementation.
 * 
 * In production, use:
 * - TensorFlow.js for on-device analysis
 * - Image brightness from pixel sampling
 * - Laplacian variance for blur detection
 * - Object detection for centering
 */
export function analyzeCaptureQuality(
  imageWidth: number,
  imageHeight: number,
  fileSize?: number,
  category?: string,
): CaptureQuality {
  const issues: CaptureIssue[] = [];
  let score = 100;

  // Check resolution (minimum 720p)
  if (imageWidth < 720 || imageHeight < 720) {
    score -= 30;
    issues.push({ type: "too_far", label: ISSUE_LABELS.too_far, severity: "warning" });
  }

  // Check file size as proxy for image quality
  if (fileSize) {
    const sizeKb = fileSize / 1024;

    // Very small file = likely dark/blurry
    if (sizeKb < 50) {
      score -= 40;
      issues.push({ type: "too_dark", label: ISSUE_LABELS.too_dark, severity: "error" });
    }
    // Small file for resolution = might be blurry
    else if (sizeKb < 150 && imageWidth > 1000) {
      score -= 20;
      issues.push({ type: "blurry", label: ISSUE_LABELS.blurry, severity: "warning" });
    }
    // Very large = might be too bright/overexposed
    else if (sizeKb > 8000) {
      score -= 10;
      issues.push({ type: "too_bright", label: ISSUE_LABELS.too_bright, severity: "warning" });
    }
  }

  // Category-specific checks
  if (category === "odometer" && imageWidth > imageHeight * 2) {
    score -= 15;
    issues.push({ type: "not_centered", label: "Tacho nicht zentriert — näher fotografieren", severity: "warning" });
  }

  if (category === "tire" || category?.startsWith("tire_")) {
    if (imageWidth < 1000 && imageHeight < 1000) {
      score -= 20;
      issues.push({ type: "too_far", label: "Reifen nicht vollständig sichtbar", severity: "warning" });
    }
  }

  score = Math.max(0, Math.min(100, score));

  return {
    isAcceptable: score >= 50 && !issues.some(i => i.severity === "error"),
    score,
    issues,
  };
}

/**
 * Get a feedback message for the user based on quality analysis.
 */
export function getQualityFeedback(quality: CaptureQuality): string | null {
  if (quality.isAcceptable && quality.issues.length === 0) return null;
  if (quality.issues.length === 0) return null;

  // Return the most severe issue
  const error = quality.issues.find(i => i.severity === "error");
  if (error) return error.label;

  return quality.issues[0]?.label ?? null;
}
