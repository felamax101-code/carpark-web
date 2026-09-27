"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import { ProtectedRoute } from "../components/ProtectedRoute";
import {
  createSlot,
  createTariff,
  deleteSlot,
  deleteTariff,
  getLots,
  getSlotGrid,
  getTariffs,
} from "../lib/parking";

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminPanel />
    </ProtectedRoute>
  );
}

function AdminPanel() {
  const { data: lots } = useQuery({ queryKey: ["lots"], queryFn: getLots });
  const [lotId, setLotId] = useState<number | null>(null);
  const activeLotId = lotId ?? lots?.[0]?.id ?? null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Admin</h1>
        <p className="text-sm text-slate-500">
          Add slots and edit tariff bands here — the entry/exit/fee logic reads these
          rows directly, no code change needed.
        </p>
      </div>

      {lots && lots.length > 0 && (
        <select
          value={activeLotId ?? ""}
          onChange={(e) => setLotId(Number(e.target.value))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {lots.map((lot) => (
            <option key={lot.id} value={lot.id}>
              {lot.name} ({lot.available_slots}/{lot.total_slots} free)
            </option>
          ))}
        </select>
      )}

      {activeLotId && (
        <div className="grid gap-8 md:grid-cols-2">
          <SlotsManager lotId={activeLotId} />
          <TariffsManager lotId={activeLotId} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------

function SlotsManager({ lotId }: { lotId: number }) {
  const queryClient = useQueryClient();
  const [slotNumber, setSlotNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: slots } = useQuery({
    queryKey: ["slot-grid", lotId],
    queryFn: () => getSlotGrid(lotId),
  });

  const addMutation = useMutation({
    mutationFn: () => createSlot(lotId, Number(slotNumber)),
    onSuccess: () => {
      setSlotNumber("");
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["slot-grid", lotId] });
      queryClient.invalidateQueries({ queryKey: ["lots"] });
    },
    onError: (err) => {
      setError(isAxiosError(err) ? JSON.stringify(err.response?.data) : "Failed to add slot.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slot-grid", lotId] });
      queryClient.invalidateQueries({ queryKey: ["lots"] });
    },
  });

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    addMutation.mutate();
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-4 font-semibold text-slate-900">Slots</h2>

      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input
          type="number"
          min={1}
          placeholder="Slot number"
          value={slotNumber}
          onChange={(e) => setSlotNumber(e.target.value)}
          required
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={addMutation.isPending}
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <ul className="divide-y divide-slate-100 text-sm">
        {slots?.map((slot) => (
          <li key={slot.id} className="flex items-center justify-between py-2">
            <span>
              #{slot.slot_number} — <span className="text-slate-500">{slot.status}</span>
            </span>
            <button
              onClick={() => deleteMutation.mutate(slot.id)}
              className="text-red-600 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------

function TariffsManager({ lotId }: { lotId: number }) {
  const queryClient = useQueryClient();
  const [minMinutes, setMinMinutes] = useState("");
  const [maxMinutes, setMaxMinutes] = useState(""); // blank = open-ended top band
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: tariffs } = useQuery({
    queryKey: ["tariffs", lotId],
    queryFn: getTariffs,
    select: (all) => all.filter((t) => t.lot === lotId).sort((a, b) => a.min_minutes - b.min_minutes),
  });

  const addMutation = useMutation({
    mutationFn: () =>
      createTariff(
        lotId,
        Number(minMinutes),
        maxMinutes === "" ? null : Number(maxMinutes),
        Number(amount)
      ),
    onSuccess: () => {
      setMinMinutes("");
      setMaxMinutes("");
      setAmount("");
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["tariffs"] });
    },
    onError: (err) => {
      setError(isAxiosError(err) ? JSON.stringify(err.response?.data) : "Failed to add tariff.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTariff(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tariffs"] }),
  });

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    addMutation.mutate();
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-4 font-semibold text-slate-900">Tariff Bands</h2>

      <form onSubmit={handleAdd} className="mb-4 grid grid-cols-3 gap-2">
        <input
          type="number"
          min={0}
          placeholder="Min min"
          value={minMinutes}
          onChange={(e) => setMinMinutes(e.target.value)}
          required
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          placeholder="Max min (blank = ∞)"
          value={maxMinutes}
          onChange={(e) => setMaxMinutes(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          step="0.01"
          placeholder="Kshs."
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={addMutation.isPending}
          className="col-span-3 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Add Band
        </button>
      </form>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <ul className="divide-y divide-slate-100 text-sm">
        {tariffs?.map((tariff) => (
          <li key={tariff.id} className="flex items-center justify-between py-2">
            <span>
              {tariff.min_minutes}&ndash;{tariff.max_minutes ?? "∞"} min ={" "}
              <span className="font-medium">Kshs. {tariff.amount}</span>
            </span>
            <button
              onClick={() => deleteMutation.mutate(tariff.id)}
              className="text-red-600 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}