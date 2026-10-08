import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api";
import ProductCard from "./ProductCard";
import Notice from "./Notice";

export type ListingParams = Record<string, string | undefined>;

const SORTS = [
  ["newest", "Newest"],
  ["popular", "Most popular"],
  ["rating", "Highest rated"],
  ["price_asc", "Price: low to high"],
  ["price_desc", "Price: high to low"],
] as const;
const SKIN_TYPES = ["Dry", "Oily", "Combination", "Sensitive", "Normal"];
const PAGE_SIZE = 12;

type Props = {
  title: string;
  intro: string;
  basePath: string;
  params: ListingParams;
  fixedCategory?: string;
};

const isNumber = (v?: string) => (v && /^\d{1,9}$/.test(v) ? v : undefined);

export default async function Listing({ title, intro, basePath, params, fixedCategory }: Props) {
  const sort = SORTS.some(([v]) => v === params.sort) ? params.sort! : "newest";
  const page = Math.max(1, Number(isNumber(params.page) ?? 1));
  const category = fixedCategory ?? params.category;
  const q = params.q?.trim().slice(0, 80);
  const skinType = SKIN_TYPES.includes(params.skinType ?? "") ? params.skinType : undefined;
  const minPrice = isNumber(params.minPrice);
  const maxPrice = isNumber(params.maxPrice);

  const [productsResult, categoriesResult] = await Promise.all([
    getProducts({ q, category, skinType, minPrice, maxPrice, sort, page, limit: PAGE_SIZE }),
    fixedCategory ? Promise.resolve(null) : getCategories(),
  ]);

  const filtersActive = Boolean(q || skinType || minPrice || maxPrice || (!fixedCategory && category));
  const list = productsResult.data;
  const totalPages = list ? Math.max(1, Math.ceil(list.total / PAGE_SIZE)) : 1;

  const pageHref = (n: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "page") qs.set(k, v);
    if (n > 1) qs.set("page", String(n));
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  const inputClass = "h-11 w-full rounded-lg border border-blush bg-ivory px-3 text-sm";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-4xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-2xl text-cocoa">{intro}</p>

      <details className="mt-6 rounded-2xl border border-blush bg-ivory p-4" open={filtersActive}>
        <summary className="cursor-pointer text-sm font-medium">Search, filter and sort</summary>
        <form action={basePath} method="get" className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="f-q" className="mb-1 block text-xs font-medium">Search by name</label>
            <input id="f-q" name="q" defaultValue={q} className={inputClass} placeholder="e.g. serum" />
          </div>
          {!fixedCategory && (
            <div>
              <label htmlFor="f-category" className="mb-1 block text-xs font-medium">Category</label>
              <select id="f-category" name="category" defaultValue={category ?? ""} className={inputClass}>
                <option value="">All categories</option>
                {categoriesResult?.data?.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="f-skin" className="mb-1 block text-xs font-medium">Skin type</label>
            <select id="f-skin" name="skinType" defaultValue={skinType ?? ""} className={inputClass}>
              <option value="">Any skin type</option>
              {SKIN_TYPES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-min" className="mb-1 block text-xs font-medium">Lowest price (₦)</label>
            <input id="f-min" name="minPrice" type="number" min="0" inputMode="numeric" defaultValue={minPrice} className={inputClass} />
          </div>
          <div>
            <label htmlFor="f-max" className="mb-1 block text-xs font-medium">Highest price (₦)</label>
            <input id="f-max" name="maxPrice" type="number" min="0" inputMode="numeric" defaultValue={maxPrice} className={inputClass} />
          </div>
          <div>
            <label htmlFor="f-sort" className="mb-1 block text-xs font-medium">Sort by</label>
            <select id="f-sort" name="sort" defaultValue={sort} className={inputClass}>
              {SORTS.map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4 sm:col-span-2 lg:col-span-3">
            <button type="submit" className="btn-primary">Apply</button>
            {filtersActive && (
              <Link href={basePath} className="text-sm underline underline-offset-4">Clear all</Link>
            )}
          </div>
        </form>
      </details>

      {productsResult.error && (
        <Notice
          title="We could not load the products"
          message="Please refresh the page in a moment. If it keeps happening, message us and we will help."
          actionHref={basePath}
          actionLabel="Try again"
        />
      )}

      {list && list.items.length === 0 && (
        <Notice
          title={q ? `No results for "${q}"` : "No products found"}
          message="Try a different word, widen the price range, or clear your filters."
          actionHref={basePath}
          actionLabel="Clear filters"
        />
      )}

      {list && list.items.length > 0 && (
        <>
          <p className="mt-6 text-sm text-cocoa" aria-live="polite">
            {list.total} {list.total === 1 ? "product" : "products"}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {list.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {totalPages > 1 && (
            <nav aria-label="Pages" className="mt-10 flex items-center justify-center gap-4 text-sm">
              {page > 1 ? (
                <Link href={pageHref(page - 1)} className="btn-secondary">Previous</Link>
              ) : (
                <span className="px-6 text-cocoa/50">Previous</span>
              )}
              <span>Page {page} of {totalPages}</span>
              {page < totalPages ? (
                <Link href={pageHref(page + 1)} className="btn-secondary">Next</Link>
              ) : (
                <span className="px-6 text-cocoa/50">Next</span>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
