import { and, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getDatabase } from "@/db/database";
import { entities, reviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import ReviewForm from "./review-form";

export const dynamic = "force-dynamic";
type EntityPageProps = { params: Promise<{ slug: string }> };

async function getEntity(slug: string) {
  const [entity] = await getDatabase().select().from(entities).where(eq(entities.slug, slug)).limit(1);
  return entity;
}

export async function generateMetadata({ params }: EntityPageProps): Promise<Metadata> {
  const entity = await getEntity((await params).slug);
  return { title: entity?.canonicalName ?? "Review" };
}

export default async function EntityPage({ params }: EntityPageProps) {
  const entity = await getEntity((await params).slug);
  if (!entity) notFound();
  const currentUser = await getCurrentUser();
  const publishedReviews = await getDatabase().select().from(reviews)
    .where(and(eq(reviews.entityId, entity.id), eq(reviews.status, "published"))).orderBy(desc(reviews.createdAt));
  const average = publishedReviews.length ? publishedReviews.reduce((sum, review) => sum + review.rating, 0) / publishedReviews.length : 0;
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({ rating, count: publishedReviews.filter((review) => review.rating === rating).length }));
  const metadata = entity.metadata as { category?: string; location?: string; verified?: boolean };

  return <main>
    <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">P</span><span>Public Review</span></Link><Link className="back-link" href="/">← Back to discover</Link></header>
    <section className="profile-hero">
      <div className={`entity-avatar profile-avatar avatar-${entity.type}`}>{entity.canonicalName.slice(0, 1)}</div>
      <div className="profile-title"><div className="profile-tags"><span>{metadata.category ?? entity.type.replaceAll("_", " ")}</span>{metadata.verified && <span className="verified">✓ Verified listing</span>}</div><h1>{entity.canonicalName}</h1><p>{entity.description}</p>{metadata.location && <p className="location">⌖ {metadata.location}</p>}</div>
      <a className="button button-primary" href="#write-review">Write a review</a>
    </section>

    <div className="profile-layout">
      <section className="reviews-column">
        <div className="rating-summary">
          <div className="overall-score"><strong>{average ? average.toFixed(1) : "—"}</strong><span className="stars">{"★★★★★".slice(0, Math.round(average))}<i>{"★★★★★".slice(Math.round(average))}</i></span><small>Based on {publishedReviews.length} reviews</small></div>
          <div className="rating-bars">{distribution.map(({ rating, count }) => <div className="rating-bar" key={rating}><span>{rating}</span><span>★</span><div><i style={{ width: `${publishedReviews.length ? count / publishedReviews.length * 100 : 0}%` }} /></div><small>{count}</small></div>)}</div>
        </div>
        <div className="reviews-heading"><h2>Community reviews</h2><span>Newest first</span></div>
        <div className="review-list">{publishedReviews.length ? publishedReviews.map((review) => <article className="review-card" key={review.id}>
          <div className="review-top"><div className="reviewer-avatar">{review.publicDisplayMode === "anonymous" ? "A" : review.reviewerName.slice(0, 1)}</div><div><strong>{review.publicDisplayMode === "anonymous" ? "Anonymous" : review.reviewerName}</strong><small>{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(review.createdAt)}</small></div><span className="review-rating">{review.rating.toFixed(1)} ★</span></div>
          <h3>{review.title}</h3><p>{review.body}</p><span className="experience-badge">✓ First-hand experience</span>
        </article>) : <div className="empty-state compact"><h3>Be the first to review</h3><p>Share a helpful, first-hand experience with this listing.</p></div>}</div>
      </section>
      <aside className="review-form-wrap" id="write-review"><ReviewForm entityId={entity.id} entityName={entity.canonicalName} user={currentUser ? { name: currentUser.name } : null} /></aside>
    </div>
  </main>;
}