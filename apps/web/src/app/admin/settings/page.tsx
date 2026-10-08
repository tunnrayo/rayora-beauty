import type { Metadata } from "next";
import { saveSettingsAction } from "@/actions/admin";
import Flash from "@/components/admin/Flash";
import SubmitButton from "@/components/SubmitButton";
import { apiCall, requireAdminUser } from "@/lib/session";

export const metadata: Metadata = { title: "Store Settings" };
const field = "h-11 w-full rounded-lg border border-blush bg-ivory px-3 text-sm";

export default async function AdminSettings({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdminUser();
  const { saved, error } = await searchParams;
  const [fees, mode] = await Promise.all([
    apiCall<{ lagosKobo: number; otherKobo: number }>("/store/admin/settings", { auth: true }),
    apiCall<{ mode: string }>("/payments/config"),
  ]);
  return (
    <div className="max-w-xl">
      <h1 className="text-4xl font-semibold">Store settings</h1>
      <div className="mt-4"><Flash error={error ?? fees.error ?? undefined} saved={saved} /></div>

      <form action={saveSettingsAction} className="space-y-4 rounded-2xl border border-blush bg-ivory p-5">
        <h2 className="text-2xl font-semibold">Delivery fees</h2>
        <div>
          <label htmlFor="lagos" className="mb-1 block text-sm font-medium">Delivery inside Lagos (₦)</label>
          <input id="lagos" name="lagos" type="number" min="0" step="1" required defaultValue={(fees.data?.lagosKobo ?? 250000) / 100} className={field} />
        </div>
        <div>
          <label htmlFor="other" className="mb-1 block text-sm font-medium">Delivery to other states (₦)</label>
          <input id="other" name="other" type="number" min="0" step="1" required defaultValue={(fees.data?.otherKobo ?? 450000) / 100} className={field} />
        </div>
        <SubmitButton pendingText="Saving...">Save settings</SubmitButton>
      </form>

      <section className="mt-6 rounded-2xl border border-blush bg-ivory p-5 text-sm">
        <h2 className="text-2xl font-semibold">Payments</h2>
        <p className="mt-2">
          Current mode: <strong>{mode.data?.mode === "paystack" ? "Paystack (live payments)" : "Demo payments (no real money)"}</strong>
        </p>
        <p className="mt-1 text-cocoa">Add the PAYSTACK_SECRET_KEY variable on the API service in Railway to switch to Paystack.</p>
      </section>
    </div>
  );
}
