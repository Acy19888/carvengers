import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config";
import type { Vehicle, InspectionCase, ServiceTier } from "../../types/models";
import { generateId } from "../../utils/helpers";

/** Create a vehicle document and return it */
export async function createVehicle(
  data: Omit<Vehicle, "id" | "createdAt">,
): Promise<Vehicle> {
  const id = generateId("veh");
  const vehicle: Vehicle = {
    ...data,
    id,
    createdAt: Date.now(),
  };
  await setDoc(doc(db, "vehicles", id), vehicle);
  return vehicle;
}

/** Create an inspection case linked to a vehicle */
export async function createCase(
  vehicleId: string,
  createdBy: string,
  serviceTier: ServiceTier,
  notes: string,
): Promise<InspectionCase> {
  const id = generateId("case");
  const now = Date.now();
  const inspectionCase: InspectionCase = {
    id,
    vehicleId,
    createdBy,
    status: "draft",
    serviceTier,
    notes,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, "cases", id), inspectionCase);
  return inspectionCase;
}

/** Fetch all cases for a given user, ordered by creation date */
export async function fetchUserCases(userId: string): Promise<InspectionCase[]> {
  const q = query(
    collection(db, "cases"),
    where("createdBy", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as InspectionCase);
}

/** Update case status */
export async function updateCaseStatus(
  caseId: string,
  status: InspectionCase["status"],
): Promise<void> {
  await updateDoc(doc(db, "cases", caseId), {
    status,
    updatedAt: Date.now(),
  });
}
