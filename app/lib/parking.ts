import { api } from "../api";
import { Gate, ParkingLot, ParkingSlot, Tariff } from "./types";

export async function getLots(): Promise<ParkingLot[]> {
  const res = await api.get<ParkingLot[]>("/api/parking/lots/");
  return res.data;
}

export async function getAvailability(
  lotId: number
): Promise<{ total: number; available: number }> {
  const res = await api.get(`/api/parking/lots/${lotId}/availability/`);
  return res.data;
}

export async function getSlotGrid(lotId: number): Promise<ParkingSlot[]> {
  const res = await api.get<ParkingSlot[]>(`/api/parking/lots/${lotId}/slots/`);
  return res.data;
}

export async function getGates(): Promise<Gate[]> {
  const res = await api.get<Gate[]>("/api/parking/gates/");
  return res.data;
}

export async function getTariffs(): Promise<Tariff[]> {
  const res = await api.get<Tariff[]>("/api/parking/tariffs/");
  return res.data;
}

export async function createSlot(lot: number, slot_number: number, slot_type = "STANDARD") {
  const res = await api.post<ParkingSlot>("/api/parking/slots/", { lot, slot_number, slot_type });
  return res.data;
}

export async function deleteSlot(id: number) {
  await api.delete(`/api/parking/slots/${id}/`);
}

export async function createTariff(
  lot: number,
  min_minutes: number,
  max_minutes: number | null,
  amount: number
) {
  const res = await api.post<Tariff>("/api/parking/tariffs/", {
    lot,
    min_minutes,
    max_minutes,
    amount,
  });
  return res.data;
}

export async function deleteTariff(id: number) {
  await api.delete(`/api/parking/tariffs/${id}/`);
}