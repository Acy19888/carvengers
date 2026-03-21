import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { generateId } from "../../utils/helpers";

export interface SellerLink {
  id: string;
  caseId: string;
  createdBy: string;
  url: string;
  expiresAt: number;
  status: "pending" | "started" | "completed" | "expired";
  createdAt: number;
}

/** Generate a unique seller inspection link */
export async function createSellerLink(
  caseId: string,
  createdBy: string,
): Promise<SellerLink> {
  const id = generateId("sl");
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

  // In production: use a real short URL service or custom domain
  const url = `https://carvengers.com/scan/${id}`;

  const link: SellerLink = {
    id,
    caseId,
    createdBy,
    url,
    expiresAt,
    status: "pending",
    createdAt: Date.now(),
  };

  await setDoc(doc(db, "sellerLinks", id), link);
  return link;
}

/** Fetch a seller link by ID */
export async function fetchSellerLink(linkId: string): Promise<SellerLink | null> {
  const snap = await getDoc(doc(db, "sellerLinks", linkId));
  return snap.exists() ? (snap.data() as SellerLink) : null;
}
