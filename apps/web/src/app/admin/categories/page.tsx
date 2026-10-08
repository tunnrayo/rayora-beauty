import type { Metadata } from "next";
import { deleteCategoryAction, saveCategoryAction } from "@/actions/admin";
import ConfirmButton from "@/components/admin/ConfirmButton";
import Flash from "@/components/admin/Flash";
import SubmitButton from "@/components/SubmitButton";
import { getCategories } from "@/lib/api";
import { requireAdminUser } from "@/lib/session";

export const metadata: Metadata = { title: "Categories" };
const field = "h-11 w-full rounded-lg border border-blush bg-ivory px-3 text-sm";

export default async function AdminCategories({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdminUser();
  const { saved, error } = await searchParams;
  const cats = await getCategories();
  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-semibold">Categories</h1>
      <div className="mt-4"><Flash error={error} saved={saved} /></div>
      <ul className="space-y-3">
        {(cats.data ?? []).map((c) => (
          <li key={c.id} className="rounded-2xl border border-blush bg-ivory p-4">
            <form action={saveCategoryAction} className="grid gap-3 sm:grid-cols-[1fr_2fr_6rem_auto] sm:items-end">
              <input type="hidden" name="id" value={c.id} />
              <div><label className="mb-1 block text-xs font-medium" htmlFor={`n-${c.id}`}>Name</label><input id={`n-${c.id}`} name="name" defaultValue={c.name} required className={field} /></div>
              <div><label className="mb-1 block text-xs font-medium" htmlFor={`d-${c.id}`}>Description</label><input id={`d-${c.id}`} name="description" defaultValue={c.description} className={field} /></div>
              <div><label className="mb-1 block text-xs font-medium" htmlFor={`s-${c.id}`}>Order</label><input id={`s-${c.id}`} name="sortOrder" type="number" min="0" defaultValue={c.sortOrder ?? 0} className={field} /></div>
              <SubmitButton className="btn-secondary" pendingText="Saving...">Save</SubmitButton>
            </form>
            <form action={deleteCategoryAction} className="mt-2 flex items-center gap-3 text-xs text-cocoa">
              <input type="hidden" name="id" value={c.id} />
              <span>{c.productCount} active products</span>
              <ConfirmButton message={`Delete the ${c.name} category?`}>Delete category</ConfirmButton>
            </form>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-2xl font-semibold">Add a category</h2>
      <form action={saveCategoryAction} className="mt-3 grid gap-3 rounded-2xl border border-blush bg-ivory p-4 sm:grid-cols-[1fr_2fr_6rem_auto] sm:items-end">
        <div><label className="mb-1 block text-xs font-medium" htmlFor="new-name">Name</label><input id="new-name" name="name" required className={field} /></div>
        <div><label className="mb-1 block text-xs font-medium" htmlFor="new-desc">Description</label><input id="new-desc" name="description" className={field} /></div>
        <div><label className="mb-1 block text-xs font-medium" htmlFor="new-order">Order</label><input id="new-order" name="sortOrder" type="number" min="0" defaultValue="10" className={field} /></div>
        <SubmitButton pendingText="Adding...">Add</SubmitButton>
      </form>
    </div>
  );
}
