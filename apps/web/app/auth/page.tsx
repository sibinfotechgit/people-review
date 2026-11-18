import { count } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getDatabase } from "@/db/database";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import AuthForm from "./auth-form";

export const dynamic = "force-dynamic";
type AuthPageProps = { searchParams: Promise<{ mode?: string }> };

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const currentUser = await getCurrentUser();
  if (currentUser) redirect(currentUser.role === "admin" ? "/admin" : "/account");
  const mode = (await searchParams).mode === "signup" ? "signup" : "login";
  const [stats] = await getDatabase().select({ value: count() }).from(users);
  return <main className="auth-page"><header className="auth-header"><Link className="brand" href="/"><span className="brand-mark">P</span><span>Public Review</span></Link><Link className="back-link" href="/">← Back to reviews</Link></header><div className="auth-shell"><section className="auth-side"><p className="eyebrow">Your opinion has value</p><h2>Share useful experiences. Help people decide.</h2><div className="auth-benefit"><span>✓</span><div><strong>Manage your reviews</strong><p>See and control everything you have published.</p></div></div><div className="auth-benefit"><span>✓</span><div><strong>Keep your identity flexible</strong><p>Publish with your name or choose anonymous mode.</p></div></div>{Number(stats.value) === 0 && <div className="bootstrap-note"><strong>Admin setup</strong><p>The first account created becomes the administrator.</p></div>}</section><AuthForm mode={mode} /></div></main>;
}