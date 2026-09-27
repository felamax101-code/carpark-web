"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { getAvailability, getLots, getSlotGrid } from "../lib/parking";
import { ParkingSlot,SlotStatus } from "../lib/types";
const STATUS_STYLES: Record<SlotStatus, string> = {
  AVAILABLE: "bg-green-100 text-green-800 border-green-300",
  OCCUPIED: "bg-red-100 text-red-800 border-red-300",
  RESERVED: "bg-amber-100 text-amber-800 border-amber-300",
  MAINTENANCE: "bg-slate-200 text-slate-600 border-slate-300",
};

function SlotCell({ slot }: { slot: ParkingSlot }) {
  return (
    <div
      className={`flex h-16 flex-col items-center justify-center rounded-md border text-sm font-medium ${STATUS_STYLES[slot.status]}`}
    >
      <span className="font-semibold">#{slot.slot_number}</span>
      <span className="text-xs">{slot.status}</span>
    </div>
  );
}

export default function AvailabilityPage() {
  return (
    <ProtectedRoute>
      <AvailabilityBoard />
    </ProtectedRoute>
  );
}

function AvailabilityBoard() {
  const { data: lots, isLoading: lotsLoading } = useQuery({
    queryKey: ["lots"],
    queryFn: getLots,
  });

  const [selectedLotId, setSelectedLotId] = useState<number | null>(null);
  const lotId = selectedLotId ?? lots?.[0]?.id ?? null;

  // Poll every 5s so the board stays live without a manual refresh —
  // this is the 'visual display' requirement from the client brief.
  const { data: availability } = useQuery({
    queryKey: ["availability", lotId],
    queryFn: () => getAvailability(lotId as number),
    enabled: lotId !== null,
    refetchInterval: 5000,
  });

  const { data: slots } = useQuery({
    queryKey: ["slot-grid", lotId],
    queryFn: () => getSlotGrid(lotId as number),
    enabled: lotId !== null,
    refetchInterval: 5000,
  });

  if (lotsLoading) {
    return <p className="text-slate-500">Loading lots...</p>;
  }

  if (!lots || lots.length === 0) {
    return <p className="text-slate-500">No parking lots configured yet.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Slot Availability</h1>
          {availability && (
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-green-700">{availability.available}</span> of{" "}
              {availability.total} slots free
            </p>
          )}
        </div>

        {lots.length > 1 && (
          <select
            value={lotId ?? ""}
            onChange={(e) => setSelectedLotId(Number(e.target.value))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {lots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
        {slots?.map((slot) => (
          <SlotCell key={slot.id} slot={slot} />
        ))}
      </div>

      {slots && slots.length === 0 && (
        <p className="text-slate-500">No slots have been configured for this lot yet.</p>
      )}
    </div>
  );
}