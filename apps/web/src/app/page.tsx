import Link from "next/link";
import { getBanners, getCategories, getProducts } from "@/lib/api";
import ProductRow from "@/components/ProductRow";

const testimonials = [
  { name: "Adaeze", place: "Lagos", text: "Finally a foundation range where I did not have to guess my shade. The deeper tones actually look rich on my skin." },
  { name: "Funmi", place: "Ibadan", text: "The sunscreen sits lightly and leaves no grey cast. I wear it every day now, even before makeup." },
  { name: "Halima", place: "Abuja", text: "The body butter is thick without being greasy. My skin stays soft through the whole harmattan season." },
];

export default async function HomePage() {
  const [cats, featured, best, fresh, banners] = await Promise.all([
    getCategories(),
    getProducts({ flag: "featured", limit: 4 }),
    getProducts({ flag: "best", limit: 4 }),
    getProducts({ flag: "new", limit: 4 }),
    getBanners(),
  ]);

  return (
    <>
      {banners[0] && (
        <Link href={banners[0].linkUrl} className="block bg-charcoal px-4 py-2 text-center text-sm text-ivory">
          <strong>{banners[0].title}</strong>
          {banners[0].subtitle && <span> · {banners[0].subtitle}</span>}
        </Link>
      )}
      <section className="bg-blush/40">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-rose-dark">Rayora Beauty</p>
            <h1 className="mt-3 text-5xl font-semibold leading-tight sm:text-6xl">Beauty That Feels Like You</h1>
            <p className="mt-5 max-w-md text-cocoa">
              Skincare, makeup, body care and fragrance made to look and feel good on every skin tone.
              Shop shades that include you, and have your order delivered to your door.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-primary">Shop Now</Link>
              <Link href="#collections" className="btn-secondary">Explore Collection</Link>
            </div>
          </div>
          <div className="rounded-3xl bg-ivory p-8 shadow-sm">
            <p className="font-serif text-3xl leading-snug">Colour, care and scent for deep, medium and light skin.</p>
            <ul className="mt-6 space-y-3 text-sm text-cocoa">
              <li>Sun care with no white cast</li>
              <li>Foundation and lipstick shades for every undertone</li>
              <li>Body care made for our weather</li>
              <li>Delivery across Nigeria</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="collections" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-3xl font-semibold">Shop by category</h2>
        {cats.data ? (
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cats.data.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="rounded-2xl border border-blush bg-ivory p-5 transition hover:bg-blush/50"
              >
                <span className="font-serif text-2xl">{c.name}</span>
                <span className="mt-1 block text-sm text-cocoa">{c.description}</span>
                <span className="mt-3 block text-xs text-rose-dark">{c.productCount} products</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-cocoa">Our categories are taking a moment to load. Please refresh the page.</p>
        )}
      </section>

      <ProductRow title="Featured" intro="Our most loved picks right now." href="/shop" products={featured.data?.items} />

      <section className="bg-ivory">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-2">
          <h2 className="text-4xl font-semibold leading-tight">Made with real skin in mind</h2>
          <p className="leading-relaxed text-cocoa">
            Rayora Beauty started with a simple frustration: too many products were made for one skin
            tone and one climate. We choose formulas that work in heat and humidity, and we build our
            shade ranges from deep to light, with warm, neutral and cool undertones. Every product is
            picked because it earns its place in your routine.
          </p>
        </div>
      </section>

      <ProductRow title="Best sellers" href="/shop?sort=popular" products={best.data?.items} />
      <ProductRow title="New arrivals" href="/shop?sort=newest" products={fresh.data?.items} />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-3xl font-semibold">Kind words</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-blush bg-ivory p-6">
              <blockquote className="text-cocoa">{t.text}</blockquote>
              <figcaption className="mt-4 text-sm font-medium">{t.name}, {t.place}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-3 text-xs text-cocoa">Sample customer comments for this demo store.</p>
      </section>
    </>
  );
}
