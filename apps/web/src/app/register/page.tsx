import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getSession, safeNext } from "@/lib/session";

export const metadata: Metadata = { title: "Create an account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next || "/account");
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-center text-4xl font-semibold">Create your account</h1>
      <AuthForm mode="register" next={next} />
    </div>
  );
}
