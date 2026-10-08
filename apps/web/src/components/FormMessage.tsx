export default function FormMessage({ error, ok }: { error?: string | null; ok?: string | null }) {
  if (error) {
    return (
      <p role="alert" className="rounded-xl bg-rose-dark px-4 py-3 text-sm text-ivory">
        {error}
      </p>
    );
  }
  if (ok) {
    return (
      <p role="status" className="rounded-xl bg-blush px-4 py-3 text-sm text-charcoal">
        {ok}
      </p>
    );
  }
  return null;
}
