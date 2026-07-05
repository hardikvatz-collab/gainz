import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayString } from "@/lib/date";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || todayString();

  const [logs, profile] = await Promise.all([
    prisma.foodLog.findMany({
      where: { userId: session.user.id, date },
      orderBy: { createdAt: "asc" },
    }),
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
  ]);

  const totals = logs.reduce(
    (
      acc: { calories: number; protein: number; carbs: number; fat: number },
      l: { calories: number; protein: number; carbs: number; fat: number }
    ) => ({
      calories: acc.calories + l.calories,
      protein: acc.protein + l.protein,
      carbs: acc.carbs + l.carbs,
      fat: acc.fat + l.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return NextResponse.json({
    logs,
    totals,
    targets: profile
      ? {
          calorieTarget: profile.calorieTarget,
          proteinTarget: profile.proteinTarget,
          carbTarget: profile.carbTarget,
          fatTarget: profile.fatTarget,
        }
      : null,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { date, name, calories, protein, carbs, fat, source } = await req.json();
  if (!date || !name) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const log = await prisma.foodLog.create({
    data: {
      userId: session.user.id,
      date,
      name,
      calories: Math.round(calories) || 0,
      protein: Math.round(protein) || 0,
      carbs: Math.round(carbs) || 0,
      fat: Math.round(fat) || 0,
      source: source || "manual",
    },
  });

  return NextResponse.json(log);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.foodLog.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
