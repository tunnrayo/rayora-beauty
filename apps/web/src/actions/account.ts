"use server";

import { redirect } from "next/navigation";
import { apiCall, getToken } from "@/lib/session";
import type { FormState } from "./auth";

export async function toggleWishlistAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const returnTo = formData.get("returnTo") === "wishlist" ? "/account/wishlist" : `/product/${slug}`;
  if (!(await getToken())) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  const wished = formData.get("wished") === "1";
  await apiCall(`/users/wishlist/${productId}`, { method: wished ? "DELETE" : "POST", auth: true });
  redirect(returnTo);
}

export async function reviewAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const slug = String(formData.get("slug") ?? "");
  if (!(await getToken())) redirect(`/login?next=${encodeURIComponent(`/product/${slug}`)}`);
  const r = await apiCall(`/products/${encodeURIComponent(slug)}/reviews`, {
    method: "POST",
    auth: true,
    body: {
      rating: Number(formData.get("rating")),
      title: String(formData.get("title") ?? ""),
      body: String(formData.get("body") ?? ""),
    },
  });
  if (!r.ok) return { error: r.error ?? "We could not save your review." };
  return { ok: "Thank you for your review." };
}
