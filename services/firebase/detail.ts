import { doc, getDoc } from "firebase/firestore";
import { db } from "./config";
import type { Vehicle, InspectionCase } from "../../types/models";

/** Fetch a single vehicle by ID */
export async function fetchVehicle(vehicleId: string): Promise<Vehicle | null> {
  const snap = await getDoc(doc(db, "vehicles", vehicleId));
  return snap.exists() ? (snap.data() as Vehicle) : null;
}

/** Fetch a single case by ID */
export async function fetchCase(caseId: string): Promise<InspectionCase | null> {
  const snap = await getDoc(doc(db, "cases", caseId));
  return snap.exists() ? (snap.data() as InspectionCase) : null;
}
