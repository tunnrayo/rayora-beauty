import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-blush bg-ivory">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-serif text-xl">Rayora Beauty</p>
          <p className="mt-2 text-sm text-cocoa">
            Skincare, makeup, body care and fragrance, with shades and formulas chosen for
            every skin tone. Delivered across Nigeria.
          </p>
        </div>
        <nav aria-label="Shop" className="text-sm">
          <p className="font-medium">Shop</p>
          <ul className="mt-2 space-y-1 text-cocoa">
            <li><Link href="/skincare">Skincare</Link></li>
            <li><Link href="/makeup">Makeup</Link></li>
            <li><Link href="/body-care">Body Care</Link></li>
            <li><Link href="/fragrance">Fragrance</Link></li>
          </ul>
        </nav>
        <nav aria-label="Help" className="text-sm">
          <p className="font-medium">Help</p>
          <ul className="mt-2 space-y-1 text-cocoa">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms and Conditions</Link></li>
          </ul>
        </nav>
      </div>
      <p className="border-t border-blush py-4 text-center text-xs text-cocoa">
        © {new Date().getFullYear()} Rayora Beauty. All rights reserved.
      </p>
    </footer>
  );
}
