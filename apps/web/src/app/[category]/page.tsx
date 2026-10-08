import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Listing from "@/components/Listing";
import { getCategories } from "@/lib/api";
import Notice from "@/components/Notice";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cats = await getCategories();
  const found = cats.data?.find((c) => c.slug === category);
  if (!found) return { title: "Not found" };
  return { title: found.name, description: `${found.description} Shop ${found.name} at Rayora Beauty.` };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const cats = await getCategories();
  if (cats.error) {
    return (
      <Notice
        title="We could not load this page"
        message="Please refresh in a moment."
        actionHref="/shop"
        actionLabel="Go to shop"
      />
    );
  }
  const found = cats.data?.find((c) => c.slug === category);
  if (!found) notFound();

  return (
    <Listing
      title={found.name}
      intro={found.description}
      basePath={`/${found.slug}`}
      params={await searchParams}
      fixedCategory={found.slug}
    />
  );
}
