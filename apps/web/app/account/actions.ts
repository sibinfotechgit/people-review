"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDatabase } from "@/db/database";
import { reviews } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export async function deleteOwnReview(formData: FormData) {
  const user = await requireUser();
  const parsed = z.uuid().safeParse(formData.get("reviewId"));
  if (!parsed.success) return;
  await getDatabase().delete(reviews).where(and(eq(reviews.id, parsed.data), eq(reviews.userId, user.id)));
  revalidatePath("/account");
}