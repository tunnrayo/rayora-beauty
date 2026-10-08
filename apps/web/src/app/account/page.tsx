import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import StatusBadge from "@/components/StatusBadge";
import { formatKobo } from "@/lib/format";
import { apiCall, requireUser, type Order } from "@/lib/session";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requireUser("/account");
  const orders = await apiCall<{ items: Order[] }>("/orders/mine", { auth: true });
  const recent = orders.data?.items.slice(0, 3) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-semibold">Hello, {user.fullName.split(" ")[0]}</h1>
      <section className="mt-6 rounded-2xl border border-blush bg-ivory p-5 text-sm">
        <h2 className="text-2xl font-semibold">Your profile</h2>
        <p className="mt-2">{user.fullName}</p>
        <p className="text-cocoa">{user.email}</p>
        {user.phone && <p className="text-cocoa">{user.phone}</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/account/orders" className="btn-secondary">My orders</Link>
          <Link href="/account/wishlist" className="btn-secondary">Wishlist</Link>
          {user.role === "admin" && <Link href="/admin" className="btn-secondary">Admin portal</Link>}
          <form action={logoutAction}><button type="submit" className="btn-primary">Log out</button></form>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold">Recent orders</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-cocoa">You have not placed an order yet. <Link href="/shop" className="underline">Start shopping</Link>.</p>
        ) : (
          <ul className="mt-3 divide-y divide-blush rounded-2xl border border-blush bg-ivory">
            {recent.map((o) => (
              <li key={o.orderNumber}>
                <Link href={`/account/orders/${o.orderNumber}`} className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-blush/30">
                  <span><strong>{o.orderNumber}</strong><br /><span className="text-cocoa">{new Date(o.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</span></span>
                  <span className="flex items-center gap-3"><StatusBadge status={o.status} />{formatKobo(o.totalKobo)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
