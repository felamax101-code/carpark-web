// Types mirror the DRF serializers exactly, field for field, so the
// shapes returned by the backend need no transformation on the way in.

export type Role = "ADMIN" | "GATE_OPERATOR" | "DRIVER";

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface ParkingLot {
  id: number;
  name: string;
  location: string;
  total_slots: number;
  available_slots: number;
}

export type SlotStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";

export interface ParkingSlot {
  id: number;
  lot: number;
  slot_number: number;
  status: SlotStatus;
  slot_type: string;
}

export type GateType = "ENTRY" | "EXIT";
export type GateStatus = "CLOSED" | "OPENING" | "OPEN" | "CLOSING";

export interface Gate {
  id: number;
  lot: number;
  gate_number: number;
  gate_type: GateType;
  status: GateStatus;
}

export interface Tariff {
  id: number;
  lot: number;
  min_minutes: number;
  max_minutes: number | null;
  amount: string; // DRF DecimalField serializes as a string
  effective_from: string;
}

export type SessionStatus = "ACTIVE" | "PENDING_PAYMENT" | "COMPLETED";

export interface ParkingSession {
  id: number;
  plate_number: string;
  slot_number: number;
  entry_time: string;
  exit_time: string | null;
  status: SessionStatus;
  amount_due: string | null;
  amount_paid: string | null;
}

export interface ExitResponse {
  session: ParkingSession;
  duration_minutes: number;
  amount_due: string;
  payment_id: number;
}

export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export interface Payment {
  id: number;
  session: number;
  amount: string;
  method: string;
  status: PaymentStatus;
  reference: string;
  paid_at: string | null;
}