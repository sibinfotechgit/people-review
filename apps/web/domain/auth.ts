import { z } from "zod";

const password = z.string().min(8, "Use at least 8 characters.").max(128).regex(/[A-Za-z]/, "Add at least one letter.").regex(/[0-9]/, "Add at least one number.");
export const signUpSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.email().trim().toLowerCase(), password });
export const signInSchema = z.object({ email: z.email().trim().toLowerCase(), password: z.string().min(1).max(128) });
export type AuthState = { message?: string; errors?: Record<string, string[]> } | undefined;