"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiCall, CART_COOKIE } from "@/lib/session";

async function ensureCart(forceNew = false): Promise<string | null> {
  const jar = await cookies();
  const existing = jar.get(CART_COOKIE)?.value;
  if (existing && !forceNew) return existing;
  const r = await apiCall<{ id: string }>("/cart", { method: "POST" });
  if (!r.data) return null;
  jar.set(CART_COOKIE, r.data.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
  return r.data.id;
}

const clampQty = (raw: FormDataEntryValue | null, min: number) => {
  const n = Math.floor(Number(raw));
  return Number.isFinite(n) ? Math.max(min, Math.min(20, n)) : min;
};

export async function addToCartAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const quantity = clampQty(formData.get("quantity"), 1);
  const buyNow = formData.get("intent") === "buy";
  const back = (msg: string) => redirect(`/product/${encodeURIComponent(slug)}?cartError=${encodeURIComponent(msg)}`);

  let cartId = await ensureCart();
  if (!cartId) return back("We could not start your cart. Please try again.");

  let r = await apiCall<{ notice?: string }>(`/cart/${cartId}/items`, { method: "POST", body: { productId, quantity } });
  if (r.status === 404 && r.error === "Cart not found.") {
    cartId = await ensureCart(true);
    if (!cartId) return back("We could not start your cart. Please try again.");
    r = await apiCall(`/cart/${cartId}/items`, { method: "POST", body: { productId, quantity } });
  }
  if (!r.ok) return back(r.error ?? "We could not add that to your cart.");

  void apiCall("/analytics/event", { method: "POST", body: { type: "add_to_cart", productId, sessionId: cartId } });

  if (buyNow) redirect("/checkout");
  redirect(r.data?.notice ? `/cart?notice=${encodeURIComponent(r.data.notice)}` : "/cart");
}

export async function setQuantityAction(formData: FormData) {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  const productId = String(formData.get("productId") ?? "");
  if (!cartId) redirect("/cart");
  const r = await apiCall<{ notice?: string }>(`/cart/${cartId}/items/${productId}`, {
    method: "PUT",
    body: { quantity: clampQty(formData.get("quantity"), 0) },
  });
  const message = r.ok ? r.data?.notice : r.error;
  redirect(message ? `/cart?notice=${encodeURIComponent(message)}` : "/cart");
}

export async function removeFromCartAction(formData: FormData) {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  const productId = String(formData.get("productId") ?? "");
  if (cartId) await apiCall(`/cart/${cartId}/items/${productId}`, { method: "DELETE" });
  redirect("/cart");
}
