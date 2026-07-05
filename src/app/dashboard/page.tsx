import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayString, friendlyDate } from "@/lib/date";
import NavBar from "@/components/NavBar";
import SignOutButton from "@/components/SignOutButton";

const GOAL_LABELS: Record<string, string> = {
  lose_fat: "Losing Fat",
  cut: "Cutting",
  maintain: "Maintaining",
  recomp: "Recomping",
  gain_muscle: "Gaining Muscle",
  bulk: "Bulking",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/onboarding");

  const date = todayString();
  const [workoutLog, foodLogs] = await Promise.all([
    prisma.workoutLog.findUnique({ where: { userId_date: { userId: session.user.id, date } } }),
    prisma.foodLog.findMany({ where: { userId: session.user.id, date } }),
  ]);

  const workoutItems = workoutLog ? JSON.parse(workoutLog.itemsJson) : [];
  const doneCount = workoutItems.filter((i: any) => i.checked).length;

  const caloriesLogged = foodLogs.reduce((s: number, l: { calories: number }) => s + l.calories, 0);
  const proteinLogged = foodLogs.reduce((s: number, l: { protein: number }) => s + l.protein, 0);

  return (
    <main className="min-h-screen px-6 pt-10 pb-28">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="eyebrow mb-1 text-iron">GAINZ · {friendlyDate(date)}</p>
          <h1 className="text-3xl font-bold">
            Hey, {session.user.name?.split(" ")[0] || "there"}
          </h1>
        </div>
        <SignOutButton />
      </div>

      <div className="card p-5 mb-4">
        <p className="eyebrow mb-1">Current Focus</p>
        <p className="text-xl font-display uppercase text-iron mb-1">
          {GOAL_LABELS[profile.goal] || profile.goal}
        </p>
        <p className="text-smoke text-sm">
          {profile.daysPerWeek}x/week split · {profile.calorieTarget} cal / {profile.proteinTarget}g protein target
        </p>
      </div>

      <Link href="/workout" className="card p-5 mb-4 flex justify-between items-center block">
        <div>
          <p className="eyebrow mb-1">Today&apos;s Workout</p>
          <p className="text-lg font-medium">{workoutLog ? workoutLog.dayName : "Not started yet"}</p>
          <p className="font-mono text-sm text-smoke">
            {doneCount}/{workoutItems.length || "?"} lifts done
          </p>
        </div>
        <span className="text-iron text-2xl">&rarr;</span>
      </Link>

      <Link href="/fuel" className="card p-5 flex justify-between items-center block">
        <div>
          <p className="eyebrow mb-1">Today&apos;s Fuel</p>
          <p className="text-lg font-medium">
            {caloriesLogged} / {profile.calorieTarget} cal
          </p>
          <p className="font-mono text-sm text-smoke">
            {proteinLogged}g / {profile.proteinTarget}g protein
          </p>
        </div>
        <span className="text-iron text-2xl">&rarr;</span>
      </Link>

      <NavBar />
    </main>
  );
}
