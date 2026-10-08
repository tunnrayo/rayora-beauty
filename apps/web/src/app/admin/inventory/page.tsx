import type { Metadata } from "next";
import { updateStockAction } from "@/actions/admin";
import Flash from "@/components/admin/Flash";
import SubmitButton from "@/components/SubmitButton";
import type { Product } from "@/lib/api";
import { apiCall, requireAdminUser } from "@/lib/session";

export const metadata: Metadata = { title: "Inventory" };

export default async function AdminInventory({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdminUser();
  const { saved, error } = await searchParams;
  const r = await apiCall<{ items: Product[] }>("/products/admin/all", { auth: true });
  const items = [...(r.data?.items ?? [])].sort((a, b) => a.stock - b.stock);
  return (
    <div>
      <h1 className="text-4xl font-semibold">Inventory</h1>
      <p className="mt-1 text-sm text-cocoa">Lowest stock first. Products with 0 stock cannot be ordered. Items with 10 or fewer are marked low.</p>
      <div className="mt-4"><Flash error={error ?? r.error ?? undefined} saved={saved} /></div>
      <div className="overflow-x-auto rounded-2xl border border-blush bg-ivory">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="text-xs text-cocoa"><tr><th className="p-3">Product</th><th>Stock</th><th>Level</th><th>Update stock</th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-blush">
                <td className="p-3 font-medium">{p.name}</td>
                <td>{p.stock}</td>
                <td>
                  {p.stock <= 0 ? (
                    <span className="rounded-full bg-rose-dark px-3 py-1 text-xs text-ivory">Out of stock</span>
                  ) : p.stock <= 10 ? (
                    <span className="rounded-full bg-gold/30 px-3 py-1 text-xs">Low stock</span>
                  ) : (
                    <span className="text-xs text-cocoa">OK</span>
                  )}
                </td>
                <td className="p-2">
                  <form action={updateStockAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={p.id} />
                    <label htmlFor={`s-${p.id}`} className="sr-only">New stock for {p.name}</label>
                    <input id={`s-${p.id}`} name="stock" type="number" min="0" step="1" defaultValue={p.stock} className="h-10 w-24 rounded-lg border border-blush bg-cream px-2" />
                    <SubmitButton className="btn-secondary px-4" pendingText="Saving...">Save</SubmitButton>
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
