import type { Metadata } from "next";
import Link from "next/link";
import { removeFromCartAction, setQuantityAction } from "@/actions/cart";
import FormMessage from "@/components/FormMessage";
import Notice from "@/components/Notice";
import ProductImage from "@/components/ProductImage";
import QuantityInput from "@/components/QuantityInput";
import SubmitButton from "@/components/SubmitButton";
import { formatKobo } from "@/lib/format";
import { getCart } from "@/lib/session";

export const metadata: Metadata = { title: "Your cart" };

export default async function CartPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const { notice } = await searchParams;
  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    return (
      <Notice
        title="Your cart is empty"
        message="Browse our skincare, makeup, body care and fragrance, and add your favourites here."
        actionHref="/shop"
        actionLabel="Start shopping"
      />
    );
  }

  const problem = cart.items.find((i) => i.stock <= 0 || i.status !== "active" || i.quantity > i.stock);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-4xl font-semibold">Your cart</h1>
      <div className="mt-4"><FormMessage error={notice} /></div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <ul className="divide-y divide-blush">
          {cart.items.map((i) => (
            <li key={i.productId} className="flex gap-4 py-5">
              <div className="w-24 shrink-0">
                <ProductImage name={i.name} category={i.categoryName} imageUrl={i.imageUrl} />
              </div>
              <div className="flex-1">
                <Link href={`/product/${i.slug}`} className="font-medium underline-offset-4 hover:underline">{i.name}</Link>
                <p className="text-xs text-cocoa">{i.size} · {formatKobo(i.priceKobo)} each</p>
                {(i.stock <= 0 || i.quantity > i.stock) && (
                  <p className="mt-1 text-xs text-rose-dark">
                    {i.stock <= 0 ? "This item is now out of stock. Please remove it." : `Only ${i.stock} left. Please lower the quantity.`}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <form action={setQuantityAction} className="flex items-center gap-2">
                    <input type="hidden" name="productId" value={i.productId} />
                    <QuantityInput max={Math.max(i.stock, 1)} initial={i.quantity} />
                    <SubmitButton className="btn-secondary px-4" pendingText="Updating...">Update</SubmitButton>
                  </form>
                  <form action={removeFromCartAction}>
                    <input type="hidden" name="productId" value={i.productId} />
                    <button type="submit" className="text-sm underline underline-offset-4">Remove</button>
                  </form>
                </div>
              </div>
              <p className="text-sm font-semibold">{formatKobo(i.lineTotalKobo)}</p>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-blush bg-ivory p-5">
          <h2 className="text-2xl font-semibold">Summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatKobo(cart.subtotalKobo)}</dd></div>
            <div className="flex justify-between text-cocoa">
              <dt>Delivery</dt>
              <dd>{formatKobo(cart.fees.lagosKobo)} in Lagos, {formatKobo(cart.fees.otherKobo)} elsewhere</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-cocoa">The exact delivery fee is added at checkout once you choose your state.</p>
          {problem ? (
            <p className="mt-4 text-sm text-rose-dark">Fix the highlighted item to continue.</p>
          ) : (
            <Link href="/checkout" className="btn-primary mt-4 w-full">Proceed to checkout</Link>
          )}
          <Link href="/shop" className="mt-3 block text-center text-sm underline underline-offset-4">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
