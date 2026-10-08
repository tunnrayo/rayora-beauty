"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/skincare", label: "Skincare" },
  { href: "/makeup", label: "Makeup" },
  { href: "/body-care", label: "Body Care" },
  { href: "/fragrance", label: "Fragrance" },
];

export default function Header({ cartCount, userName }: { cartCount: number; userName: string | null }) {
  const [open, setOpen] = useState(false);
  const accountHref = userName ? "/account" : "/login";
  const accountLabel = userName ? userName.split(" ")[0] : "Log in";

  return (
    <header className="sticky top-0 z-40 border-b border-blush bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          className="-ml-2 p-2 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-0.5 w-6 bg-charcoal" />
          <span className="mt-1.5 block h-0.5 w-6 bg-charcoal" />
          <span className="mt-1.5 block h-0.5 w-6 bg-charcoal" />
        </button>

        <Link href="/" className="font-serif text-2xl tracking-wide">
          Rayora <span className="text-rose">Beauty</span>
        </Link>

        <nav aria-label="Main" className="hidden gap-6 text-sm md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-rose-dark">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-sm">
          <Link href={accountHref} className="hidden hover:text-rose-dark sm:block">
            {accountLabel}
          </Link>
          <Link href="/cart" className="font-medium hover:text-rose-dark" aria-label={`Cart, ${cartCount} items`}>
            Cart{cartCount > 0 && <span className="ml-1 rounded-full bg-charcoal px-2 py-0.5 text-xs text-ivory">{cartCount}</span>}
          </Link>
        </div>
      </div>

      {/* Search is always visible. It works even before JavaScript loads. */}
      <form action="/shop" method="get" role="search" className="mx-auto max-w-6xl px-4 pb-3">
        <label htmlFor="site-search" className="sr-only">
          Search products
        </label>
        <input
          id="site-search"
          name="q"
          type="search"
          placeholder="Search serums, lipsticks, body butter..."
          className="h-11 w-full rounded-full border border-blush bg-cream px-5 text-sm placeholder:text-cocoa/60"
        />
      </form>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-blush bg-ivory md:hidden">
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block border-b border-blush/60 py-3 text-base">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={accountHref} onClick={() => setOpen(false)} className="block py-3 text-base">
                {userName ? `My account (${accountLabel})` : "Log in or create account"}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
