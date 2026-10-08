export default function Rating({ value, count }: { value: number; count: number }) {
  const full = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span
      role="img"
      aria-label={`Rated ${value.toFixed(1)} out of 5 from ${count} reviews`}
      className="inline-flex items-center gap-1.5 text-xs text-cocoa"
    >
      <span aria-hidden="true" className="text-gold">
        {"★".repeat(full)}
        <span className="text-blush">{"★".repeat(5 - full)}</span>
      </span>
      <span aria-hidden="true">
        {value.toFixed(1)} ({count})
      </span>
    </span>
  );
}
