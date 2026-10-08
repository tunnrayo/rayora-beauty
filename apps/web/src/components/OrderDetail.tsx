import Link from "next/link";
import type { Order } from "@/lib/session";
import { formatKobo } from "@/lib/format";
import StatusBadge from "./StatusBadge";

const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderDetail({ order }: { order: Order }) {
  const stepIndex = STEPS.indexOf(order.status);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={order.status} />
        <span className="text-sm text-cocoa">
          Placed {new Date(order.createdAt).toLocaleDateString("en-NG", { dateStyle: "long" })}
        </span>
        <span className="text-sm text-cocoa">Payment: {order.paymentStatus}</span>
        {order.isDemo && <span className="rounded-full bg-blush px-3 py-1 text-xs">Demo order</span>}
      </div>

      {order.status === "cancelled" ? (
        <p className="rounded-xl bg-blush px-4 py-3 text-sm">This order was cancelled.</p>
      ) : (
        <ol className="grid grid-cols-5 gap-1 text-center text-[11px] sm:text-xs" aria-label="Order progress">
          {STEPS.map((s, i) => (
            <li key={s} className={`border-t-4 pt-2 capitalize ${i <= stepIndex ? "border-charcoal font-medium" : "border-blush text-cocoa"}`}>
              {s}
            </li>
          ))}
        </ol>
      )}

      <section className="rounded-2xl border border-blush bg-ivory p-5">
        <h2 className="text-2xl font-semibold">Items</h2>
        <ul className="mt-3 divide-y divide-blush">
          {order.items.map((i) => (
            <li key={i.name} className="flex justify-between gap-4 py-3 text-sm">
              <span>
                {i.slug ? <Link href={`/product/${i.slug}`} className="underline underline-offset-4">{i.name}</Link> : i.name}
                <span className="text-cocoa"> × {i.quantity}</span>
              </span>
              <span>{formatKobo(i.unitPriceKobo * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-blush pt-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatKobo(order.subtotalKobo)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{formatKobo(order.deliveryFeeKobo)}</dd></div>
          {order.discountKobo > 0 && (
            <div className="flex justify-between"><dt>Discount</dt><dd>−{formatKobo(order.discountKobo)}</dd></div>
          )}
          <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{formatKobo(order.totalKobo)}</dd></div>
        </dl>
      </section>

      <section className="rounded-2xl border border-blush bg-ivory p-5 text-sm">
        <h2 className="text-2xl font-semibold">Delivery details</h2>
        <p className="mt-2">{order.customerName}</p>
        <p>{order.address}</p>
        <p>{order.city}, {order.state}, {order.country}</p>
        <p className="mt-1 text-cocoa">{order.phone} · {order.email}</p>
      </section>
    </div>
  );
}
