import { doc, setDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "./config";
import type { CaseMedia, MediaCategory, MediaType } from "../../types/models";
import { generateId } from "../../utils/helpers";

/**
 * Mock upload: saves the local image URI to Firestore.
 * When Firebase Storage (Blaze plan) is activated later,
 * replace this with the real upload implementation.
 */
export async function uploadCaseMedia(
  caseId: string,
  category: MediaCategory,
  uri: string,
  type: MediaType = "image",
  onProgress?: (pct: number) => void,
): Promise<CaseMedia> {
  // Simulate upload progress
  onProgress?.(30);
  await delay(300);
  onProgress?.(70);
  await delay(300);
  onProgress?.(100);

  const id = generateId("med");
  const media: CaseMedia = {
    id,
    caseId,
    type,
    category,
    url: uri, // local URI for now, will be a download URL later
    createdAt: Date.now(),
  };

  await setDoc(doc(db, "media", id), media);
  return media;
}

/** Fetch all media for a given case */
export async function fetchCaseMedia(caseId: string): Promise<CaseMedia[]> {
  const q = query(collection(db, "media"), where("caseId", "==", caseId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as CaseMedia);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
