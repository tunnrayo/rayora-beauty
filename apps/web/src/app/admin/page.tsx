import type { Metadata } from "next";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { formatKobo } from "@/lib/format";
import { apiCall, requireAdminUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

type Dashboard = {
  includeDemo: boolean; salesKobo: number; paidOrders: number; customers: number; products: number; orders: number; demoOrders: number;
  salesByDay: { day: string; salesKobo: number; orders: number }[];
  topProducts: { name: string; units: number; revenueKobo: number }[];
  statusSummary: { status: string; count: number }[];
  recentOrders: { orderNumber: string; customerName: string; totalKobo: number; status: string; isDemo: boolean; createdAt: string }[];
  lowStock: { id: string; name: string; stock: number }[];
  traffic: { pageViews: number; sessions: number; addToCart: number; checkoutStarts: number; conversionPercent: number };
  abandonedCarts: number;
};

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  await requireAdminUser();
  const { demo } = await searchParams;
  const hideDemo = demo === "hide";
  const r = await apiCall<Dashboard>(`/analytics/dashboard?demo=${hideDemo ? "hide" : "show"}`, { auth: true });
  if (!r.data) return <p role="alert" className="rounded-xl bg-rose-dark px-4 py-3 text-sm text-ivory">{r.error}</p>;
  const d = r.data;
  const maxSales = Math.max(...d.salesByDay.map((x) => x.salesKobo), 1);

  const card = "rounded-2xl border border-blush bg-ivory p-4";
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-semibold">Dashboard</h1>
        <Link href={hideDemo ? "/admin" : "/admin?demo=hide"} className="btn-secondary">
          {hideDemo ? "Show demo orders" : "Hide demo orders"}
        </Link>
      </div>
      {!hideDemo && d.demoOrders > 0 && (
        <p className="rounded-xl bg-blush px-4 py-3 text-sm">Figures include {d.demoOrders} demo orders, which are marked as demo. Hide them to see real sales only.</p>
      )}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Key numbers">
        <div className={card}><p className="text-xs text-cocoa">Total sales (paid)</p><p className="mt-1 text-2xl font-semibold">{formatKobo(d.salesKobo)}</p></div>
        <div className={card}><p className="text-xs text-cocoa">Total orders</p><p className="mt-1 text-2xl font-semibold">{d.orders}</p></div>
        <div className={card}><p className="text-xs text-cocoa">Customers</p><p className="mt-1 text-2xl font-semibold">{d.customers}</p></div>
        <div className={card}><p className="text-xs text-cocoa">Products</p><p className="mt-1 text-2xl font-semibold">{d.products}</p></div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className={card}>
          <h2 className="text-2xl font-semibold">Sales by day (last 14 days)</h2>
          <ul className="mt-3 space-y-1.5 text-xs">
            {d.salesByDay.map((x) => (
              <li key={x.day} className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-cocoa">{x.day.slice(5)}</span>
                <span className="h-3 rounded bg-rose" style={{ width: `${Math.max((x.salesKobo / maxSales) * 100, x.salesKobo ? 2 : 0)}%` }} />
                <span>{x.salesKobo ? formatKobo(x.salesKobo) : "·"}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={card}>
          <h2 className="text-2xl font-semibold">Visitors (last 30 days)</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-cocoa">Page views</dt><dd className="text-xl font-semibold">{d.traffic.pageViews}</dd></div>
            <div><dt className="text-xs text-cocoa">Visits</dt><dd className="text-xl font-semibold">{d.traffic.sessions}</dd></div>
            <div><dt className="text-xs text-cocoa">Added to cart</dt><dd className="text-xl font-semibold">{d.traffic.addToCart}</dd></div>
            <div><dt className="text-xs text-cocoa">Started checkout</dt><dd className="text-xl font-semibold">{d.traffic.checkoutStarts}</dd></div>
            <div><dt className="text-xs text-cocoa">Conversion (orders per visit)</dt><dd className="text-xl font-semibold">{d.traffic.conversionPercent}%</dd></div>
            <div><dt className="text-xs text-cocoa">Abandoned carts</dt><dd className="text-xl font-semibold">{d.abandonedCarts}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-cocoa">Abandoned means a cart with items that has been left alone for over an hour.</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className={card}>
          <h2 className="text-2xl font-semibold">Order status</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {d.statusSummary.length === 0 && <li className="text-cocoa">No orders yet.</li>}
            {d.statusSummary.map((s) => (
              <li key={s.status} className="flex items-center justify-between"><StatusBadge status={s.status} /><span>{s.count}</span></li>
            ))}
          </ul>
        </div>
        <div className={card}>
          <h2 className="text-2xl font-semibold">Top products</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {d.topProducts.length === 0 && <li className="text-cocoa">No sales yet.</li>}
            {d.topProducts.map((p) => (
              <li key={p.name} className="flex justify-between gap-2"><span>{p.name}</span><span className="text-cocoa">{p.units} sold</span></li>
            ))}
          </ol>
        </div>
        <div className={card}>
          <h2 className="text-2xl font-semibold">Low stock</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {d.lowStock.length === 0 && <li className="text-cocoa">Everything is well stocked.</li>}
            {d.lowStock.map((p) => (
              <li key={p.id} className="flex justify-between gap-2"><span>{p.name}</span><span className="text-rose-dark">{p.stock} left</span></li>
            ))}
          </ul>
          <Link href="/admin/inventory" className="mt-3 block text-sm underline underline-offset-4">Manage inventory</Link>
        </div>
      </section>

      <section className={card}>
        <h2 className="text-2xl font-semibold">Recent orders</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="text-xs text-cocoa"><tr><th className="py-2">Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {d.recentOrders.map((o) => (
                <tr key={o.orderNumber} className="border-t border-blush">
                  <td className="py-2"><Link href={`/admin/orders/${o.orderNumber}`} className="underline underline-offset-4">{o.orderNumber}</Link>{o.isDemo && <span className="ml-2 rounded-full bg-blush px-2 py-0.5 text-[10px]">demo</span>}</td>
                  <td>{o.customerName}</td><td>{formatKobo(o.totalKobo)}</td><td><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
