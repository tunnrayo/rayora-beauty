import type { Metadata } from "next";
import Flash from "@/components/admin/Flash";
import ImageGeneratorForm from "@/components/admin/ImageGeneratorForm";
import type { Product } from "@/lib/api";
import { apiCall, requireAdminUser } from "@/lib/session";

export const metadata: Metadata = { title: "Image Generator" };

export default async function AdminImageGenerator({ searchParams }: { searchParams: Promise<{ product?: string; error?: string }> }) {
  await requireAdminUser();
  const { product, error } = await searchParams;
  const r = await apiCall<{ items: Product[] }>("/products/admin/all", { auth: true });
  const items = r.data?.items ?? [];
  const chosen = items.find((p) => p.id === product);

  return (
    <div>
      <h1 className="text-4xl font-semibold">Image Generator</h1>
      <p className="mt-1 max-w-2xl text-sm text-cocoa">
        Create product photos with Hugging Face. Your request goes to our server, and the server talks to Hugging Face, so the access token never reaches the browser.
      </p>
      <div className="mt-4"><Flash error={error} /></div>
      <ImageGeneratorForm
        products={items.map((p) => ({ id: p.id, name: p.name }))}
        prefill={{
          productId: chosen?.id,
          name: chosen?.name,
          description: chosen?.description.slice(0, 300),
          type: chosen ? `${chosen.categoryName.toLowerCase()} product, ${chosen.size}` : undefined,
        }}
      />
    </div>
  );
}
