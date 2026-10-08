import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts, getReviews } from "@/lib/api";
import { addToCartAction } from "@/actions/cart";
import { toggleWishlistAction } from "@/actions/account";
import { apiCall, getSession } from "@/lib/session";
import FormMessage from "@/components/FormMessage";
import QuantityInput from "@/components/QuantityInput";
import ReviewForm from "@/components/ReviewForm";
import SubmitButton from "@/components/SubmitButton";
import { formatKobo } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import ProductCard from "@/components/ProductCard";
import Rating from "@/components/Rating";
import Notice from "@/components/Notice";

type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<{ cartError?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getProduct(slug);
  if (!data) return { title: "Product not found" };
  return {
    title: data.name,
    description: `${data.description.slice(0, 150)}`,
    openGraph: { title: data.name, description: data.description.slice(0, 150) },
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const cartError = (await searchParams)?.cartError;
  const result = await getProduct(slug);

  if (result.notFound) notFound();
  if (!result.data) {
    return (
      <Notice
        title="We could not load this product"
        message="Please refresh the page in a moment."
        actionHref="/shop"
        actionLabel="Back to shop"
      />
    );
  }

  const p = result.data;
  const [related, reviews, user] = await Promise.all([
    getProducts({ category: p.categorySlug, limit: 5 }),
    getReviews(slug),
    getSession(),
  ]);
  let wished = false;
  if (user) {
    const wl = await apiCall<{ items: { id: string }[] }>("/users/wishlist", { auth: true });
    wished = Boolean(wl.data?.items.some((w) => w.id === p.id));
  }
  const relatedItems = (related.data?.items ?? []).filter((x) => x.id !== p.id).slice(0, 4);

  const soldOut = p.stock <= 0;
  const discount =
    p.compareAtPriceKobo && p.compareAtPriceKobo > p.priceKobo
      ? Math.round((1 - p.priceKobo / p.compareAtPriceKobo) * 100)
      : 0;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const whatsappHref = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hello Rayora Beauty, I would like to order ${p.name}.`)}`
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    category: p.categoryName,
    ...(p.imageUrl ? { image: p.imageUrl } : {}),
    brand: { "@type": "Brand", name: "Rayora Beauty" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount },
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: p.priceKobo / 100,
      availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-cocoa">
        <Link href="/shop" className="underline underline-offset-4">Shop</Link>
        {" / "}
        <Link href={`/${p.categorySlug}`} className="underline underline-offset-4">{p.categoryName}</Link>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        <ProductImage name={p.name} category={p.categoryName} imageUrl={p.imageUrl} priority />

        <div>
          <h1 className="text-4xl font-semibold leading-tight">{p.name}</h1>
          <div className="mt-2"><Rating value={p.rating} count={p.reviewCount} /></div>

          <p className="mt-4 text-2xl">
            <span className="font-semibold">{formatKobo(p.priceKobo)}</span>
            {discount > 0 && p.compareAtPriceKobo && (
              <>
                <span className="ml-3 text-base text-cocoa line-through">{formatKobo(p.compareAtPriceKobo)}</span>
                <span className="ml-3 rounded-full bg-blush px-3 py-1 text-xs font-medium">{discount}% off</span>
              </>
            )}
          </p>

          <p className="mt-2 text-sm">
            {soldOut ? (
              <span className="font-medium text-rose-dark">Out of stock</span>
            ) : p.stock <= 10 ? (
              <span className="font-medium text-rose-dark">Only {p.stock} left</span>
            ) : (
              <span className="font-medium text-cocoa">In stock</span>
            )}
            <span className="text-cocoa"> · Size {p.size}</span>
          </p>

          <p className="mt-5 leading-relaxed text-cocoa">{p.description}</p>

          {p.shades.length > 0 && (
            <div className="mt-5">
              <h2 className="font-sans text-sm font-medium">Shades</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {p.shades.map((s) => (
                  <li key={s} className="rounded-full border border-blush bg-ivory px-3 py-1 text-xs">{s}</li>
                ))}
              </ul>
            </div>
          )}

          {p.skinTypes.length > 0 && (
            <p className="mt-4 text-sm text-cocoa">
              <span className="font-medium text-charcoal">Suits: </span>{p.skinTypes.join(", ")} skin
            </p>
          )}

          <div className="mt-6 space-y-3">
            <FormMessage error={cartError} />
            {soldOut ? (
              <p className="rounded-xl bg-blush px-4 py-3 text-sm">This product is out of stock right now. Save it to your wishlist and check back soon.</p>
            ) : (
              <form action={addToCartAction} className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="productId" value={p.id} />
                <input type="hidden" name="slug" value={p.slug} />
                <QuantityInput max={Math.min(p.stock, 20)} />
                <SubmitButton pendingText="Adding...">Add to Cart</SubmitButton>
                <SubmitButton className="btn-secondary" pendingText="One moment..." name="intent" value="buy">
                  Buy Now
                </SubmitButton>
              </form>
            )}
            <form action={toggleWishlistAction}>
              <input type="hidden" name="productId" value={p.id} />
              <input type="hidden" name="slug" value={p.slug} />
              <input type="hidden" name="wished" value={wished ? "1" : "0"} />
              <button type="submit" className="text-sm underline underline-offset-4">
                {wished ? "Remove from wishlist" : "Save to wishlist"}
              </button>
            </form>
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="block text-sm underline underline-offset-4">
                Prefer to order on WhatsApp?
              </a>
            )}
          </div>
        </div>
      </div>

      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">Ingredients</h2>
          <p className="mt-2 text-sm leading-relaxed text-cocoa">{p.ingredients}</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Customer reviews</h2>
          <p className="mt-2 text-sm text-cocoa">Rated {p.rating.toFixed(1)} out of 5 from {p.reviewCount} customers.</p>
          {reviews.length > 0 && (
            <ul className="mt-4 space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-2xl border border-blush bg-ivory p-4 text-sm">
                  <p className="font-medium">{"★".repeat(r.rating)}{r.title && ` ${r.title}`}</p>
                  {r.body && <p className="mt-1 text-cocoa">{r.body}</p>}
                  <p className="mt-1 text-xs text-cocoa">{r.firstName}, {new Date(r.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p>
                </li>
              ))}
            </ul>
          )}
          {user ? (
            <ReviewForm slug={p.slug} />
          ) : (
            <p className="mt-4 text-sm"><Link href={`/login?next=${encodeURIComponent(`/product/${p.slug}`)}`} className="underline underline-offset-4">Log in</Link> to write a review.</p>
          )}
        </div>
      </section>

      {relatedItems.length > 0 && (
        <section className="mt-14">
          <h2 className="text-3xl font-semibold">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {relatedItems.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
