"use client";

export default function ConfirmButton({ message, children, className = "text-sm text-rose-dark underline underline-offset-4" }: {
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button type="submit" className={className} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
