import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";

export default async function AccountNav() {
  const user = await getCurrentUser();
  if (!user) return <Link className="button button-secondary" href="/auth?mode=login">Sign in</Link>;
  return <div className="account-nav"><Link href={user.role === "admin" ? "/admin" : "/account"}><span>{user.name.slice(0,1)}</span>{user.name}</Link><form action={signOut}><button type="submit">Sign out</button></form></div>;
}