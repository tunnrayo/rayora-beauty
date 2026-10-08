type Props = { name: string; category: string; imageUrl: string | null; priority?: boolean };

/** Shows the product photo, or a clean placeholder until an image has been added. */
export default function ProductImage({ name, category, imageUrl, priority = false }: Props) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-blush/60">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={`${name} by Rayora Beauty`}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={`${name}, product photo coming soon`}
          className="flex h-full flex-col items-center justify-center p-4 text-center"
        >
          <span className="font-serif text-lg leading-snug text-cocoa">{name}</span>
          <span className="mt-2 text-xs uppercase tracking-widest text-rose-dark">{category}</span>
        </div>
      )}
    </div>
  );
}
