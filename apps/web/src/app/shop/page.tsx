import type { Metadata } from "next";
import Listing from "@/components/Listing";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse all Rayora Beauty skincare, makeup, body care and fragrance. Filter by price and skin type.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  return (
    <Listing
      title={params.q ? `Results for "${params.q}"` : "Shop all"}
      intro="Everything from Rayora Beauty in one place."
      basePath="/shop"
      params={params}
    />
  );
}
