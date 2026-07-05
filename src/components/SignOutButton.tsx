"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-smoke text-sm underline underline-offset-2"
    >
      Sign out
    </button>
  );
}
