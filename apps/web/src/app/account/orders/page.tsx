import type { Metadata } from "next";
import Link from "next/link";
import Notice from "@/components/Notice";
import StatusBadge from "@/components/StatusBadge";
import { formatKobo } from "@/lib/format";
import { apiCall, requireUser, type Order } from "@/lib/session";

export const metadata: Metadata = { title: "My orders" };

export default async function OrdersPage() {
  await requireUser("/account/orders");
  const r = await apiCall<{ items: Order[] }>("/orders/mine", { auth: true });
  if (!r.data) return <Notice title="We could not load your orders" message="Please refresh in a moment." actionHref="/account" actionLabel="Back to account" />;
  if (r.data.items.length === 0)
    return <Notice title="No orders yet" message="When you place an order, you can follow it here." actionHref="/shop" actionLabel="Start shopping" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-semibold">My orders</h1>
      <ul className="mt-6 divide-y divide-blush rounded-2xl border border-blush bg-ivory">
        {r.data.items.map((o) => (
          <li key={o.orderNumber}>
            <Link href={`/account/orders/${o.orderNumber}`} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm hover:bg-blush/30">
              <span>
                <strong>{o.orderNumber}</strong>
                <br />
                <span className="text-cocoa">
                  {new Date(o.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })} · {o.items.length} {o.items.length === 1 ? "item" : "items"}
                </span>
              </span>
              <span className="flex items-center gap-3"><StatusBadge status={o.status} />{formatKobo(o.totalKobo)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
