import type { Metadata } from "next";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { formatKobo } from "@/lib/format";
import { apiCall, requireAdminUser, type Order } from "@/lib/session";

export const metadata: Metadata = { title: "Orders" };
const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdminUser();
  const { status } = await searchParams;
  const r = await apiCall<{ items: Order[] }>(`/orders/admin/all${status ? `?status=${encodeURIComponent(status)}` : ""}`, { auth: true });
  const items = r.data?.items ?? [];
  const tab = (active: boolean) => `rounded-full px-4 py-2 text-sm ${active ? "bg-charcoal text-ivory" : "border border-blush bg-ivory"}`;
  return (
    <div>
      <h1 className="text-4xl font-semibold">Orders</h1>
      <nav aria-label="Filter orders" className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin/orders" className={tab(!status)}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={`${tab(status === s)} capitalize`}>{s}</Link>
        ))}
      </nav>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-blush bg-ivory">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-xs text-cocoa"><tr><th className="p-3">Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="p-4 text-cocoa">No orders found.</td></tr>}
            {items.map((o) => (
              <tr key={o.orderNumber} className="border-t border-blush">
                <td className="p-3"><Link href={`/admin/orders/${o.orderNumber}`} className="underline underline-offset-4">{o.orderNumber}</Link>{o.isDemo && <span className="ml-2 rounded-full bg-blush px-2 py-0.5 text-[10px]">demo</span>}</td>
                <td>{o.customerName}</td>
                <td>{new Date(o.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</td>
                <td>{formatKobo(o.totalKobo)}</td>
                <td className="capitalize">{o.paymentStatus}</td>
                <td><StatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
