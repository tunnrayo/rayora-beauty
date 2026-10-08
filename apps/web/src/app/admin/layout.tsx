import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { requireAdminUser } from "@/lib/session";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Rayora Admin" }, robots: { index: false, follow: false } };

const nav = [
  ["/admin", "Dashboard"],
  ["/admin/products", "Products"],
  ["/admin/categories", "Categories"],
  ["/admin/orders", "Orders"],
  ["/admin/customers", "Customers"],
  ["/admin/inventory", "Inventory"],
  ["/admin/image-generator", "Image Generator"],
  ["/admin/coupons", "Coupons"],
  ["/admin/banners", "Banners"],
  ["/admin/settings", "Store Settings"],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminUser();
  return (
    <div className="min-h-screen bg-cream md:flex">
      <aside className="border-b border-blush bg-charcoal text-ivory md:min-h-screen md:w-60 md:shrink-0 md:border-b-0">
        <div className="flex items-center justify-between px-4 py-3 md:block">
          <p className="font-serif text-xl">Rayora Admin</p>
          <p className="hidden text-xs text-blush md:mt-1 md:block">{user.email}</p>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:px-3 md:pb-0">
          {nav.map(([href, label]) => (
            <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm hover:bg-cocoa">
              {label}
            </Link>
          ))}
          <Link href="/" className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-blush hover:bg-cocoa md:mt-4">View store</Link>
          <form action={logoutAction}>
            <button type="submit" className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm text-blush hover:bg-cocoa">Log out</button>
          </form>
        </nav>
      </aside>
      <div className="min-w-0 flex-1 p-4 md:p-8">{children}</div>
    </div>
  );
}
