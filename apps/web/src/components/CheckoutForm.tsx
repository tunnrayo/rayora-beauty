"use client";

import { useActionState, useState } from "react";
import { placeOrderAction } from "@/actions/checkout";
import { formatKobo } from "@/lib/format";
import { NIGERIAN_STATES } from "@/lib/states";
import type { Cart } from "@/lib/session";
import FormMessage from "./FormMessage";
import SubmitButton from "./SubmitButton";

const input = "h-11 w-full rounded-lg border border-blush bg-ivory px-3 text-sm";

export default function CheckoutForm({ cart, defaults, demoMode }: {
  cart: Cart;
  defaults: { name: string; email: string; phone: string };
  demoMode: boolean;
}) {
  const [state, action] = useActionState(placeOrderAction, undefined);
  const [stateName, setStateName] = useState("");
  const fee = !stateName ? null : stateName === "Lagos" ? cart.fees.lagosKobo : cart.fees.otherKobo;

  return (
    <form action={action} className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <FormMessage error={state?.error} />
        <h2 className="text-2xl font-semibold">Delivery details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="customerName" className="mb-1 block text-sm font-medium">Full name</label>
            <input id="customerName" name="customerName" required defaultValue={defaults.name} autoComplete="name" className={input} />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" required defaultValue={defaults.email} autoComplete="email" className={input} />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium">Phone number</label>
            <input id="phone" name="phone" type="tel" required defaultValue={defaults.phone} autoComplete="tel" className={input} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address" className="mb-1 block text-sm font-medium">Delivery address</label>
            <input id="address" name="address" required autoComplete="street-address" className={input} />
          </div>
          <div>
            <label htmlFor="city" className="mb-1 block text-sm font-medium">City</label>
            <input id="city" name="city" required autoComplete="address-level2" className={input} />
          </div>
          <div>
            <label htmlFor="state" className="mb-1 block text-sm font-medium">State</label>
            <select id="state" name="state" required value={stateName} onChange={(e) => setStateName(e.target.value)} className={input}>
              <option value="">Choose your state</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="country" className="mb-1 block text-sm font-medium">Country</label>
            <input id="country" name="country" defaultValue="Nigeria" readOnly className={`${input} bg-cream`} />
          </div>
          <div>
            <label htmlFor="couponCode" className="mb-1 block text-sm font-medium">Coupon code (optional)</label>
            <input id="couponCode" name="couponCode" autoCapitalize="characters" className={input} />
          </div>
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-blush bg-ivory p-5">
        <h2 className="text-2xl font-semibold">Order summary</h2>
        <ul className="mt-3 divide-y divide-blush text-sm">
          {cart.items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-3 py-2">
              <span>{i.name} <span className="text-cocoa">× {i.quantity}</span></span>
              <span>{formatKobo(i.lineTotalKobo)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-blush pt-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatKobo(cart.subtotalKobo)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{fee === null ? "Choose a state" : formatKobo(fee)}</dd></div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt><dd>{fee === null ? formatKobo(cart.subtotalKobo) : formatKobo(cart.subtotalKobo + fee)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-cocoa">Any coupon is applied when you place the order.</p>
        {demoMode && (
          <p className="mt-3 rounded-xl bg-blush px-3 py-2 text-xs">
            Payment is a demo. No real money is taken, but a real order is created.
          </p>
        )}
        <div className="mt-4">
          <SubmitButton className="btn-primary w-full" pendingText="Placing your order...">
            Continue to payment
          </SubmitButton>
        </div>
      </aside>
    </form>
  );
}
