import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about ordering, payment, delivery and returns at Rayora Beauty.",
};

const faqs = [
  { q: "How do I place an order?", a: "Choose your products, add them to your cart and go to checkout. You will enter your delivery details and pay securely. You can also order by WhatsApp." },
  { q: "How do I pay?", a: "Checkout accepts card and bank payments through Paystack, a secure Nigerian payment provider." },
  { q: "How much is delivery?", a: "Delivery inside Lagos is ₦2,500 and delivery to other states is ₦4,500. You will see the exact fee at checkout." },
  { q: "How long does delivery take?", a: "We confirm your estimated delivery time by message once your order is processed." },
  { q: "Can I return a product?", a: "If your order arrives damaged or incorrect, contact us within 7 days and we will make it right. For hygiene reasons we cannot take back opened products." },
  { q: "How do I choose my shade?", a: "Each makeup product lists its shades. If you are unsure, message us on WhatsApp with your skin tone and undertone and we will suggest a match." },
];

export default function FaqPage() {
  return (
    <StaticPage title="Frequently asked questions">
      <div className="space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="rounded-2xl border border-blush bg-ivory p-4">
            <summary className="cursor-pointer font-medium text-charcoal">{f.q}</summary>
            <p className="mt-2">{f.a}</p>
          </details>
        ))}
      </div>
    </StaticPage>
  );
}
