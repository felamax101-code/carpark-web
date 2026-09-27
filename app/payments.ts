import { api } from "./api";
import { Payment } from "./lib/types";

export async function payForSession(paymentId: number, gateId: number, method = "MOCK") {
  const res = await api.post<{ detail: string; payment: Payment }>(
    `/api/payments/${paymentId}/pay/`,
    { gate_id: gateId, method }
  );
  return res.data;
}