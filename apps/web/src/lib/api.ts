const API = process.env.API_URL ?? "http://localhost:4000";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  size: string;
  ingredients: string;
  skinTypes: string[];
  shades: string[];
  priceKobo: number;
  compareAtPriceKobo: number | null;
  stock: number;
  rating: number;
  reviewCount: number;
  status: string;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  imageUrl: string | null;
  categoryId?: string;
  categorySlug: string;
  categoryName: string;
};

export type Category = { id?: string; slug: string; name: string; description: string; productCount: number; sortOrder?: number };
export type ProductList = { items: Product[]; total: number; page: number; pageSize: number };
export type Result<T> = { data: T | null; error: boolean; notFound: boolean };

async function get<T>(path: string): Promise<Result<T>> {
  try {
    const res = await fetch(`${API}${path}`, { cache: "no-store" });
    if (res.status === 404) return { data: null, error: false, notFound: true };
    if (!res.ok) return { data: null, error: true, notFound: false };
    return { data: (await res.json()) as T, error: false, notFound: false };
  } catch {
    return { data: null, error: true, notFound: false };
  }
}

function normalise(p: Product): Product {
  return {
    ...p,
    priceKobo: Number(p.priceKobo),
    compareAtPriceKobo: p.compareAtPriceKobo == null ? null : Number(p.compareAtPriceKobo),
  };
}

export async function getProducts(
  params: Record<string, string | number | undefined>
): Promise<Result<ProductList>> {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") qs.set(key, String(value));
  }
  const r = await get<ProductList>(`/api/v1/products?${qs.toString()}`);
  if (r.data) r.data = { ...r.data, items: r.data.items.map(normalise) };
  return r;
}

export async function getProduct(slug: string): Promise<Result<Product>> {
  const r = await get<Product>(`/api/v1/products/${encodeURIComponent(slug)}`);
  if (r.data) r.data = normalise(r.data);
  return r;
}

export async function getCategories(): Promise<Result<Category[]>> {
  const r = await get<{ items: Category[] }>("/api/v1/products/categories");
  return { data: r.data?.items ?? null, error: r.error, notFound: r.notFound };
}

export type Banner = { id: string; title: string; subtitle: string; linkUrl: string };
export async function getBanners(): Promise<Banner[]> {
  const r = await get<{ items: Banner[] }>("/api/v1/store/banners");
  return r.data?.items ?? [];
}

export type Review = { id: string; rating: number; title: string; body: string; createdAt: string; firstName: string };
export async function getReviews(slug: string): Promise<Review[]> {
  const r = await get<{ items: Review[] }>(`/api/v1/products/${encodeURIComponent(slug)}/reviews`);
  return r.data?.items ?? [];
}
