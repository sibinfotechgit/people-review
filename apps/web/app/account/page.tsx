import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { getDatabase } from "@/db/database";
import { entities, reviews } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";
import { deleteOwnReview } from "./actions";

export const dynamic = "force-dynamic";
export default async function AccountPage() {
  const user = await requireUser();
  const items = await getDatabase().select({ review: reviews, entityName: entities.canonicalName, entitySlug: entities.slug }).from(reviews).innerJoin(entities, eq(reviews.entityId, entities.id)).where(eq(reviews.userId, user.id)).orderBy(desc(reviews.createdAt));
  return <main className="dashboard-page"><aside className="dashboard-sidebar"><Link className="brand dashboard-brand" href="/"><span className="brand-mark">P</span><span>Public Review</span></Link><nav><Link className="active" href="/account">My reviews</Link>{user.role === "admin" && <Link href="/admin">Admin panel</Link>}<Link href="/">Discover</Link></nav><form action={signOut}><button className="sidebar-signout">Sign out</button></form></aside><section className="dashboard-main"><header className="dashboard-top"><div><p className="eyebrow">Your account</p><h1>Hello, {user.name}</h1><p>{user.email}</p></div><div className="user-badge">{user.role}</div></header><div className="dashboard-section"><div className="section-title"><div><h2>My reviews</h2><p>Manage the reviews you have published.</p></div><Link className="button button-primary" href="/">Write a review</Link></div>{items.length ? <div className="manage-list">{items.map(({ review, entityName, entitySlug }) => <article className="manage-row" key={review.id}><div className="manage-score">{review.rating}<span>★</span></div><div><Link href={`/entities/${entitySlug}`}><strong>{entityName}</strong></Link><h3>{review.title}</h3><p>{review.body}</p><small>{new Intl.DateTimeFormat("en-IN", { dateStyle:"medium" }).format(review.createdAt)} · {review.status}</small></div><form action={deleteOwnReview}><input type="hidden" name="reviewId" value={review.id} /><button className="danger-link" type="submit">Delete</button></form></article>)}</div> : <div className="empty-state"><h3>You have not written a review yet</h3><p>Find something you know and share a useful experience.</p><Link className="button button-primary" href="/">Explore listings</Link></div>}</div></section></main>;
}