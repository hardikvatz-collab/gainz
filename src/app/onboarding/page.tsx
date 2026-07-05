"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GOALS = [
  { value: "lose_fat", label: "Lose Fat" },
  { value: "cut", label: "Cut (lean out, keep muscle)" },
  { value: "maintain", label: "Maintain" },
  { value: "recomp", label: "Recomp (lose fat + gain muscle)" },
  { value: "gain_muscle", label: "Gain Muscle" },
  { value: "bulk", label: "Bulk" },
];

const ACTIVITY = [
  { value: "sedentary", label: "Sedentary (desk job, little movement)" },
  { value: "light", label: "Light (some walking, light activity)" },
  { value: "moderate", label: "Moderate (on your feet, regular activity)" },
  { value: "active", label: "Active (physical job or daily exercise)" },
  { value: "very_active", label: "Very Active (hard labor or 2x/day training)" },
];

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    age: "",
    sex: "male",
    heightCm: "",
    weightKg: "",
    units: "imperial" as "imperial" | "metric",
    heightFt: "",
    heightIn: "",
    weightLb: "",
    goal: "recomp",
    activityLevel: "moderate",
    daysPerWeek: "4",
    otherExercise: "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    let heightCm = Number(form.heightCm);
    let weightKg = Number(form.weightKg);
    if (form.units === "imperial") {
      const ft = Number(form.heightFt) || 0;
      const inch = Number(form.heightIn) || 0;
      heightCm = (ft * 12 + inch) * 2.54;
      weightKg = Number(form.weightLb) * 0.453592;
    }

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age: Number(form.age),
        sex: form.sex,
        heightCm,
        weightKg,
        goal: form.goal,
        activityLevel: form.activityLevel,
        daysPerWeek: Number(form.daysPerWeek),
        otherExercise: form.otherExercise,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <p className="eyebrow mb-2">
          Step {step} of {TOTAL_STEPS}
        </p>
        <div className="plate-stack mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`plate ${i < step ? "filled" : ""}`} />
          ))}
        </div>

        {step === 1 && (
          <section>
            <h1 className="text-2xl font-bold mb-6">The basics</h1>
            <div className="flex flex-col gap-4">
              <input
                className="input-field"
                type="number"
                placeholder="Age"
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
              />
              <div className="flex gap-2">
                {["male", "female"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update("sex", s)}
                    className={`flex-1 py-3 rounded-sm border capitalize ${
                      form.sex === s ? "border-iron text-iron" : "border-line text-smoke"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                {["imperial", "metric"].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => update("units", u)}
                    className={`flex-1 py-2 rounded-sm border text-sm capitalize ${
                      form.units === u ? "border-iron text-iron" : "border-line text-smoke"
                    }`}
                  >
                    {u === "imperial" ? "ft/in, lb" : "cm, kg"}
                  </button>
                ))}
              </div>

              {form.units === "imperial" ? (
                <>
                  <div className="flex gap-2">
                    <input
                      className="input-field"
                      type="number"
                      placeholder="Height (ft)"
                      value={form.heightFt}
                      onChange={(e) => update("heightFt", e.target.value)}
                    />
                    <input
                      className="input-field"
                      type="number"
                      placeholder="Height (in)"
                      value={form.heightIn}
                      onChange={(e) => update("heightIn", e.target.value)}
                    />
                  </div>
                  <input
                    className="input-field"
                    type="number"
                    placeholder="Weight (lb)"
                    value={form.weightLb}
                    onChange={(e) => update("weightLb", e.target.value)}
                  />
                </>
              ) : (
                <>
                  <input
                    className="input-field"
                    type="number"
                    placeholder="Height (cm)"
                    value={form.heightCm}
                    onChange={(e) => update("heightCm", e.target.value)}
                  />
                  <input
                    className="input-field"
                    type="number"
                    placeholder="Weight (kg)"
                    value={form.weightKg}
                    onChange={(e) => update("weightKg", e.target.value)}
                  />
                </>
              )}
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h1 className="text-2xl font-bold mb-6">What&apos;s the goal?</h1>
            <div className="flex flex-col gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => update("goal", g.value)}
                  className={`text-left py-3 px-4 rounded-sm border ${
                    form.goal === g.value ? "border-iron text-iron" : "border-line text-chalk"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h1 className="text-2xl font-bold mb-6">Activity &amp; schedule</h1>
            <p className="eyebrow mb-2">Daily activity outside the gym</p>
            <div className="flex flex-col gap-2 mb-6">
              {ACTIVITY.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => update("activityLevel", a.value)}
                  className={`text-left py-3 px-4 rounded-sm border text-sm ${
                    form.activityLevel === a.value ? "border-iron text-iron" : "border-line text-chalk"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <p className="eyebrow mb-2">Days per week you&apos;ll lift</p>
            <div className="grid grid-cols-7 gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update("daysPerWeek", String(n))}
                  className={`py-3 rounded-sm border font-mono ${
                    form.daysPerWeek === String(n) ? "border-iron text-iron" : "border-line text-smoke"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <p className="eyebrow mb-2">Other exercise you're already doing (optional)</p>
            <textarea
              className="input-field"
              placeholder="e.g. running 3x/week, soccer on weekends, yoga..."
              value={form.otherExercise}
              onChange={(e) => update("otherExercise", e.target.value)}
              rows={3}
            />
          </section>
        )}

        {step === 4 && (
          <section>
            <h1 className="text-2xl font-bold mb-4">Ready to build your plan</h1>
            <p className="text-smoke mb-6">
              Based on what you told me, I&apos;ll calculate your daily calorie
              and macro targets and generate a {form.daysPerWeek}-day split
              built around your goal. You can always adjust later.
            </p>
            {error && <p className="text-iron text-sm mb-4">{error}</p>}
          </section>
        )}

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button className="btn-secondary flex-1" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button className="btn-primary flex-1" onClick={() => setStep(step + 1)}>
              Next
            </button>
          ) : (
            <button className="btn-primary flex-1" onClick={handleSubmit} disabled={loading}>
              {loading ? "Building..." : "Build My Plan"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
