import type { Metadata } from "next";
import ProductForm from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/api";
import { requireAdminUser } from "@/lib/session";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProduct() {
  await requireAdminUser();
  const cats = await getCategories();
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-4xl font-semibold">Add product</h1>
      <ProductForm categories={cats.data ?? []} />
      <p className="mt-4 text-sm text-cocoa">After creating the product you can generate its photo from the edit page.</p>
    </div>
  );
}
