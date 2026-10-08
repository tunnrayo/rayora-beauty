import Link from "next/link";

type Props = { title: string; message: string; actionHref?: string; actionLabel?: string };

export default function Notice({ title, message, actionHref, actionLabel }: Props) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h2 className="text-3xl font-semibold">{title}</h2>
      <p className="mt-3 text-cocoa">{message}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
