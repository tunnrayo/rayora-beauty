import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/api";
import { formatKobo } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import ProductCard from "@/components/ProductCard";
import Rating from "@/components/Rating";
import Notice from "@/components/Notice";

type Props = { params: Promise<{ slug: string }> };

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

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
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
  const related = await getProducts({ category: p.categorySlug, limit: 5 });
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

          <div className="mt-6 rounded-2xl bg-blush/40 p-4 text-sm text-cocoa">
            Adding to cart arrives with the checkout update. In the meantime you can order this product by WhatsApp.
          </div>
          {whatsappHref && (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4">
              Order on WhatsApp
            </a>
          )}
        </div>
      </div>

      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">Ingredients</h2>
          <p className="mt-2 text-sm leading-relaxed text-cocoa">{p.ingredients}</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Customer reviews</h2>
          <p className="mt-2 text-sm leading-relaxed text-cocoa">
            Rated {p.rating.toFixed(1)} out of 5 by {p.reviewCount} customers. Written reviews will appear here
            once customer accounts open.
          </p>
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
