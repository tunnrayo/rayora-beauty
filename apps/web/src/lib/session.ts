import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API = process.env.API_URL ?? "http://localhost:4000";

export const TOKEN_COOKIE = "rb_token";
export const CART_COOKIE = "rb_cart";

export type User = { id: string; email: string; fullName: string; phone: string | null; role: "customer" | "admin" };

export type ApiResult<T> = { ok: boolean; status: number; data: T | null; error: string | null };

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(TOKEN_COOKIE)?.value;
}

/** Calls the Rayora API from the server. The browser never talks to the API directly. */
export async function apiCall<T = any>(
  path: string,
  opts: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${API}/api/v1${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
    });
    let json: any = null;
    if (res.status !== 204) {
      try { json = await res.json(); } catch { json = null; }
    }
    return {
      ok: res.ok,
      status: res.status,
      data: res.ok ? (json as T) : null,
      error: res.ok ? null : (json?.error ?? "Something went wrong. Please try again."),
    };
  } catch {
    return { ok: false, status: 0, data: null, error: "We could not reach the store service. Please try again." };
  }
}

export const getSession = cache(async (): Promise<User | null> => {
  if (!(await getToken())) return null;
  const r = await apiCall<User>("/users/me", { auth: true });
  return r.data;
});

export async function requireUser(next: string): Promise<User> {
  const user = await getSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdminUser(): Promise<User> {
  const user = await getSession();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/");
  return user;
}

/** Only allows redirects to pages on this site. */
export function safeNext(value: string | null | undefined, fallback = ""): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return fallback;
}

export type CartLine = {
  productId: string; quantity: number; slug: string; name: string; size: string; priceKobo: number;
  stock: number; status: string; imageUrl: string | null; categoryName: string; lineTotalKobo: number;
};
export type Cart = {
  id: string; items: CartLine[]; subtotalKobo: number; itemCount: number;
  fees: { lagosKobo: number; otherKobo: number };
};

export async function getCart(): Promise<Cart | null> {
  const id = (await cookies()).get(CART_COOKIE)?.value;
  if (!id) return null;
  const r = await apiCall<Cart>(`/cart/${id}`);
  return r.data;
}

export type OrderItem = { name: string; quantity: number; unitPriceKobo: number; slug: string | null; imageUrl: string | null };
export type Order = {
  orderNumber: string; customerName: string; email: string; phone: string; address: string; city: string; state: string;
  country: string; subtotalKobo: number; deliveryFeeKobo: number; discountKobo: number; totalKobo: number; status: string;
  paymentStatus: string; isDemo: boolean; createdAt: string; items: OrderItem[];
};
