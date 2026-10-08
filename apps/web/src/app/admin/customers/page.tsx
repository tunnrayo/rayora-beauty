import type { Metadata } from "next";
import { formatKobo } from "@/lib/format";
import { apiCall, requireAdminUser } from "@/lib/session";

export const metadata: Metadata = { title: "Customers" };

type Customer = { id: string; email: string; fullName: string; phone: string | null; createdAt: string; orderCount: number; spentKobo: number };

export default async function AdminCustomers() {
  await requireAdminUser();
  const r = await apiCall<{ items: Customer[] }>("/users/admin/customers", { auth: true });
  const items = r.data?.items ?? [];
  return (
    <div>
      <h1 className="text-4xl font-semibold">Customers</h1>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-blush bg-ivory">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-xs text-cocoa"><tr><th className="p-3">Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Orders</th><th>Spent</th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="p-4 text-cocoa">No customers have signed up yet.</td></tr>}
            {items.map((c) => (
              <tr key={c.id} className="border-t border-blush">
                <td className="p-3 font-medium">{c.fullName}</td><td>{c.email}</td><td>{c.phone ?? "·"}</td>
                <td>{new Date(c.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</td>
                <td>{c.orderCount}</td><td>{formatKobo(Number(c.spentKobo))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
