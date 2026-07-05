export interface ExerciseDef {
  name: string;
  category: "push" | "pull" | "legs" | "core" | "full";
}

export const EXERCISES: Record<ExerciseDef["category"], string[]> = {
  push: [
    "Barbell Bench Press",
    "Overhead Press",
    "Incline Dumbbell Press",
    "Dumbbell Shoulder Press",
    "Weighted Dips",
    "Cable Chest Fly",
    "Lateral Raise",
    "Triceps Pushdown",
    "Overhead Triceps Extension",
  ],
  pull: [
    "Deadlift",
    "Pull-Ups",
    "Barbell Row",
    "Lat Pulldown",
    "Seated Cable Row",
    "Face Pull",
    "Barbell Curl",
    "Dumbbell Hammer Curl",
    "Rear Delt Fly",
  ],
  legs: [
    "Barbell Back Squat",
    "Romanian Deadlift",
    "Leg Press",
    "Walking Lunges",
    "Leg Curl",
    "Leg Extension",
    "Hip Thrust",
    "Standing Calf Raise",
    "Bulgarian Split Squat",
  ],
  core: ["Hanging Leg Raise", "Cable Crunch", "Plank", "Ab Wheel Rollout"],
  full: [
    "Barbell Back Squat",
    "Barbell Bench Press",
    "Barbell Row",
    "Overhead Press",
    "Deadlift",
    "Pull-Ups",
    "Dumbbell Lunges",
    "Plank",
  ],
};

export function pick(category: ExerciseDef["category"], count: number, offset = 0): string[] {
  const list = EXERCISES[category];
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(list[(offset + i) % list.length]);
  }
  return result;
}
