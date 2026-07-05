export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lose_fat" | "cut" | "maintain" | "recomp" | "gain_muscle" | "bulk";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Mifflin-St Jeor
function bmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

// Goal-based calorie adjustment as a fraction of TDEE
const GOAL_ADJUSTMENT: Record<Goal, number> = {
  lose_fat: -0.2,
  cut: -0.22,
  maintain: 0,
  recomp: -0.05,
  gain_muscle: 0.12,
  bulk: 0.18,
};

// Protein per kg bodyweight by goal (higher for cutting/recomp to preserve muscle)
const PROTEIN_PER_KG: Record<Goal, number> = {
  lose_fat: 2.2,
  cut: 2.3,
  maintain: 1.8,
  recomp: 2.2,
  gain_muscle: 2.0,
  bulk: 1.9,
};

// Fat as a fraction of total calories
const FAT_FRACTION: Record<Goal, number> = {
  lose_fat: 0.3,
  cut: 0.28,
  maintain: 0.3,
  recomp: 0.3,
  gain_muscle: 0.28,
  bulk: 0.28,
};

export interface Targets {
  tdee: number;
  calorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
}

export function calculateTargets(params: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}): Targets {
  const { sex, weightKg, heightCm, age, activityLevel, goal } = params;

  const bmrValue = bmr(sex, weightKg, heightCm, age);
  const tdee = bmrValue * ACTIVITY_MULTIPLIERS[activityLevel];

  const calorieTarget = Math.round(tdee * (1 + GOAL_ADJUSTMENT[goal]));
  const proteinTarget = Math.round(weightKg * PROTEIN_PER_KG[goal]);
  const fatTarget = Math.round((calorieTarget * FAT_FRACTION[goal]) / 9);

  const proteinCals = proteinTarget * 4;
  const fatCals = fatTarget * 9;
  const carbCals = Math.max(calorieTarget - proteinCals - fatCals, 0);
  const carbTarget = Math.round(carbCals / 4);

  return {
    tdee: Math.round(tdee),
    calorieTarget,
    proteinTarget,
    carbTarget,
    fatTarget,
  };
}
