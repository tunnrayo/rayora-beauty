import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrderDetail from "@/components/OrderDetail";
import { apiCall, requireUser, type Order } from "@/lib/session";

export const metadata: Metadata = { title: "Order details" };

export default async function OrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  await requireUser(`/account/orders/${orderNumber}`);
  // The API only returns the order if it belongs to this customer.
  const r = await apiCall<Order>(`/orders/${encodeURIComponent(orderNumber)}`, { auth: true });
  if (!r.data) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/account/orders" className="text-sm underline underline-offset-4">← All orders</Link>
      <h1 className="mt-2 text-4xl font-semibold">Order {r.data.orderNumber}</h1>
      <div className="mt-6"><OrderDetail order={r.data} /></div>
      {r.data.paymentStatus !== "paid" && r.data.status !== "cancelled" && (
        <Link href={`/checkout/pay/${r.data.orderNumber}`} className="btn-primary mt-6">Complete payment</Link>
      )}
    </div>
  );
}
