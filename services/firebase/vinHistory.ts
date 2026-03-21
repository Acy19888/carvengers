import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "./config";
import type { Vehicle, InspectionCase } from "../../types/models";

/** Find all vehicles with the same VIN */
export async function fetchVehiclesByVin(vin: string): Promise<Vehicle[]> {
  const q = query(collection(db, "vehicles"), where("vin", "==", vin));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Vehicle);
}

/** Find all cases for vehicles with this VIN */
export async function fetchVinHistory(vin: string): Promise<InspectionCase[]> {
  // First get all vehicle IDs with this VIN
  const vehicles = await fetchVehiclesByVin(vin);
  if (vehicles.length === 0) return [];

  const vehicleIds = vehicles.map((v) => v.id);

  // Firestore 'in' queries limited to 30, but for MVP this is fine
  const q = query(
    collection(db, "cases"),
    where("vehicleId", "in", vehicleIds.slice(0, 30)),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as InspectionCase)
    .sort((a, b) => b.createdAt - a.createdAt);
}
