import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDatabase } from "@/db/database";
import { entities, reviews } from "@/db/schema";
import { reviewSubmissionSchema } from "@/domain/reviews";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in to publish a review." }, { status: 401 });
  const parsed = reviewSubmissionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Please check your review." }, { status: 400 });

  const database = getDatabase();
  const [entity] = await database.select({ id: entities.id }).from(entities).where(eq(entities.id, parsed.data.entityId)).limit(1);
  if (!entity) return NextResponse.json({ message: "This listing no longer exists." }, { status: 404 });

  const [review] = await database.insert(reviews).values({
    entityId: parsed.data.entityId,
    userId: user.id,
    reviewerName: user.name,
    rating: parsed.data.rating,
    title: parsed.data.title,
    body: parsed.data.body,
    firstHandExperience: 1,
    publicDisplayMode: parsed.data.publicDisplayMode,
    experienceDate: parsed.data.experienceDate ? new Date(parsed.data.experienceDate) : null,
  }).returning({ id: reviews.id });

  return NextResponse.json({ id: review.id }, { status: 201 });
}