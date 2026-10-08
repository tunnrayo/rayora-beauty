"use client";

import { useActionState } from "react";
import { reviewAction } from "@/actions/account";
import FormMessage from "./FormMessage";
import SubmitButton from "./SubmitButton";

export default function ReviewForm({ slug }: { slug: string }) {
  const [state, action] = useActionState(reviewAction, undefined);
  const field = "w-full rounded-lg border border-blush bg-ivory px-3 text-sm";
  return (
    <form action={action} className="mt-4 space-y-3 rounded-2xl border border-blush bg-ivory p-4">
      <input type="hidden" name="slug" value={slug} />
      <h3 className="font-sans text-sm font-medium">Write a review</h3>
      <FormMessage error={state?.error} ok={state?.ok} />
      <div>
        <label htmlFor="rating" className="mb-1 block text-xs font-medium">Rating</label>
        <select id="rating" name="rating" required defaultValue="" className={`${field} h-11`}>
          <option value="" disabled>Choose</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{n} out of 5</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="title" className="mb-1 block text-xs font-medium">Title (optional)</label>
        <input id="title" name="title" maxLength={100} className={`${field} h-11`} />
      </div>
      <div>
        <label htmlFor="body" className="mb-1 block text-xs font-medium">Your review (optional)</label>
        <textarea id="body" name="body" rows={3} maxLength={1000} className={`${field} py-2`} />
      </div>
      <SubmitButton pendingText="Saving...">Submit review</SubmitButton>
    </form>
  );
}
