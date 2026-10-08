import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import OrderDetail from "@/components/OrderDetail";
import { apiCall, requireUser, type Order } from "@/lib/session";

export const metadata: Metadata = { title: "Order confirmation" };

export default async function ConfirmationPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  await requireUser(`/order-confirmation/${orderNumber}`);
  const r = await apiCall<Order>(`/orders/${orderNumber}`, { auth: true });
  if (!r.data) notFound();
  if (r.data.paymentStatus !== "paid") redirect(`/checkout/pay/${orderNumber}`);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-semibold">Thank you, {r.data.customerName.split(" ")[0]}</h1>
      <p className="mt-2 text-cocoa">
        Your order <strong>{r.data.orderNumber}</strong> is confirmed. We have sent the details to {r.data.email}.
      </p>
      <div className="mt-6"><OrderDetail order={r.data} /></div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/account/orders/${r.data.orderNumber}`} className="btn-primary">Track this order</Link>
        <Link href="/shop" className="btn-secondary">Continue shopping</Link>
      </div>
    </div>
  );
}
