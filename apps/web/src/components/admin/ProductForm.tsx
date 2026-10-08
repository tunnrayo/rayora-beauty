"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveProductAction } from "@/actions/admin";
import FormMessage from "@/components/FormMessage";
import SubmitButton from "@/components/SubmitButton";
import type { Category, Product } from "@/lib/api";

const field = "w-full rounded-lg border border-blush bg-ivory px-3 text-sm";

export default function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const [state, action] = useActionState(saveProductAction, undefined);
  const naira = (kobo?: number | null) => (kobo == null ? "" : String(Number(kobo) / 100));

  return (
    <form action={action} className="space-y-4">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="imageUrl" value={product?.imageUrl ?? ""} />
      <FormMessage error={state?.error} />

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">Product name</label>
        <input id="name" name="name" required defaultValue={product?.name} className={`${field} h-11`} />
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">Description</label>
        <textarea id="description" name="description" required rows={4} defaultValue={product?.description} className={`${field} py-2`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="categoryId" className="mb-1 block text-sm font-medium">Category</label>
          <select id="categoryId" name="categoryId" required defaultValue={product?.categoryId ?? ""} className={`${field} h-11`}>
            <option value="" disabled>Choose a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium">Availability</label>
          <select id="status" name="status" defaultValue={product?.status ?? "active"} className={`${field} h-11`}>
            <option value="active">Active (visible in the shop)</option>
            <option value="draft">Draft (hidden)</option>
            <option value="archived">Archived (hidden)</option>
          </select>
        </div>
        <div>
          <label htmlFor="priceNaira" className="mb-1 block text-sm font-medium">Price (₦)</label>
          <input id="priceNaira" name="priceNaira" type="number" min="0" step="0.01" required defaultValue={naira(product?.priceKobo)} className={`${field} h-11`} />
        </div>
        <div>
          <label htmlFor="compareAtNaira" className="mb-1 block text-sm font-medium">Previous price (₦, optional)</label>
          <input id="compareAtNaira" name="compareAtNaira" type="number" min="0" step="0.01" defaultValue={naira(product?.compareAtPriceKobo)} className={`${field} h-11`} />
        </div>
        <div>
          <label htmlFor="stock" className="mb-1 block text-sm font-medium">Stock quantity</label>
          <input id="stock" name="stock" type="number" min="0" step="1" required defaultValue={product?.stock ?? 0} className={`${field} h-11`} />
        </div>
        <div>
          <label htmlFor="size" className="mb-1 block text-sm font-medium">Size</label>
          <input id="size" name="size" defaultValue={product?.size} placeholder="e.g. 50ml" className={`${field} h-11`} />
        </div>
      </div>
      <div>
        <label htmlFor="ingredients" className="mb-1 block text-sm font-medium">Ingredients</label>
        <textarea id="ingredients" name="ingredients" rows={3} defaultValue={product?.ingredients} className={`${field} py-2`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="skinTypes" className="mb-1 block text-sm font-medium">Skin types (comma separated)</label>
          <input id="skinTypes" name="skinTypes" defaultValue={product?.skinTypes.join(", ")} placeholder="Dry, Oily, Normal" className={`${field} h-11`} />
        </div>
        <div>
          <label htmlFor="shades" className="mb-1 block text-sm font-medium">Shades (comma separated)</label>
          <input id="shades" name="shades" defaultValue={product?.shades.join(", ")} className={`${field} h-11`} />
        </div>
      </div>
      <fieldset className="flex flex-wrap gap-6 text-sm">
        <legend className="mb-1 font-medium">Show this product as</legend>
        <label className="flex items-center gap-2"><input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} /> Featured</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="isBestSeller" defaultChecked={product?.isBestSeller} /> Best seller</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="isNew" defaultChecked={product?.isNew} /> New arrival</label>
      </fieldset>
      <div className="flex items-center gap-4">
        <SubmitButton pendingText="Saving...">{product ? "Save changes" : "Create product"}</SubmitButton>
        <Link href="/admin/products" className="text-sm underline underline-offset-4">Cancel</Link>
      </div>
    </form>
  );
}
