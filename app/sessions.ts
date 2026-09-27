import { api } from "./api";
import { ExitResponse, ParkingSession } from "./lib/types";

export async function entryVehicle(plate_number: string, lot_id: number, gate_id: number) {
  const res = await api.post<ParkingSession>("/api/sessions/entry/", {
    plate_number,
    lot_id,
    gate_id,
  });
  return res.data;
}

export async function exitVehicle(plate_number: string): Promise<ExitResponse> {
  const res = await api.post<ExitResponse>("/api/sessions/exit/", { plate_number });
  return res.data;
}

export async function getActiveSessions(): Promise<ParkingSession[]> {
  const res = await api.get<ParkingSession[]>("/api/sessions/active/");
  return res.data;
}