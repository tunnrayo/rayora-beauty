import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "The terms for shopping with Rayora Beauty, including orders, prices, delivery and returns.",
};

export default function TermsPage() {
  return (
    <StaticPage title="Terms and Conditions">
      <p>By using this website and placing an order, you agree to these terms.</p>
      <h2>Orders and prices</h2>
      <p>
        All prices are in Nigerian naira. An order is confirmed once payment is received. We may cancel an
        order if a product is out of stock or a price was shown in error, and we will refund any payment made.
      </p>
      <h2>Delivery</h2>
      <p>
        Delivery fees depend on your state and are shown at checkout. Delivery times are estimates and can
        change because of factors outside our control.
      </p>
      <h2>Returns</h2>
      <p>
        Damaged or incorrect items can be reported within 7 days of delivery. Opened products cannot be
        returned for hygiene reasons.
      </p>
      <h2>Product information</h2>
      <p>
        We describe our products as accurately as we can. If you have sensitive skin or allergies, please read
        the ingredient list before use.
      </p>
    </StaticPage>
  );
}
