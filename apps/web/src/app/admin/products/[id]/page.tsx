import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { removeImageAction } from "@/actions/admin";
import ConfirmButton from "@/components/admin/ConfirmButton";
import Flash from "@/components/admin/Flash";
import ProductForm from "@/components/admin/ProductForm";
import ProductImage from "@/components/ProductImage";
import { getCategories, type Product } from "@/lib/api";
import { apiCall, requireAdminUser } from "@/lib/session";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProduct({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;
  const { saved, error } = await searchParams;
  const [r, cats] = await Promise.all([apiCall<Product>(`/products/admin/item/${id}`, { auth: true }), getCategories()]);
  if (!r.data) notFound();
  const p = { ...r.data, priceKobo: Number(r.data.priceKobo), compareAtPriceKobo: r.data.compareAtPriceKobo == null ? null : Number(r.data.compareAtPriceKobo) };

  const generatorHref = `/admin/image-generator?product=${p.id}`;
  return (
    <div className="grid max-w-5xl gap-8 lg:grid-cols-[1fr_16rem]">
      <div>
        <h1 className="mb-4 text-4xl font-semibold">Edit product</h1>
        <Flash error={error} saved={saved} />
        <ProductForm categories={cats.data ?? []} product={p} />
      </div>
      <aside>
        <h2 className="text-2xl font-semibold">Product image</h2>
        <div className="mt-3"><ProductImage name={p.name} category={p.categoryName} imageUrl={p.imageUrl} /></div>
        <div className="mt-3 space-y-2 text-sm">
          <Link href={generatorHref} className="btn-secondary w-full">{p.imageUrl ? "Replace with a new image" : "Generate image"}</Link>
          {p.imageUrl && (
            <form action={removeImageAction}>
              <input type="hidden" name="productId" value={p.id} />
              <ConfirmButton message="Remove this product image?">Remove image</ConfirmButton>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}
