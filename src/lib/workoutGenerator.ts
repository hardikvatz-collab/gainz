import { pick } from "./exercises";
import { Goal } from "./nutrition";

export interface WorkoutItem {
  id: string;
  name: string;
  sets: number;
  reps: string;
}

export interface WorkoutDay {
  dayName: string;
  items: WorkoutItem[];
}

// Rep range + set count leans toward the goal: fat loss/cut skews higher reps
// and slightly lower sets per movement (more volume via density), muscle
// gain/bulk skews classic hypertrophy ranges with more sets on compounds.
function repsAndSetsFor(goal: Goal, isCompound: boolean): { sets: number; reps: string } {
  const cutting = goal === "lose_fat" || goal === "cut";
  const gaining = goal === "gain_muscle" || goal === "bulk";

  if (isCompound) {
    if (cutting) return { sets: 3, reps: "10-12" };
    if (gaining) return { sets: 4, reps: "6-10" };
    return { sets: 3, reps: "8-10" }; // maintain / recomp
  }
  if (cutting) return { sets: 3, reps: "12-15" };
  if (gaining) return { sets: 3, reps: "10-12" };
  return { sets: 3, reps: "10-12" };
}

function buildDay(dayName: string, categories: Array<"push" | "pull" | "legs" | "core" | "full">, goal: Goal, offset: number): WorkoutDay {
  const items: WorkoutItem[] = [];
  let idx = 0;
  categories.forEach((cat, ci) => {
    const count = cat === "core" ? 2 : cat === "full" ? 8 : 4;
    const names = pick(cat, count, offset + ci * 2);
    names.forEach((name, i) => {
      const isCompound = i < (cat === "full" ? names.length : 2);
      const { sets, reps } = repsAndSetsFor(goal, isCompound);
      items.push({ id: `${dayName}-${idx++}`.replace(/\s+/g, ""), name, sets, reps });
    });
  });
  return { dayName, items };
}

export function generateSplit(daysPerWeek: number, goal: Goal): WorkoutDay[] {
  const d = Math.min(Math.max(daysPerWeek, 1), 7);

  if (d <= 2) {
    return [
      buildDay("Full Body A", ["full"], goal, 0),
      buildDay("Full Body B", ["full"], goal, 4),
    ].slice(0, d);
  }

  if (d === 3) {
    return [
      buildDay("Full Body A", ["full"], goal, 0),
      buildDay("Full Body B", ["full"], goal, 3),
      buildDay("Full Body C", ["full"], goal, 6),
    ];
  }

  if (d === 4) {
    return [
      buildDay("Upper Body A", ["push", "pull"], goal, 0),
      buildDay("Lower Body A", ["legs", "core"], goal, 0),
      buildDay("Upper Body B", ["push", "pull"], goal, 4),
      buildDay("Lower Body B", ["legs", "core"], goal, 4),
    ];
  }

  if (d === 5) {
    return [
      buildDay("Push Day", ["push", "core"], goal, 0),
      buildDay("Pull Day", ["pull"], goal, 0),
      buildDay("Leg Day", ["legs"], goal, 0),
      buildDay("Upper Body", ["push", "pull"], goal, 4),
      buildDay("Lower Body", ["legs", "core"], goal, 4),
    ];
  }

  if (d === 6) {
    return [
      buildDay("Push Day A", ["push", "core"], goal, 0),
      buildDay("Pull Day A", ["pull"], goal, 0),
      buildDay("Leg Day A", ["legs"], goal, 0),
      buildDay("Push Day B", ["push", "core"], goal, 4),
      buildDay("Pull Day B", ["pull"], goal, 4),
      buildDay("Leg Day B", ["legs"], goal, 4),
    ];
  }

  // 7 days: 6-day PPL split plus a light full-body / recovery-focused day
  return [
    buildDay("Push Day A", ["push", "core"], goal, 0),
    buildDay("Pull Day A", ["pull"], goal, 0),
    buildDay("Leg Day A", ["legs"], goal, 0),
    buildDay("Push Day B", ["push", "core"], goal, 4),
    buildDay("Pull Day B", ["pull"], goal, 4),
    buildDay("Leg Day B", ["legs"], goal, 4),
    buildDay("Active Recovery / Weak Points", ["core", "full"], goal, 2),
  ];
}
