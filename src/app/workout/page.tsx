"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { todayString, friendlyDate } from "@/lib/date";

interface Item {
  id: string;
  name: string;
  sets: number;
  reps: string;
  checked: boolean;
}

export default function WorkoutPage() {
  const [dayName, setDayName] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const date = todayString();

  useEffect(() => {
    fetch(`/api/workout?date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        setDayName(data.dayName || "");
        setItems(data.items || []);
        setLoading(false);
      });
  }, [date]);

  async function toggle(id: string, checked: boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked } : i)));
    await fetch("/api/workout", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, itemId: id, checked }),
    });
  }

  const doneCount = items.filter((i) => i.checked).length;
  const total = items.length || 1;

  return (
    <main className="min-h-screen px-6 pt-10 pb-28">
      <p className="eyebrow mb-1">{friendlyDate(date)}</p>
      <h1 className="text-3xl font-bold mb-6">{loading ? "Loading..." : dayName}</h1>

      {!loading && (
        <>
          <div className="mb-2 flex justify-between items-baseline">
            <span className="eyebrow">Progress</span>
            <span className="font-mono text-sm text-smoke">
              {doneCount}/{items.length} lifts
            </span>
          </div>
          <div className="plate-stack mb-8">
            {items.map((i) => (
              <div key={i.id} className={`plate ${i.checked ? "filled" : ""}`} />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <label
                key={item.id}
                className={`card flex items-center justify-between px-4 py-4 cursor-pointer ${
                  item.checked ? "opacity-50" : ""
                }`}
              >
                <div>
                  <p className={`font-medium ${item.checked ? "line-through" : ""}`}>{item.name}</p>
                  <p className="font-mono text-sm text-smoke">
                    {item.sets} sets &times; {item.reps} reps
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => toggle(item.id, e.target.checked)}
                  className="w-6 h-6 accent-iron"
                />
              </label>
            ))}
          </div>

          {doneCount === items.length && items.length > 0 && (
            <p className="text-good text-center font-display uppercase tracking-wide mt-8">
              Session complete. Well done.
            </p>
          )}
        </>
      )}

      <NavBar />
    </main>
  );
}
