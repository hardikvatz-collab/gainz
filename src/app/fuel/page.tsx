"use client";

import { useEffect, useRef, useState } from "react";
import NavBar from "@/components/NavBar";
import { todayString, friendlyDate } from "@/lib/date";

interface FoodLog {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
}

interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Targets {
  calorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
}

interface DraftEntry {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function Bar({ label, value, target, unit }: { label: string; value: number; target: number; unit: string }) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const over = value > target;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="eyebrow">{label}</span>
        <span className={`font-mono text-sm ${over ? "text-iron" : "text-smoke"}`}>
          {value} / {target}
          {unit}
        </span>
      </div>
      <div className="h-2 w-full rounded-sm bg-panel2 border border-line overflow-hidden">
        <div
          className={`h-full ${over ? "bg-iron" : "bg-brass"}`}
          style={{ width: `${pct}%`, transition: "width 300ms ease" }}
        />
      </div>
    </div>
  );
}

export default function FuelPage() {
  const date = todayString();
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [totals, setTotals] = useState<Totals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [targets, setTargets] = useState<Targets | null>(null);
  const [loading, setLoading] = useState(true);

  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [draft, setDraft] = useState<DraftEntry | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState<DraftEntry>({ name: "", calories: 0, protein: 0, carbs: 0, fat: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadData() {
    const res = await fetch(`/api/food?date=${date}`);
    const data = await res.json();
    setLogs(data.logs || []);
    setTotals(data.totals);
    setTargets(data.targets);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  function fileToBase64(file: File): Promise<{ base64: string; mediaType: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve({ base64, mediaType: file.type });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanError("");
    setScanning(true);
    try {
      const { base64, mediaType } = await fileToBase64(file);
      const res = await fetch("/api/food/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setScanError(data.error || "Couldn't read that photo");
      } else {
        setDraft(data);
      }
    } catch {
      setScanError("Couldn't read that photo");
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function confirmEntry(entry: DraftEntry, source: string) {
    await fetch("/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, source, ...entry }),
    });
    setDraft(null);
    setShowManual(false);
    setManual({ name: "", calories: 0, protein: 0, carbs: 0, fat: 0 });
    loadData();
  }

  async function deleteEntry(id: string) {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/food?id=${id}`, { method: "DELETE" });
    loadData();
  }

  return (
    <main className="min-h-screen px-6 pt-10 pb-28">
      <p className="eyebrow mb-1">{friendlyDate(date)}</p>
      <h1 className="text-3xl font-bold mb-6">Fuel</h1>

      {!loading && targets && (
        <div className="card p-5 mb-6 flex flex-col gap-4">
          <Bar label="Calories" value={totals.calories} target={targets.calorieTarget} unit="" />
          <Bar label="Protein" value={totals.protein} target={targets.proteinTarget} unit="g" />
          <Bar label="Carbs" value={totals.carbs} target={targets.carbTarget} unit="g" />
          <Bar label="Fat" value={totals.fat} target={targets.fatTarget} unit="g" />
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <button
          className="btn-primary flex-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={scanning}
        >
          {scanning ? "Reading photo..." : "Scan Food Photo"}
        </button>
        <button className="btn-secondary flex-1" onClick={() => setShowManual(true)}>
          Add Manually
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {scanError && <p className="text-iron text-sm mb-4">{scanError}</p>}

      {draft && (
        <div className="card p-5 mb-6">
          <p className="eyebrow mb-3">Confirm entry</p>
          <div className="flex flex-col gap-3">
            <input
              className="input-field"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <LabeledNumber label="Calories" value={draft.calories} onChange={(v) => setDraft({ ...draft, calories: v })} />
              <LabeledNumber label="Protein (g)" value={draft.protein} onChange={(v) => setDraft({ ...draft, protein: v })} />
              <LabeledNumber label="Carbs (g)" value={draft.carbs} onChange={(v) => setDraft({ ...draft, carbs: v })} />
              <LabeledNumber label="Fat (g)" value={draft.fat} onChange={(v) => setDraft({ ...draft, fat: v })} />
            </div>
            <div className="flex gap-3 mt-2">
              <button className="btn-secondary flex-1" onClick={() => setDraft(null)}>
                Discard
              </button>
              <button className="btn-primary flex-1" onClick={() => confirmEntry(draft, "photo")}>
                Add to Log
              </button>
            </div>
          </div>
        </div>
      )}

      {showManual && (
        <div className="card p-5 mb-6">
          <p className="eyebrow mb-3">Add food manually</p>
          <div className="flex flex-col gap-3">
            <input
              className="input-field"
              placeholder="Food name"
              value={manual.name}
              onChange={(e) => setManual({ ...manual, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <LabeledNumber label="Calories" value={manual.calories} onChange={(v) => setManual({ ...manual, calories: v })} />
              <LabeledNumber label="Protein (g)" value={manual.protein} onChange={(v) => setManual({ ...manual, protein: v })} />
              <LabeledNumber label="Carbs (g)" value={manual.carbs} onChange={(v) => setManual({ ...manual, carbs: v })} />
              <LabeledNumber label="Fat (g)" value={manual.fat} onChange={(v) => setManual({ ...manual, fat: v })} />
            </div>
            <div className="flex gap-3 mt-2">
              <button className="btn-secondary flex-1" onClick={() => setShowManual(false)}>
                Cancel
              </button>
              <button
                className="btn-primary flex-1"
                onClick={() => confirmEntry(manual, "manual")}
                disabled={!manual.name}
              >
                Add to Log
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="eyebrow mb-3">Today&apos;s log</p>
      <div className="flex flex-col gap-3">
        {logs.length === 0 && !loading && (
          <p className="text-smoke text-sm">Nothing logged yet — scan a photo or add an entry above.</p>
        )}
        {logs.map((log) => (
          <div key={log.id} className="card flex items-center justify-between px-4 py-4">
            <div>
              <p className="font-medium">{log.name}</p>
              <p className="font-mono text-sm text-smoke">
                {log.calories} cal · {log.protein}p · {log.carbs}c · {log.fat}f
              </p>
            </div>
            <button className="text-smoke text-sm" onClick={() => deleteEntry(log.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <NavBar />
    </main>
  );
}

function LabeledNumber({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <p className="text-xs text-smoke mb-1">{label}</p>
      <input
        type="number"
        className="input-field"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
