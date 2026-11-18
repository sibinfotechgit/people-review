"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDatabase } from "@/db/database";
import { reviews, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const idSchema = z.uuid();
export async function updateUserStatus(formData: FormData) { const admin = await requireAdmin(); const id=idSchema.safeParse(formData.get("userId")); const status=z.enum(["active","suspended"]).safeParse(formData.get("status")); if(!id.success||!status.success||id.data===admin.id) return; await getDatabase().update(users).set({status:status.data,updatedAt:new Date()}).where(eq(users.id,id.data)); revalidatePath("/admin"); }
export async function updateUserRole(formData: FormData) { const admin = await requireAdmin(); const id=idSchema.safeParse(formData.get("userId")); const role=z.enum(["admin","user"]).safeParse(formData.get("role")); if(!id.success||!role.success||id.data===admin.id) return; await getDatabase().update(users).set({role:role.data,updatedAt:new Date()}).where(eq(users.id,id.data)); revalidatePath("/admin"); }
export async function updateReviewStatus(formData: FormData) { await requireAdmin(); const id=idSchema.safeParse(formData.get("reviewId")); const status=z.enum(["published","pending","hidden"]).safeParse(formData.get("status")); if(!id.success||!status.success) return; await getDatabase().update(reviews).set({status:status.data}).where(eq(reviews.id,id.data)); revalidatePath("/admin"); }