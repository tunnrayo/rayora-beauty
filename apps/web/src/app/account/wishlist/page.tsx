import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import Notice from "@/components/Notice";
import { toggleWishlistAction } from "@/actions/account";
import { apiCall, requireUser } from "@/lib/session";
import type { Product } from "@/lib/api";

export const metadata: Metadata = { title: "My wishlist" };

export default async function WishlistPage() {
  await requireUser("/account/wishlist");
  const r = await apiCall<{ items: Product[] }>("/users/wishlist", { auth: true });
  const items = (r.data?.items ?? []).map((p) => ({ ...p, priceKobo: Number(p.priceKobo), compareAtPriceKobo: p.compareAtPriceKobo == null ? null : Number(p.compareAtPriceKobo) }));
  if (items.length === 0)
    return <Notice title="Your wishlist is empty" message="Tap Save to wishlist on any product and it will appear here." actionHref="/shop" actionLabel="Browse products" />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-semibold">My wishlist</h1>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
        {items.map((p) => (
          <div key={p.id}>
            <ProductCard product={p} />
            <form action={toggleWishlistAction} className="mt-2">
              <input type="hidden" name="productId" value={p.id} />
              <input type="hidden" name="slug" value={p.slug} />
              <input type="hidden" name="wished" value="1" />
              <input type="hidden" name="returnTo" value="wishlist" />
              <button type="submit" className="text-xs underline underline-offset-4">Remove</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
