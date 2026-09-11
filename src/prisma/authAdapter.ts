import type { Adapter, AdapterUser, AdapterAccount } from "next-auth/adapters";
import { Temporal } from "temporal-polyfill";
import { db } from "./db";

interface DatabaseUser {
  id: number | string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: Temporal.Instant | null;
}

function toTemporalInstant(date: Date | null | undefined) {
  if (!date) return null;
  return Temporal.Instant.fromEpochMilliseconds(date.getTime());
}

function toDate(instant: Temporal.Instant | null | undefined): Date | null {
  if (!instant) return null;
  return new Date(instant.epochMilliseconds);
}

function formatUser(user: DatabaseUser): AdapterUser {
  return {
    id: String(user.id),
    email: user.email,
    name: user.name ?? null,
    image: user.image ?? null,
    emailVerified: toDate(user.emailVerified),
  };
}

export function CustomPrismaAdapter(): Adapter {
  return {
    async createUser(user: AdapterUser) {
      const created = await db.orm.public.User.create({
        email: user.email,
        name: user.name ?? null,
        image: user.image ?? null,
        emailVerified: toTemporalInstant(user.emailVerified),
        username: null,
        googleId: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      });

      return formatUser(created);
    },

    async getUser(id: string) {
      const numericId = Number(id);
      if (isNaN(numericId)) return null;

      const user = await db.orm.public.User.where({ id: numericId }).first();
      if (!user) return null;

      return formatUser(user);
    },

    async getUserByEmail(email: string) {
      const user = await db.orm.public.User.where({ email }).first();
      if (!user) return null;

      return formatUser(user);
    },

    async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      if (provider === "google") {
        const user = await db.orm.public.User.where({ googleId: providerAccountId }).first();
        if (!user) return null;

        return formatUser(user);
      }
      return null;
    },

    async linkAccount(account: AdapterAccount) {
      const numericId = Number(account.userId);
      if (!isNaN(numericId) && account.provider === "google") {
        await db.orm.public.User.where({ id: numericId }).update({
          googleId: account.providerAccountId,
          accessToken: account.access_token ?? null,
          refreshToken: account.refresh_token ?? null,
          expiresAt: account.expires_at
            ? Temporal.Instant.fromEpochMilliseconds(account.expires_at * 1000)
            : null,
        });
      }
      return account;
    },

    async updateUser(user: Partial<AdapterUser> & { id: string }) {
      const numericId = Number(user.id);

      const updated = await db.orm.public.User.where({ id: numericId }).update({
        ...(user.name !== undefined && { name: user.name }),
        ...(user.email !== undefined && { email: user.email }),
        ...(user.image !== undefined && { image: user.image }),
        ...(user.emailVerified !== undefined && {
          emailVerified: toTemporalInstant(user.emailVerified),
        }),
      });

      if (!updated) {
        const existing = await db.orm.public.User.where({ id: numericId }).first();
        if (!existing) throw new Error("User not found for update");
        return formatUser(existing);
      }

      return formatUser(updated);
    },

    async deleteUser(userId: string) {
      const numericId = Number(userId);
      if (!isNaN(numericId)) {
        await db.orm.public.User.where({ id: numericId }).delete();
      }
    },
  };
}