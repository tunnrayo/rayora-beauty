import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "About Rayora Beauty",
  description: "Rayora Beauty is a Lagos based beauty store with shades and formulas made for Nigerian and African skin.",
};

export default function AboutPage() {
  return (
    <StaticPage title="About Rayora Beauty">
      <p>
        Rayora Beauty is a Lagos based beauty store. We sell skincare, makeup, body care and fragrance
        that look and feel right on Nigerian and African skin.
      </p>
      <h2>Why we started</h2>
      <p>
        Too many beauty brands design for one skin tone and one climate. We wanted a store where you can
        find your shade without guessing, and where every product holds up in heat and humidity.
      </p>
      <h2>How we choose products</h2>
      <p>
        We look at the formula, the shade range and how it performs on deep, medium and light skin. If a
        product does not earn its place in a real routine, we do not sell it.
      </p>
      <h2>Delivery and support</h2>
      <p>
        We deliver across Nigeria. If you need help choosing a shade or tracking an order, reach us on
        our contact page and we will get back to you.
      </p>
    </StaticPage>
  );
}
