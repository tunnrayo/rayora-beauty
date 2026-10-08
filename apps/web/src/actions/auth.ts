"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiCall, safeNext, TOKEN_COOKIE, type User } from "@/lib/session";

export type FormState = { error?: string; ok?: string } | undefined;

async function startSession(token: string) {
  (await cookies()).set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const next = safeNext(String(formData.get("next") ?? ""));
  const r = await apiCall<{ token: string; user: User }>("/users/login", {
    method: "POST",
    body: { email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") },
  });
  if (!r.data) return { error: r.error ?? "We could not log you in." };
  await startSession(r.data.token);
  redirect(next || (r.data.user.role === "admin" ? "/admin" : "/account"));
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const next = safeNext(String(formData.get("next") ?? ""));
  const r = await apiCall<{ token: string; user: User }>("/users/register", {
    method: "POST",
    body: {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      phone: String(formData.get("phone") ?? "") || undefined,
    },
  });
  if (!r.data) return { error: r.error ?? "We could not create your account." };
  await startSession(r.data.token);
  redirect(next || "/account");
}

export async function logoutAction() {
  (await cookies()).delete(TOKEN_COOKIE);
  redirect("/");
}
