import FormMessage from "@/components/FormMessage";

export default function Flash({ error, saved }: { error?: string; saved?: string }) {
  return <div className="mb-4"><FormMessage error={error} ok={saved ? "Saved." : undefined} /></div>;
}
