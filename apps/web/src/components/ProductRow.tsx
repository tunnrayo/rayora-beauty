import Link from "next/link";
import type { Product } from "@/lib/api";
import ProductCard from "./ProductCard";

type Props = { title: string; intro?: string; href: string; products: Product[] | undefined };

export default function ProductRow({ title, intro, href, products }: Props) {
  if (!products || products.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold">{title}</h2>
          {intro && <p className="mt-1 text-sm text-cocoa">{intro}</p>}
        </div>
        <Link href={href} className="shrink-0 text-sm underline underline-offset-4 hover:text-rose-dark">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
