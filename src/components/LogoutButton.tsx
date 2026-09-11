"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
    >
      Sign Out
    </button>
  );
}
