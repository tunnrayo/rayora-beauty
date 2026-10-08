import Link from "next/link";
import { formatNaira } from "@/lib/format";

async function checkApi(): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.API_URL ?? "http://localhost:4000"}/health`, {
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default async function HomePage() {
  const apiOnline = await checkApi();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <p className="text-sm uppercase tracking-widest text-gold">Welcome to Rayora Beauty</p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight sm:text-6xl">
        Beauty That Feels Like You
      </h1>
      <p className="mt-5 max-w-xl text-cocoa">
        Skincare, makeup, body care and fragrance chosen for every skin tone. Prices start from{" "}
        {formatNaira(6500)}.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/shop" className="btn-primary">Shop Now</Link>
        <Link href="/shop" className="btn-secondary">Explore Collection</Link>
      </div>

      <p
        className={`mt-12 inline-block rounded-full px-4 py-2 text-sm ${
          apiOnline ? "bg-blush text-charcoal" : "bg-rose text-ivory"
        }`}
      >
        {apiOnline ? "Setup check: API connected" : "Setup check: API not reachable"}
      </p>
    </section>
  );
}
