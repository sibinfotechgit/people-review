import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getDatabase } from "@/db/database";
import { sessions, users } from "@/db/schema";

const scrypt = promisify(scryptCallback);
const COOKIE_NAME = "public_review_session";
const SESSION_DAYS = 14;

function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await getDatabase().insert(sessions).values({ userId, tokenHash: tokenHash(token), expiresAt });
  (await cookies()).set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", expires: expiresAt, path: "/" });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) await getDatabase().delete(sessions).where(eq(sessions.tokenHash, tokenHash(token)));
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [result] = await getDatabase().select({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status })
    .from(sessions).innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash(token)), gt(sessions.expiresAt, new Date()), eq(users.status, "active"))).limit(1);
  return result ?? null;
}

export async function requireUser() { const user = await getCurrentUser(); if (!user) redirect("/auth?mode=login&next=/account"); return user; }
export async function requireAdmin() { const user = await requireUser(); if (user.role !== "admin") redirect("/account?error=admin"); return user; }