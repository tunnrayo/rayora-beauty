"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { apiCall, CART_COOKIE, getToken } from "@/lib/session";
import type { FormState } from "./auth";

async function origin(): Promise<string> {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
}

async function sendToPayment(orderNumber: string): Promise<FormState> {
  const config = await apiCall<{ mode: "demo" | "paystack" }>("/payments/config");
  if (config.data?.mode === "paystack") {
    const r = await apiCall<{ authorizationUrl: string }>("/payments/paystack/initialize", {
      method: "POST",
      auth: true,
      body: { orderNumber, callbackUrl: `${await origin()}/payment/callback` },
    });
    if (!r.data) return { error: r.error ?? "We could not start your payment." };
    redirect(r.data.authorizationUrl);
  }
  redirect(`/checkout/pay/${orderNumber}`);
}

export async function placeOrderAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await getToken())) redirect("/login?next=/checkout");
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return { error: "Your cart is empty." };

  const field = (name: string) => String(formData.get(name) ?? "").trim();
  const r = await apiCall<{ orderNumber: string }>("/orders", {
    method: "POST",
    auth: true,
    body: {
      cartId,
      couponCode: field("couponCode") || undefined,
      customerName: field("customerName"),
      email: field("email"),
      phone: field("phone"),
      address: field("address"),
      city: field("city"),
      state: field("state"),
      country: field("country") || "Nigeria",
    },
  });
  if (!r.data) return { error: r.error ?? "We could not place your order." };

  void apiCall("/analytics/event", { method: "POST", body: { type: "checkout_start", sessionId: cartId } });
  return sendToPayment(r.data.orderNumber);
}

export async function payDemoAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const orderNumber = String(formData.get("orderNumber") ?? "");
  const r = await apiCall("/payments/demo/confirm", { method: "POST", auth: true, body: { orderNumber } });
  if (!r.ok) return { error: r.error ?? "The demo payment did not go through." };
  redirect(`/order-confirmation/${orderNumber}`);
}

export async function payOnlineAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return sendToPayment(String(formData.get("orderNumber") ?? ""));
}
