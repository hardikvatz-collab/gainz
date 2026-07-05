import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
    redirect(profile ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow mb-4">Training · Nutrition · One Log</p>
      <h1 className="text-6xl font-bold leading-tight mb-4">
        <span className="text-iron">GAINZ</span>
      </h1>
      <p className="max-w-sm text-smoke mb-10">
        Tell it your goal. It builds your split, sets your fuel targets, and
        tracks both — every day, automatically.
      </p>
      <div className="flex gap-3">
        <Link href="/signup" className="btn-primary">
          Get Started
        </Link>
        <Link href="/login" className="btn-secondary">
          Log In
        </Link>
      </div>
    </main>
  );
}
