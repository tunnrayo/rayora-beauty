import type { Metadata } from "next";
import { createBannerAction, deleteBannerAction, toggleBannerAction } from "@/actions/admin";
import ConfirmButton from "@/components/admin/ConfirmButton";
import Flash from "@/components/admin/Flash";
import SubmitButton from "@/components/SubmitButton";
import { apiCall, requireAdminUser } from "@/lib/session";

export const metadata: Metadata = { title: "Banners" };
const field = "h-11 w-full rounded-lg border border-blush bg-ivory px-3 text-sm";

type Banner = { id: string; title: string; subtitle: string; linkUrl: string; active: boolean };

export default async function AdminBanners({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdminUser();
  const { saved, error } = await searchParams;
  const r = await apiCall<{ items: Banner[] }>("/store/admin/banners", { auth: true });
  const items = r.data?.items ?? [];
  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-semibold">Site banners</h1>
      <p className="mt-1 text-sm text-cocoa">The first active banner shows as a bar at the top of the home page.</p>
      <div className="mt-4"><Flash error={error ?? r.error ?? undefined} saved={saved} /></div>

      <form action={createBannerAction} className="grid gap-3 rounded-2xl border border-blush bg-ivory p-4 sm:grid-cols-2">
        <div><label htmlFor="title" className="mb-1 block text-xs font-medium">Title</label><input id="title" name="title" required className={field} /></div>
        <div><label htmlFor="subtitle" className="mb-1 block text-xs font-medium">Subtitle (optional)</label><input id="subtitle" name="subtitle" className={field} /></div>
        <div><label htmlFor="linkUrl" className="mb-1 block text-xs font-medium">Link (starts with /)</label><input id="linkUrl" name="linkUrl" defaultValue="/shop" className={field} /></div>
        <div className="flex items-end"><SubmitButton pendingText="Adding...">Add banner</SubmitButton></div>
      </form>

      <ul className="mt-6 divide-y divide-blush rounded-2xl border border-blush bg-ivory">
        {items.length === 0 && <li className="p-4 text-sm text-cocoa">No banners yet.</li>}
        {items.map((b) => (
          <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <span><strong>{b.title}</strong>{b.subtitle && ` · ${b.subtitle}`} <span className="text-cocoa">→ {b.linkUrl}</span>
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${b.active ? "bg-blush" : "bg-cocoa text-ivory"}`}>{b.active ? "Showing" : "Hidden"}</span>
            </span>
            <span className="flex items-center gap-4">
              <form action={toggleBannerAction}>
                <input type="hidden" name="id" value={b.id} />
                <input type="hidden" name="active" value={b.active ? "0" : "1"} />
                <button type="submit" className="underline underline-offset-4">{b.active ? "Hide" : "Show"}</button>
              </form>
              <form action={deleteBannerAction}>
                <input type="hidden" name="id" value={b.id} />
                <ConfirmButton message="Delete this banner?">Delete</ConfirmButton>
              </form>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
