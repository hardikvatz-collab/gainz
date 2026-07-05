import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateTargets } from "@/lib/nutrition";
import { generateSplit } from "@/lib/workoutGenerator";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      age,
      sex,
      heightCm,
      weightKg,
      goal,
      activityLevel,
      daysPerWeek,
      otherExercise,
    } = body;

    if (!age || !sex || !heightCm || !weightKg || !goal || !activityLevel || !daysPerWeek) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const targets = calculateTargets({
      sex,
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      age: Number(age),
      activityLevel,
      goal,
    });

    const split = generateSplit(Number(daysPerWeek), goal);

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        age: Number(age),
        sex,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        goal,
        activityLevel,
        daysPerWeek: Number(daysPerWeek),
        otherExercise: otherExercise || null,
        calorieTarget: targets.calorieTarget,
        proteinTarget: targets.proteinTarget,
        carbTarget: targets.carbTarget,
        fatTarget: targets.fatTarget,
        splitJson: JSON.stringify(split),
      },
      create: {
        userId: session.user.id,
        age: Number(age),
        sex,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        goal,
        activityLevel,
        daysPerWeek: Number(daysPerWeek),
        otherExercise: otherExercise || null,
        calorieTarget: targets.calorieTarget,
        proteinTarget: targets.proteinTarget,
        carbTarget: targets.carbTarget,
        fatTarget: targets.fatTarget,
        splitJson: JSON.stringify(split),
      },
    });

    return NextResponse.json({ profile, targets, split });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
