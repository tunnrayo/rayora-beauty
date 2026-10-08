import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteChrome from "@/components/SiteChrome";
import Tracker from "@/components/Tracker";
import ChatWidget from "@/components/ChatWidget";
import { getCart, getSession } from "@/lib/session";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Rayora Beauty | Skincare, Makeup, Body Care and Fragrance",
    template: "%s | Rayora Beauty",
  },
  description:
    "Shop skincare, makeup, body care and fragrance at Rayora Beauty. Inclusive shades and products for Nigerian and African skin, delivered nationwide.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, cart] = await Promise.all([getSession(), getCart()]);

  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <SiteChrome
          header={<Header cartCount={cart?.itemCount ?? 0} userName={user?.fullName ?? null} />}
          footer={<Footer />}
          extras={<><Tracker /><ChatWidget /></>}
        >
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
