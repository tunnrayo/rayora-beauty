import type { Metadata } from "next";
import Link from "next/link";
import { deleteProductAction } from "@/actions/admin";
import ConfirmButton from "@/components/admin/ConfirmButton";
import Flash from "@/components/admin/Flash";
import type { Product } from "@/lib/api";
import { formatKobo } from "@/lib/format";
import { apiCall, requireAdminUser } from "@/lib/session";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdminUser();
  const { saved, error } = await searchParams;
  const r = await apiCall<{ items: Product[] }>("/products/admin/all", { auth: true });
  const items = r.data?.items ?? [];
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">Add product</Link>
      </div>
      <div className="mt-4"><Flash error={error ?? r.error ?? undefined} saved={saved} /></div>
      <div className="overflow-x-auto rounded-2xl border border-blush bg-ivory">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-xs text-cocoa"><tr><th className="p-3">Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-blush">
                <td className="p-3 font-medium">{p.name}{!p.imageUrl && <span className="ml-2 text-xs font-normal text-cocoa">(no image)</span>}</td>
                <td>{p.categoryName}</td>
                <td>{formatKobo(Number(p.priceKobo))}</td>
                <td className={p.stock <= 0 ? "text-rose-dark" : ""}>{p.stock}</td>
                <td className="capitalize">{p.status}</td>
                <td className="space-x-3 whitespace-nowrap p-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="underline underline-offset-4">Edit</Link>
                  <form action={deleteProductAction} className="inline">
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmButton message={`Delete ${p.name}? This cannot be undone.`}>Delete</ConfirmButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
