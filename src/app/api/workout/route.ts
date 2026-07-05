import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayString } from "@/lib/date";
import { WorkoutDay } from "@/lib/workoutGenerator";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || todayString();

  const existing = await prisma.workoutLog.findUnique({
    where: { userId_date: { userId: session.user.id, date } },
  });

  if (existing) {
    return NextResponse.json({
      date: existing.date,
      dayName: existing.dayName,
      items: JSON.parse(existing.itemsJson),
    });
  }

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "No profile yet" }, { status: 400 });

  const split: WorkoutDay[] = JSON.parse(profile.splitJson);
  const loggedCount = await prisma.workoutLog.count({ where: { userId: session.user.id } });
  const dayIndex = loggedCount % split.length;
  const day = split[dayIndex];

  const items = day.items.map((item) => ({ ...item, checked: false }));

  const created = await prisma.workoutLog.create({
    data: {
      userId: session.user.id,
      date,
      dayName: day.dayName,
      itemsJson: JSON.stringify(items),
    },
  });

  return NextResponse.json({
    date: created.date,
    dayName: created.dayName,
    items,
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { date, itemId, checked } = await req.json();
  if (!date || !itemId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const existing = await prisma.workoutLog.findUnique({
    where: { userId_date: { userId: session.user.id, date } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items = JSON.parse(existing.itemsJson).map((item: any) =>
    item.id === itemId ? { ...item, checked } : item
  );

  await prisma.workoutLog.update({
    where: { userId_date: { userId: session.user.id, date } },
    data: { itemsJson: JSON.stringify(items) },
  });

  return NextResponse.json({ items });
}
