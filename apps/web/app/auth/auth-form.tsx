"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signUp } from "./actions";

function SubmitButton({ pending, label }: { pending: boolean; label: string }) { return <button className="button button-primary auth-submit" disabled={pending}>{pending ? "Please wait…" : label}</button>; }

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "signup" ? signUp : signIn;
  const [state, formAction, pending] = useActionState(action, undefined);
  return <div className="auth-card">
    <div className="auth-tabs"><Link className={mode === "login" ? "active" : ""} href="/auth?mode=login">Sign in</Link><Link className={mode === "signup" ? "active" : ""} href="/auth?mode=signup">Create account</Link></div>
    <div className="auth-copy"><p className="eyebrow">{mode === "signup" ? "Join the community" : "Welcome back"}</p><h1>{mode === "signup" ? "Create your account" : "Sign in to continue"}</h1><p>{mode === "signup" ? "Write reviews and manage your contributions." : "Access your reviews and account dashboard."}</p></div>
    <form action={formAction} className="auth-form">
      {mode === "signup" && <><label htmlFor="name">Full name</label><input id="name" name="name" required minLength={2} maxLength={80} autoComplete="name" />{state?.errors?.name && <small className="field-error">{state.errors.name[0]}</small>}</>}
      <label htmlFor="email">Email address</label><input id="email" name="email" required type="email" autoComplete="email" />{state?.errors?.email && <small className="field-error">{state.errors.email[0]}</small>}
      <label htmlFor="password">Password</label><input id="password" name="password" required type="password" minLength={mode === "signup" ? 8 : 1} autoComplete={mode === "signup" ? "new-password" : "current-password"} />{state?.errors?.password && <small className="field-error">{state.errors.password[0]}</small>}
      {mode === "signup" && <small className="password-hint">Use at least 8 characters with a letter and number.</small>}
      {state?.message && <p className="form-message error" role="alert">{state.message}</p>}
      <SubmitButton pending={pending} label={mode === "signup" ? "Create account" : "Sign in"} />
    </form>
  </div>;
}