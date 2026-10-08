import Link from "next/link";
import type { Product } from "@/lib/api";
import { formatKobo } from "@/lib/format";
import ProductImage from "./ProductImage";
import Rating from "./Rating";

export default function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= 10;
  const discount =
    product.compareAtPriceKobo && product.compareAtPriceKobo > product.priceKobo
      ? Math.round((1 - product.priceKobo / product.compareAtPriceKobo) * 100)
      : 0;

  const badge = soldOut
    ? "Sold out"
    : discount > 0
      ? `${discount}% off`
      : product.isNew
        ? "New"
        : product.isBestSeller
          ? "Best seller"
          : null;

  return (
    <article className="group">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative">
          <ProductImage name={product.name} category={product.categoryName} imageUrl={product.imageUrl} />
          {badge && (
            <span className="absolute left-3 top-3 rounded-full bg-ivory px-3 py-1 text-xs font-medium text-charcoal">
              {badge}
            </span>
          )}
        </div>
        <h3 className="mt-3 font-sans text-sm font-medium leading-snug group-hover:underline">
          {product.name}
        </h3>
      </Link>
      <p className="mt-0.5 text-xs text-cocoa">
        {product.categoryName} · {product.size}
      </p>
      <div className="mt-1">
        <Rating value={product.rating} count={product.reviewCount} />
      </div>
      <p className="mt-1.5 text-sm">
        <span className="font-semibold">{formatKobo(product.priceKobo)}</span>
        {discount > 0 && product.compareAtPriceKobo && (
          <span className="ml-2 text-xs text-cocoa line-through">
            {formatKobo(product.compareAtPriceKobo)}
          </span>
        )}
      </p>
      {lowStock && <p className="mt-0.5 text-xs text-rose-dark">Only {product.stock} left</p>}
    </article>
  );
}
