import { doc, setDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "./config";
import type { Finding } from "../../types/models";
import { generateId } from "../../utils/helpers";

/** Fetch findings for a case */
export async function fetchFindings(caseId: string): Promise<Finding[]> {
  const q = query(collection(db, "findings"), where("caseId", "==", caseId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Finding);
}

/** Generate mock findings for demo purposes */
export async function generateMockFindings(caseId: string): Promise<Finding[]> {
  const mockFindings: Omit<Finding, "id" | "createdAt">[] = [
    {
      caseId,
      source: "ai",
      category: "exterior",
      label: "Leichter Kratzer an der Stoßstange",
      severity: "low",
      notes: "Oberflächlich, keine Roststelle",
      confidence: 0.82,
    },
    {
      caseId,
      source: "ai",
      category: "tire",
      label: "Reifenprofil prüfen",
      severity: "medium",
      notes: "Profiltiefe scheint niedrig, manuelle Prüfung empfohlen",
      confidence: 0.65,
    },
    {
      caseId,
      source: "ai",
      category: "document",
      label: "Kilometerstand plausibel",
      severity: "low",
      notes: "Kilometerstand passt zum Fahrzeugalter",
      confidence: 0.91,
    },
  ];

  const results: Finding[] = [];
  for (const f of mockFindings) {
    const id = generateId("fnd");
    const finding: Finding = { ...f, id, createdAt: Date.now() };
    await setDoc(doc(db, "findings", id), finding);
    results.push(finding);
  }
  return results;
}
