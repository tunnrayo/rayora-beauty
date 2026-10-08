const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** Formats a naira amount, e.g. 12500 becomes "₦12,500". */
export function formatNaira(amount: number): string {
  return naira.format(amount);
}
