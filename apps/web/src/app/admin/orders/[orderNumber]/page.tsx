import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOrderStatusAction } from "@/actions/admin";
import Flash from "@/components/admin/Flash";
import OrderDetail from "@/components/OrderDetail";
import SubmitButton from "@/components/SubmitButton";
import { apiCall, requireAdminUser, type Order } from "@/lib/session";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Order" };
const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default async function AdminOrder({ params, searchParams }: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdminUser();
  const { orderNumber } = await params;
  const { saved, error } = await searchParams;
  const r = await apiCall<Order>(`/orders/${encodeURIComponent(orderNumber)}`, { auth: true });
  if (!r.data) notFound();
  const o = r.data;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="text-sm underline underline-offset-4">← All orders</Link>
      <h1 className="mt-2 text-4xl font-semibold">Order {o.orderNumber}</h1>
      <div className="mt-4"><Flash error={error} saved={saved} /></div>

      <form action={updateOrderStatusAction} className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-blush bg-ivory p-4">
        <input type="hidden" name="orderNumber" value={o.orderNumber} />
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium">Order status</label>
          <select id="status" name="status" defaultValue={o.status} className="h-11 rounded-lg border border-blush bg-cream px-3 text-sm capitalize">
            {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>
        <SubmitButton pendingText="Updating...">Update status</SubmitButton>
        <a
          href={whatsappLink(o.phone, `Hello ${o.customerName.split(" ")[0]}, your Rayora Beauty order ${o.orderNumber} is now ${o.status}.`)}
          target="_blank" rel="noopener noreferrer" className="btn-secondary"
        >
          Message on WhatsApp
        </a>
        <p className="w-full text-xs text-cocoa">The customer sees the new status in their account straight away. Cancelling an order puts its items back in stock.</p>
      </form>

      <OrderDetail order={o} />
    </div>
  );
}
