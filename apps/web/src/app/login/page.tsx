import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getSession, safeNext } from "@/lib/session";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next || "/account");
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-center text-4xl font-semibold">Welcome back</h1>
      <AuthForm mode="login" next={next} />
    </div>
  );
}
