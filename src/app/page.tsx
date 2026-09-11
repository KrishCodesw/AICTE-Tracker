"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/LogoutButton";
import Link from "next/link";
interface User {
  id: string | number;
  email: string;
  username?: string | null;
  name?: string | null;
  createdAt?: string | Date | null;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    let isMounted = true;
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setUsers(data);
        }
      } finally {
        if (isMounted) setUsersLoading(false);
      }
    }

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [status]);

  const formatter = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="shell">
      <div className="hero">
        <p className="eyebrow">Next.js + Prisma 8</p>

        <h1>Users from your database, loaded on the server.</h1>
        <p className="lede">
          This page reads from <code>src/app/page.tsx</code> using the Prisma 8
          helper in <code>src/prisma/users.ts</code>.
        </p>
        {status === "loading" && <p>Loading session...</p>}
        {status === "authenticated" && (
          <div>
            <h2>
              Signed in as {session?.user?.name ?? session?.user?.email}
              <LogoutButton />
            </h2>
          </div>
        )}
        {status === "unauthenticated" && (
          <p>
            You are not signed in. <Link href="/api/auth/signin">Sign in</Link>{" "}
            to enable Google OAuth.
          </p>
        )}
      </div>

      <section className="panel">
        <div className="panelHeader">
          <h2>Seeded users</h2>
          <span>{users.length} total</span>
        </div>

        {usersLoading ? (
          <p className="empty">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="empty">
            Could not query users yet. Run <code>contract:emit</code> and apply
            your schema, then refresh.
          </p>
        ) : (
          <ul className="users">
            {users.map((user) => (
              <li key={user.id}>
                <div>
                  <strong>{user.name ?? "Unnamed user"}</strong>
                  <p>{user.username ? `@${user.username}` : user.email}</p>
                </div>
                {user.createdAt ? (
                  <time dateTime={String(user.createdAt)}>
                    {formatter.format(new Date(user.createdAt))}
                  </time>
                ) : (
                  <span className="empty">No timestamp</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
