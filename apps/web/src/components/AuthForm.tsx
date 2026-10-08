"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction } from "@/actions/auth";
import FormMessage from "./FormMessage";
import SubmitButton from "./SubmitButton";

const input = "h-11 w-full rounded-lg border border-blush bg-ivory px-3 text-sm";

export default function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const [state, action] = useActionState(mode === "login" ? loginAction : registerAction, undefined);
  const suffix = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form action={action} className="mx-auto mt-6 max-w-md space-y-4 rounded-2xl border border-blush bg-ivory p-6">
      <input type="hidden" name="next" value={next} />
      <FormMessage error={state?.error} />
      {mode === "register" && (
        <div>
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium">Full name</label>
          <input id="fullName" name="fullName" required autoComplete="name" className={input} />
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={input} />
      </div>
      {mode === "register" && (
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">Phone (optional)</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={input} />
        </div>
      )}
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
        <input
          id="password" name="password" type="password" required minLength={mode === "register" ? 8 : 1}
          autoComplete={mode === "login" ? "current-password" : "new-password"} className={input}
        />
        {mode === "register" && <p className="mt-1 text-xs text-cocoa">At least 8 characters.</p>}
      </div>
      <SubmitButton className="btn-primary w-full" pendingText={mode === "login" ? "Logging in..." : "Creating account..."}>
        {mode === "login" ? "Log in" : "Create account"}
      </SubmitButton>
      <p className="text-center text-sm text-cocoa">
        {mode === "login" ? (
          <>New to Rayora Beauty? <Link href={`/register${suffix}`} className="underline">Create an account</Link></>
        ) : (
          <>Already have an account? <Link href={`/login${suffix}`} className="underline">Log in</Link></>
        )}
      </p>
    </form>
  );
}
