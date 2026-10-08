import type { Metadata } from "next";
import { createCouponAction, deleteCouponAction, toggleCouponAction } from "@/actions/admin";
import ConfirmButton from "@/components/admin/ConfirmButton";
import Flash from "@/components/admin/Flash";
import SubmitButton from "@/components/SubmitButton";
import { formatKobo } from "@/lib/format";
import { apiCall, requireAdminUser } from "@/lib/session";

export const metadata: Metadata = { title: "Coupons" };
const field = "h-11 w-full rounded-lg border border-blush bg-ivory px-3 text-sm";

type Coupon = { id: string; code: string; percentOff: number | null; amountOffKobo: number | null; active: boolean; expiresAt: string | null };

export default async function AdminCoupons({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdminUser();
  const { saved, error } = await searchParams;
  const r = await apiCall<{ items: Coupon[] }>("/store/admin/coupons", { auth: true });
  const items = r.data?.items ?? [];
  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-semibold">Discounts and coupons</h1>
      <div className="mt-4"><Flash error={error ?? r.error ?? undefined} saved={saved} /></div>

      <form action={createCouponAction} className="grid gap-3 rounded-2xl border border-blush bg-ivory p-4 sm:grid-cols-2">
        <div><label htmlFor="code" className="mb-1 block text-xs font-medium">Code</label><input id="code" name="code" required placeholder="WELCOME10" className={field} /></div>
        <div>
          <label htmlFor="kind" className="mb-1 block text-xs font-medium">Type</label>
          <select id="kind" name="kind" className={field} defaultValue="percent">
            <option value="percent">Percentage off</option>
            <option value="amount">Fixed amount off (₦)</option>
          </select>
        </div>
        <div><label htmlFor="value" className="mb-1 block text-xs font-medium">Value (percent, or naira for fixed)</label><input id="value" name="value" type="number" min="1" step="1" required className={field} /></div>
        <div><label htmlFor="expiresAt" className="mb-1 block text-xs font-medium">Expires (optional)</label><input id="expiresAt" name="expiresAt" type="date" className={field} /></div>
        <div className="sm:col-span-2"><SubmitButton pendingText="Creating...">Create coupon</SubmitButton></div>
      </form>

      <ul className="mt-6 divide-y divide-blush rounded-2xl border border-blush bg-ivory">
        {items.length === 0 && <li className="p-4 text-sm text-cocoa">No coupons yet.</li>}
        {items.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <span>
              <strong>{c.code}</strong> · {c.percentOff ? `${c.percentOff}% off` : `${formatKobo(Number(c.amountOffKobo))} off`}
              {c.expiresAt && <span className="text-cocoa"> · expires {new Date(c.expiresAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</span>}
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${c.active ? "bg-blush" : "bg-cocoa text-ivory"}`}>{c.active ? "Active" : "Off"}</span>
            </span>
            <span className="flex items-center gap-4">
              <form action={toggleCouponAction}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="active" value={c.active ? "0" : "1"} />
                <button type="submit" className="underline underline-offset-4">{c.active ? "Turn off" : "Turn on"}</button>
              </form>
              <form action={deleteCouponAction}>
                <input type="hidden" name="id" value={c.id} />
                <ConfirmButton message={`Delete coupon ${c.code}?`}>Delete</ConfirmButton>
              </form>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
