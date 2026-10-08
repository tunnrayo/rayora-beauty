const styles: Record<string, string> = {
  pending: "bg-blush text-charcoal",
  confirmed: "bg-gold/30 text-charcoal",
  processing: "bg-gold/30 text-charcoal",
  shipped: "bg-cocoa text-ivory",
  delivered: "bg-charcoal text-ivory",
  cancelled: "bg-rose-dark text-ivory",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${styles[status] ?? "bg-blush"}`}>
      {status}
    </span>
  );
}
