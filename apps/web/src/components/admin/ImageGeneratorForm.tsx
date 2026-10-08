"use client";

import { useActionState } from "react";
import { generateImageAction, applyImageAction } from "@/actions/admin";
import FormMessage from "@/components/FormMessage";
import SubmitButton from "@/components/SubmitButton";

const field = "w-full rounded-lg border border-blush bg-ivory px-3 text-sm";

type Option = { id: string; name: string };
type Prefill = { productId?: string; name?: string; description?: string; type?: string };

export default function ImageGeneratorForm({ products, prefill }: { products: Option[]; prefill: Prefill }) {
  const [state, action] = useActionState(generateImageAction, undefined);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={action} className="space-y-4">
        <FormMessage error={state?.error} />
        <div>
          <label htmlFor="productName" className="mb-1 block text-sm font-medium">Product name</label>
          <input id="productName" name="productName" required defaultValue={prefill.name} className={`${field} h-11`} />
        </div>
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">Product description</label>
          <textarea id="description" name="description" rows={3} maxLength={400} defaultValue={prefill.description} className={`${field} py-2`} />
        </div>
        <div>
          <label htmlFor="productType" className="mb-1 block text-sm font-medium">Product type</label>
          <input id="productType" name="productType" required defaultValue={prefill.type} placeholder="e.g. serum bottle with dropper" className={`${field} h-11`} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="style" className="mb-1 block text-sm font-medium">Visual style</label>
            <input id="style" name="style" defaultValue="clean premium beauty photography" className={`${field} h-11`} />
          </div>
          <div>
            <label htmlFor="background" className="mb-1 block text-sm font-medium">Background style</label>
            <input id="background" name="background" defaultValue="warm neutral studio surface" className={`${field} h-11`} />
          </div>
        </div>
        <div>
          <label htmlFor="aspectRatio" className="mb-1 block text-sm font-medium">Image shape</label>
          <select id="aspectRatio" name="aspectRatio" defaultValue="4:5" className={`${field} h-11`}>
            <option value="4:5">Portrait 4:5 (best for the shop)</option>
            <option value="1:1">Square 1:1</option>
            <option value="3:4">Portrait 3:4</option>
            <option value="16:9">Wide 16:9 (banners)</option>
          </select>
        </div>
        <div>
          <label htmlFor="extra" className="mb-1 block text-sm font-medium">Extra instructions (optional)</label>
          <textarea id="extra" name="extra" rows={2} maxLength={300} className={`${field} py-2`} placeholder="e.g. a soft pink flower beside the bottle" />
        </div>
        <SubmitButton pendingText="Generating... this can take up to a minute">Generate image</SubmitButton>
      </form>

      <div>
        <h2 className="text-2xl font-semibold">Preview</h2>
        {state?.url ? (
          <div className="mt-3 space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={state.url} alt="Generated product preview" className="w-full max-w-sm rounded-2xl border border-blush" />
            <form action={applyImageAction} className="space-y-3">
              <input type="hidden" name="imageUrl" value={state.url} />
              <div>
                <label htmlFor="productId" className="mb-1 block text-sm font-medium">Use this image for</label>
                <select id="productId" name="productId" required defaultValue={prefill.productId ?? ""} className={`${field} h-11`}>
                  <option value="" disabled>Choose a product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <SubmitButton pendingText="Saving...">Use this image</SubmitButton>
              <p className="text-xs text-cocoa">Not happy with it? Change the instructions and generate again. Unused images are simply ignored.</p>
            </form>
          </div>
        ) : (
          <p className="mt-3 text-sm text-cocoa">Your generated image will appear here. The request goes through our server, so your Hugging Face token stays private.</p>
        )}
      </div>
    </div>
  );
}
