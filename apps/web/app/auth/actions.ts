"use server";

import { count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { getDatabase } from "@/db/database";
import { users } from "@/db/schema";
import { signInSchema, signUpSchema, type AuthState } from "@/domain/auth";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";

function fieldErrors(error: { flatten(): { fieldErrors: Record<string, string[]> } }) { return error.flatten().fieldErrors; }

export async function signUp(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({ name: formData.get("name"), email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please check the highlighted fields." };
  const database = getDatabase();
  const [existing] = await database.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email)).limit(1);
  if (existing) return { message: "An account with this email already exists." };
  const passwordHash = await hashPassword(parsed.data.password);
  const [stats] = await database.select({ value: count() }).from(users);
  const role = Number(stats.value) === 0 ? "admin" : "user";
  let created: { id: string } | undefined;
  try {
    [created] = await database.insert(users).values({ name: parsed.data.name, email: parsed.data.email, passwordHash, role }).returning({ id: users.id });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return { message: "An account with this email already exists." };
    return { message: "We could not create your account. Please try again." };
  }
  await createSession(created.id);
  redirect(role === "admin" ? "/admin" : "/account");
}

export async function signIn(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signInSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { message: "Enter a valid email and password." };
  const database = getDatabase();
  const [user] = await database.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) return { message: "Email or password is incorrect." };
  if (user.status !== "active") return { message: "This account has been suspended. Contact an administrator." };
  await database.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));
  await createSession(user.id);
  redirect(user.role === "admin" ? "/admin" : "/account");
}

export async function signOut() { await destroySession(); redirect("/"); }