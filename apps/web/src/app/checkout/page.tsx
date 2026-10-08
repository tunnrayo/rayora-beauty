import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { apiCall, getCart, requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const cart = await getCart();
  if (!cart || cart.items.length === 0) redirect("/cart");

  const config = await apiCall<{ mode: "demo" | "paystack" }>("/payments/config");
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-4xl font-semibold">Checkout</h1>
      <CheckoutForm
        cart={cart}
        demoMode={config.data?.mode !== "paystack"}
        defaults={{ name: user.fullName, email: user.email, phone: user.phone ?? "" }}
      />
    </div>
  );
}
